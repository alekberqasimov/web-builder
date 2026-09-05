import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const BASE=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',msg=>{if(msg.type()==='error')errors.push(`console: ${msg.text()}`)});

try{
  await page.goto(BASE,{waitUntil:'networkidle'});
  await page.waitForSelector('#canvas > [data-block-id]');
  const initialCount=await page.locator('#canvas > [data-block-id]').count();
  assert.ok(initialCount>=5,'default project blocks should render');

  const hero=page.locator('#canvas > [data-block-id]').nth(1);
  await hero.evaluate(el=>el.dispatchEvent(new MouseEvent('click',{bubbles:true})));
  await page.waitForSelector('#v6ReuseSelection');

  page.once('dialog',d=>d.accept('Shared Hero'));
  await page.click('[data-reuse-cmd="make-component"]');
  await page.waitForSelector('#v6ReuseSelection .v6-reuse-linked');
  assert.match(await page.textContent('#v6ReuseSelection .v6-reuse-linked'),/Shared Hero/);

  await page.click('#siteTab');
  await page.waitForSelector('#v6ReuseManager');
  assert.match(await page.textContent('#v6ReuseManager'),/Shared Hero/);
  assert.match(await page.textContent('#v6ReuseManager'),/1/);

  await page.click('#v6ReuseManager [data-reuse-add]');
  await page.waitForSelector('#v6ReuseSelection .v6-reuse-linked');
  assert.equal(await page.locator('#canvas > [data-block-id]').count(),initialCount+1,'adding component creates one concrete block instance');

  const name=page.locator('#blockInspector [data-b="name"]');
  await name.fill('Synced Hero');
  await name.dispatchEvent('input');
  await page.waitForTimeout(80);
  const syncedNames=await page.locator('.v5-block-name').allTextContents();
  assert.equal(syncedNames.filter(x=>x.trim()==='Synced Hero').length,2,'edit once updates both component instances');

  page.once('dialog',d=>d.accept('section-premium'));
  await page.click('[data-reuse-cmd="create-class"]');
  await page.waitForSelector('.v6-reuse-chip');
  assert.match(await page.textContent('.v6-reuse-chip'),/section-premium/);

  const radius=page.locator('#blockInspector [data-bs="borderRadius"]');
  await radius.fill('37px');
  await radius.dispatchEvent('change');
  await page.waitForTimeout(60);
  const selectedSection=page.locator('#canvas > [data-block-id].selected');
  assert.equal(await selectedSection.evaluate(el=>getComputedStyle(el).borderRadius),'37px','local style remains above reusable class');

  await page.click('[data-reuse-cmd="detach-component"]');
  await page.waitForTimeout(50);
  assert.equal(await page.locator('#v6ReuseSelection .v6-reuse-linked').count(),0,'detached instance is local');
  const localName=page.locator('#blockInspector [data-b="name"]');
  await localName.fill('Local Hero');
  await localName.dispatchEvent('input');
  await page.waitForTimeout(80);
  const detachedNames=await page.locator('.v5-block-name').allTextContents();
  assert.equal(detachedNames.filter(x=>x.trim()==='Synced Hero').length,1);
  assert.equal(detachedNames.filter(x=>x.trim()==='Local Hero').length,1);

  await page.click('#siteTab');
  await page.waitForSelector('#v6ReuseManager');
  assert.match(await page.textContent('#v6StyleManager'),/section-premium/);
  assert.match(await page.textContent('#v6StyleManager'),/1/);

  page.once('dialog',d=>d.accept());
  await page.click('#v6ReuseManager [data-reuse-delete-component]');
  await page.waitForTimeout(80);
  assert.doesNotMatch(await page.textContent('#v6ReuseManager'),/Shared Hero/,'component definition is removed');
  assert.equal(await page.locator('#canvas > [data-block-id]').count(),initialCount+1,'deleting component keeps concrete page content');

  await page.setViewportSize({width:360,height:800});
  await page.waitForTimeout(120);
  await page.click('#rightToggle');
  await page.click('#siteTab');
  await page.waitForSelector('#v6StyleManager');
  const geom=await page.evaluate(()=>{const el=document.querySelector('#v6StyleManager'),r=el.getBoundingClientRect();return{left:r.left,right:r.right,width:r.width,viewport:innerWidth,scroll:document.documentElement.scrollWidth}});
  assert.ok(geom.width<=geom.viewport+1,'manager must fit mobile viewport');
  assert.ok(geom.right<=geom.viewport+1&&geom.left>=-1,'manager must stay inside mobile panel');
  assert.ok(geom.scroll<=geom.viewport+1,'reusable UI must not create horizontal page overflow');

  assert.deepEqual(errors,[],'browser should have no console/page errors');
  console.log('V6 reusable components E2E PASS');
} finally {
  await browser.close();
}
