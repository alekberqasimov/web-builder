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
  await page.waitForFunction(()=>!!document.getElementById('v6PremiumFunctionalCss'));

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

  // Tabs: visible labels, real structured editor, add/edit path.
  await page.click('#blocksTab');
  await page.click('[data-add-block="tabsSection"]');
  await page.waitForSelector('#canvas .v5-section.selected .v5-tabs');
  const tabs=page.locator('#canvas .v5-section.selected .v5-tabs');
  const initialLabels=(await tabs.locator('[data-tab-index]').allTextContents()).map(x=>x.trim());
  assert.equal(initialLabels.length,3,'tabs preset should expose three starter tabs');
  assert.ok(initialLabels.every(Boolean),`tab labels must be visible: ${JSON.stringify(initialLabels)}`);
  const inactiveColor=await tabs.locator('[data-tab-index="1"]').evaluate(el=>getComputedStyle(el).color);
  assert.notEqual(inactiveColor,'rgba(0, 0, 0, 0)','inactive tab text must not be transparent');
  await tabs.click({position:{x:20,y:20}});
  await page.waitForSelector('#elementInspector [data-fx-tab-row]');
  assert.equal(await page.locator('#elementInspector [data-fx-tab-row]').count(),3,'tabs inspector should expose each tab');
  await page.fill('#elementInspector [data-fx-tab="label"][data-i="1"]','Процесс Premium');
  await page.fill('#elementInspector [data-fx-tab="content"][data-i="1"]','Этапы без пустых вкладок.');
  await page.waitForFunction(()=>[...document.querySelectorAll('#canvas .v5-section.selected [data-tab-index]')].some(x=>x.textContent.trim()==='Процесс Premium'));
  await page.click('#elementInspector [data-fx-tab-add]');
  await page.waitForFunction(()=>document.querySelectorAll('#canvas .v5-section.selected [data-tab-index]').length===4);

  // Floating WhatsApp / Telegram: simple customer inputs become real URLs and branded buttons.
  await page.click('#blocksTab');
  await page.click('[data-add-block="floatingContact"]');
  await page.waitForSelector('#canvas .v5-section.selected .v5-social[data-social-style="floating"]');
  const floating=page.locator('#canvas .v5-section.selected .v5-social[data-social-style="floating"]');
  await floating.click({position:{x:20,y:20}});
  await page.waitForSelector('#elementInspector [data-fx-social-row]');
  assert.equal(await page.locator('#elementInspector [data-fx-social-row]').count(),2,'floating contact should start with WhatsApp and Telegram');
  assert.equal(await page.locator('#elementInspector [data-fx-social-platform][data-i="0"]').inputValue(),'whatsapp');
  assert.equal(await page.locator('#elementInspector [data-fx-social-platform][data-i="1"]').inputValue(),'telegram');
  await page.fill('#elementInspector [data-fx-social-value][data-i="0"]','+994 50 123 45 67');
  await page.waitForFunction(()=>document.querySelector('#canvas .v5-section.selected .v5-social a')?.getAttribute('href')==='https://wa.me/994501234567');
  await page.fill('#elementInspector [data-fx-social-message][data-i="0"]','Salam Premium');
  await page.waitForFunction(()=>document.querySelector('#canvas .v5-section.selected .v5-social a')?.getAttribute('href')?.includes('text=Salam%20Premium'));
  await page.fill('#elementInspector [data-fx-social-value][data-i="1"]','brand_support');
  await page.waitForFunction(()=>document.querySelectorAll('#canvas .v5-section.selected .v5-social a')[1]?.getAttribute('href')==='https://t.me/brand_support');
  await page.selectOption('#elementInspector [data-fx-floating="position"]','left');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#canvas .v5-section.selected .v5-social')).left!=='auto');
  const brand=await page.evaluate(()=>{
    const links=[...document.querySelectorAll('#canvas .v5-section.selected .v5-social a')],icons=links.map(a=>a.querySelector('.v5-social-icon'));
    return{
      waBg:getComputedStyle(links[0]).backgroundColor,
      tgBg:getComputedStyle(links[1]).backgroundColor,
      waPseudo:getComputedStyle(icons[0],'::before').content,
      tgShape:getComputedStyle(icons[1],'::before').clipPath
    };
  });
  assert.notEqual(brand.waBg,brand.tgBg,'WhatsApp and Telegram should have distinct brand colors');
  assert.ok(brand.waPseudo&&brand.waPseudo!=='none','WhatsApp should expose a visual brand mark');
  assert.ok(brand.tgShape&&brand.tgShape!=='none','Telegram should expose a paper-plane brand mark');

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
    forms:[...document.querySelectorAll('#canvas .v5-form')].map(x=>({scroll:x.scrollWidth,client:x.clientWidth})),
    tabs:[...document.querySelectorAll('#canvas .v5-tabs')].map(x=>({scroll:x.scrollWidth,client:x.clientWidth}))
  }));
  assert.ok(mobile.frame<=391,`mobile functional preview frame is too wide: ${mobile.frame}`);
  assert.ok(mobile.canvasScroll<=mobile.canvasClient+2,'functional blocks create horizontal canvas overflow');
  assert.ok(mobile.forms.every(x=>x.scroll<=x.client+2),'form overflows its mobile container');
  assert.ok(mobile.tabs.every(x=>x.scroll<=x.client+2),'tabs overflow their mobile container');

  assert.deepEqual(errors,[],`Functional blocks page errors:\n${errors.join('\n')}`);
  console.log('V6_FUNCTIONAL_BLOCKS_E2E_OK');
  await context.close();
}finally{
  await browser.close();
}
