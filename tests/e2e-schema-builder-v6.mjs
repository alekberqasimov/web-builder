import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.stack||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  await page.click('#siteTab');
  await page.waitForSelector('#siteInspector input[data-site="siteUrl"]');
  await page.locator('#siteInspector input[data-site="siteUrl"]').fill('https://schema.example');
  await page.locator('#siteInspector input[data-site="siteUrl"]').dispatchEvent('change');

  await page.click('#seoTab');
  await page.waitForSelector('#v6SchemaBuilder',{timeout:10000});
  assert.match(await page.textContent('#v6SchemaBuilder'),/Visual Schema Builder/);

  await page.locator('#v6SchemaBuilder [data-schema-type]').selectOption('Product');
  await page.click('#v6SchemaBuilder [data-schema-add]');
  await page.waitForSelector('#v6SchemaBuilder [data-schema-card]');
  const card=page.locator('#v6SchemaBuilder [data-schema-card]').last();
  await card.locator('[data-schema-field="name"]').fill('Commercial Builder');
  await card.locator('[data-schema-field="name"]').dispatchEvent('change');
  await page.waitForTimeout(60);
  const fresh=page.locator('#v6SchemaBuilder [data-schema-card]').last();
  await fresh.locator('[data-schema-field="offers.price"]').fill('149');
  await fresh.locator('[data-schema-field="offers.price"]').dispatchEvent('change');
  await page.waitForTimeout(60);
  await page.locator('#v6SchemaBuilder [data-schema-card]').last().locator('[data-schema-field="offers.priceCurrency"]').fill('USD');
  await page.locator('#v6SchemaBuilder [data-schema-card]').last().locator('[data-schema-field="offers.priceCurrency"]').dispatchEvent('change');
  await page.waitForTimeout(60);
  await page.locator('#v6SchemaBuilder [data-schema-card]').last().locator('[data-schema-field="offers.availability"]').fill('https://schema.org/InStock');
  await page.locator('#v6SchemaBuilder [data-schema-card]').last().locator('[data-schema-field="offers.availability"]').dispatchEvent('change');
  await page.waitForTimeout(60);
  await page.locator('#v6SchemaBuilder [data-schema-card]').last().locator('[data-schema-primary]').check();
  await page.waitForTimeout(100);
  assert.match(await page.locator('#v6SchemaBuilder [data-schema-card]').last().textContent(),/Valid/);

  const exported=await page.evaluate(async()=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const moduleQuery=appSrc?new URL(appSrc).search:'';
    const load=path=>import(path+moduleQuery);
    const exp=await load('./v5-export.mjs');
    const runtime=await load('./v5-runtime.mjs');
    const project=runtime.state.project;
    const current=project.pages.find(p=>p.id===project.currentPageId)||project.pages[0];
    current.seo.title='Schema Builder Test';
    const html=exp.exportedDocument(project,current);
    const match=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    return{html,payload:match?JSON.parse(match[1]):null,count:(html.match(/application\/ld\+json/g)||[]).length,moduleQuery};
  });
  assert.equal(exported.count,1,'export must contain exactly one JSON-LD graph script');
  assert.ok(exported.payload,'schema payload missing');
  const graph=exported.payload['@graph'];
  const product=graph.find(x=>x['@type']==='Product');
  const webpage=graph.find(x=>x['@type']==='WebPage');
  assert.equal(product.name,'Commercial Builder');
  assert.equal(product.offers.price,'149');
  assert.equal(product.offers.priceCurrency,'USD');
  assert.equal(product.offers.availability,'https://schema.org/InStock');
  assert.deepEqual(webpage.mainEntity,{'@id':product['@id']});

  for(const width of [320,360,390,430]){
    await page.setViewportSize({width,height:820});
    await page.waitForTimeout(100);
    const fullyOpen=await page.evaluate(()=>{const s=document.querySelector('.right-sidebar'),r=s.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1});
    if(!fullyOpen)await page.click('#rightToggle');
    await page.waitForFunction(()=>{const s=document.querySelector('.right-sidebar'),r=s.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1});
    if(await page.locator('#seoInspector.hidden').count())await page.click('#seoTab');
    await page.waitForSelector('#v6SchemaBuilder');
    const geom=await page.evaluate(()=>{const el=document.querySelector('#v6SchemaBuilder'),r=el.getBoundingClientRect(),side=document.querySelector('.right-sidebar');return{left:r.left,right:r.right,viewport:innerWidth,doc:document.documentElement.scrollWidth,sideScroll:side.scrollWidth,sideClient:side.clientWidth}});
    assert.ok(geom.left>=-1&&geom.right<=geom.viewport+1,`${width}px schema builder escaped viewport: ${JSON.stringify(geom)}`);
    assert.ok(geom.doc<=geom.viewport+1,`${width}px document overflow: ${JSON.stringify(geom)}`);
    assert.ok(geom.sideScroll<=geom.sideClient+1,`${width}px schema inspector overflow: ${JSON.stringify(geom)}`);
  }

  assert.deepEqual(errors,[],`Schema Builder browser errors:\n${errors.join('\n')}`);
  console.log(`V6_SCHEMA_BUILDER_E2E_PASS${exported.moduleQuery?' VERSIONED':''}`);
}finally{await browser.close()}
