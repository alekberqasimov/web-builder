import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.click('#seoTab');
  await page.waitForSelector('#v6SeoAdvanced',{timeout:10000});
  assert.equal(await page.locator('#seoInspector input[data-seo="keywords"]').count(),0,'legacy meta keywords control must not be presented as active SEO');
  assert.equal(await page.locator('#v6SeoAdvanced [data-v6-page-seo="schemaType"]').count(),1,'advanced schema control missing');
  await page.click('#siteTab');
  await page.waitForSelector('#v6SiteSeo',{timeout:10000});
  await page.locator('#siteInspector input[data-site="siteUrl"]').fill('https://shop.example');
  await page.locator('#siteInspector input[data-site="siteUrl"]').dispatchEvent('change');
  await page.locator('#v6SiteSeo input[data-v6-site-seo="defaultOgImage"]').fill('/social.jpg');
  await page.locator('#v6SiteSeo input[data-v6-site-seo="defaultOgImage"]').dispatchEvent('change');
  await page.waitForTimeout(150);
  const exported=await page.evaluate(async()=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const moduleQuery=appSrc?new URL(appSrc).search:'';
    const load=path=>import(path+moduleQuery);
    const seo=await load('./v6-seo.mjs');
    const exp=await load('./v5-export.mjs');
    const runtime=await load('./v5-runtime.mjs');
    const project=runtime.state.project;
    if(!project)throw new Error(`Production runtime module identity mismatch: ${moduleQuery||'unversioned'}`);
    const current=project.pages.find(p=>p.id===project.currentPageId)||project.pages[0];
    current.seo.title='Production SEO Test';current.seo.description='Unique production description.';
    return{html:exp.exportedDocument(project,current),robots:seo.robotsText(project),sitemap:seo.sitemapXml(project),url:seo.publicPageUrl(project,current),issues:seo.seoAuditIssues(project),moduleQuery};
  });
  assert.equal(exported.url,'https://shop.example/','homepage canonical should use root URL instead of /index.html');
  assert.ok(exported.html.includes('<link rel="canonical" href="https://shop.example/">'),'canonical missing from exported HTML');
  assert.ok(exported.html.includes('<meta property="og:image" content="https://shop.example/social.jpg">'),'default social image did not become absolute');
  assert.ok(exported.html.includes('application/ld+json'),'generated JSON-LD missing');
  assert.ok(exported.robots.includes('Sitemap: https://shop.example/sitemap.xml'),'robots sitemap directive missing');
  assert.ok(exported.sitemap.includes('<loc>https://shop.example/</loc>'),'sitemap homepage URL wrong');
  assert.ok(!exported.html.includes('name="keywords"'),'meta keywords leaked into exported HTML');
  assert.deepEqual(errors,[],`SEO browser page errors:\n${errors.join('\n')}`);
  console.log(`V6_SEO_E2E_OK${exported.moduleQuery?' VERSIONED':''}`);
}finally{await browser.close()}
