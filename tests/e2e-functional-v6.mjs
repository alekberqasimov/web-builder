import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:950}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForSelector('[data-add-block="form"]');
  await page.waitForFunction(()=>[...document.styleSheets].some(s=>String(s.href||'').includes('v6-functional.css')),{timeout:10000});

  // Contact/Form Builder through the real library and inspector.
  await page.click('[data-add-block="form"]');
  await page.waitForSelector('#canvas .v5-section.selected .v5-form');
  await page.locator('#canvas .v5-section.selected .v5-form').click({position:{x:20,y:20}});
  await page.waitForSelector('#elementInspector:not(.hidden) .fx-functional-editor');
  const originalFields=await page.locator('#elementInspector [data-fx-field-row]').count();
  assert.ok(originalFields>=5,'contact form should start with useful default fields');
  await page.selectOption('#elementInspector [data-fx-sub="provider"]','web3forms');
  await page.waitForSelector('#elementInspector [data-fx-sub="accessKey"]');
  await page.fill('#elementInspector [data-fx-sub="accessKey"]','demo-access-key');
  await page.fill('#elementInspector [data-fx-sub="successMessage"]','Message received');
  await page.click('#elementInspector [data-fx-field-add]');
  await page.waitForFunction(count=>document.querySelectorAll('#elementInspector [data-fx-field-row]').length===count+1,originalFields);
  assert.equal(await page.locator('#elementInspector [data-fx-field-row]').count(),originalFields+1,'form field add control failed');

  // Reviews slider.
  await page.click('#blocksTab');
  await page.click('[data-add-block="reviewsSlider"]');
  await page.waitForSelector('#canvas .v5-section.selected .v5-reviews');
  assert.equal(await page.locator('#canvas .v5-section.selected .v5-review-card').count(),3,'reviews slider should render three starter reviews');
  await page.locator('#canvas .v5-section.selected .v5-reviews').click({position:{x:20,y:20}});
  await page.waitForSelector('#elementInspector:not(.hidden) .fx-functional-editor');
  await page.click('#elementInspector [data-fx-review-add]');
  await page.waitForFunction(()=>document.querySelectorAll('#canvas .v5-section.selected .v5-review-card').length===4);

  // Video and social blocks are exposed as ready blocks too.
  await page.click('#blocksTab');
  await page.click('[data-add-block="videoSection"]');
  await page.waitForSelector('#canvas .v5-section.selected .v5-video');
  await page.click('#blocksTab');
  await page.click('[data-add-block="socialSection"]');
  await page.waitForSelector('#canvas .v5-section.selected .v5-social');
  assert.ok(await page.locator('#canvas .v5-section.selected .v5-social a').count()>=4,'social block should expose starter platforms');

  // Functional blocks must obey simulated mobile mode, not desktop viewport width.
  await page.click('.device-switch [data-device="mobile"]');
  await page.waitForFunction(()=>document.querySelector('#canvas')?.dataset.device==='mobile');
  await page.waitForTimeout(80);
  const mobile=await page.evaluate(()=>({
    frame:document.querySelector('#canvasFrame')?.getBoundingClientRect().width||0,
    canvasScroll:document.querySelector('#canvas')?.scrollWidth||0,
    canvasClient:document.querySelector('#canvas')?.clientWidth||0,
    formFields:[...document.querySelectorAll('#canvas .v5-form-field')].map(x=>x.getBoundingClientRect().width),
    forms:[...document.querySelectorAll('#canvas .v5-form')].map(x=>({scroll:x.scrollWidth,client:x.clientWidth}))
  }));
  assert.ok(mobile.frame<=391,`mobile functional preview frame is too wide: ${mobile.frame}`);
  assert.ok(mobile.canvasScroll<=mobile.canvasClient+2,'functional blocks create horizontal canvas overflow');
  assert.ok(mobile.forms.every(x=>x.scroll<=x.client+2),'form overflows its mobile container');

  assert.deepEqual(errors,[],`Functional blocks page errors:\n${errors.join('\n')}`);
  console.log('V6_FUNCTIONAL_BLOCKS_E2E_OK');
  await context.close();
}finally{
  await browser.close();
}
