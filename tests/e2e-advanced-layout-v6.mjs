import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const BASE=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:980}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});

try{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.waitForSelector('#canvas [data-node-id]');

  const container=page.locator('#canvas .v5-container[data-node-id]').first();
  await container.click({position:{x:20,y:20}});
  await page.waitForSelector('#v6AdvancedLayout');
  assert.match(await page.textContent('#v6AdvancedLayout'),/Advanced Layout/);

  await page.click('[data-al-key-button="display"][data-al-value="grid"]');
  await page.click('[data-al-track="repeat(3, minmax(0, 1fr))"]');
  const rowGap=page.locator('#v6AdvancedLayout [data-al-key="rowGap"]');
  await rowGap.fill('24px');
  await rowGap.dispatchEvent('change');
  await page.waitForTimeout(80);

  const selected=page.locator('#canvas .v5-selected-node');
  assert.equal(await selected.evaluate(el=>getComputedStyle(el).display),'grid');
  assert.equal(await selected.evaluate(el=>getComputedStyle(el).rowGap),'24px');
  assert.equal((await selected.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)),3);

  await page.click('[data-al-device="tablet"]');
  await page.waitForSelector('#v6AdvancedLayout');
  const tabletCols=page.locator('#v6AdvancedLayout [data-al-key="gridTemplateColumns"]');
  assert.equal(await tabletCols.inputValue(),'','tablet starts by inheriting desktop');
  await tabletCols.fill('repeat(2, minmax(0, 1fr))');
  await tabletCols.dispatchEvent('change');
  await page.waitForTimeout(60);

  await page.click('[data-al-device="desktop"]');
  await page.waitForSelector('#v6AdvancedLayout');
  assert.equal(await page.locator('#v6AdvancedLayout [data-al-key="gridTemplateColumns"]').inputValue(),'repeat(3, minmax(0, 1fr))','tablet edit must not rewrite desktop');

  const heading=page.locator('#canvas .v5-heading[data-node-id]').first();
  await heading.click();
  await page.waitForSelector('#v6AdvancedLayout');
  const grow=page.locator('#v6AdvancedLayout [data-al-key="flexGrow"]');
  await grow.fill('1');
  await grow.dispatchEvent('change');
  const colEnd=page.locator('#v6AdvancedLayout [data-al-key="gridColumnEnd"]');
  await colEnd.fill('span 2');
  await colEnd.dispatchEvent('change');
  await page.waitForTimeout(60);
  const selectedHeading=page.locator('#canvas .v5-heading.v5-selected-node');
  assert.equal(await selectedHeading.evaluate(el=>getComputedStyle(el).flexGrow),'1');
  assert.equal(await selectedHeading.evaluate(el=>getComputedStyle(el).gridColumnEnd),'span 2');

  for(const width of [320,360,390,430]){
    await page.setViewportSize({width,height:820});
    await page.waitForTimeout(80);
    if(await page.evaluate(()=>document.body.classList.contains('right-collapsed')))await page.click('#rightToggle');
    await page.waitForSelector('#v6AdvancedLayout');
    const geom=await page.evaluate(()=>{const el=document.querySelector('#v6AdvancedLayout'),r=el.getBoundingClientRect(),side=document.querySelector('.right-sidebar');return{left:r.left,right:r.right,width:r.width,viewport:innerWidth,doc:document.documentElement.scrollWidth,sideScroll:side.scrollWidth,sideClient:side.clientWidth}});
    assert.ok(geom.right<=geom.viewport+1&&geom.left>=-1,`${width}px advanced layout escaped viewport: ${JSON.stringify(geom)}`);
    assert.ok(geom.doc<=geom.viewport+1,`${width}px document overflow: ${JSON.stringify(geom)}`);
    assert.ok(geom.sideScroll<=geom.sideClient+1,`${width}px inspector overflow: ${JSON.stringify(geom)}`);
  }

  assert.deepEqual(errors,[],'advanced layout browser flow should have no page/console errors');
  console.log('V6_ADVANCED_LAYOUT_E2E_PASS');
}finally{await browser.close()}
