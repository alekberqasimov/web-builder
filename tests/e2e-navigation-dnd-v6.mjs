import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.stack||e)));

async function selectNodeThroughNavigator(node){
  const nodeId=await node.getAttribute('data-node-id');
  const blockId=await node.evaluate(el=>el.closest('[data-block-id]')?.dataset.blockId||'');
  assert.ok(nodeId&&blockId,'Navigation selection ids missing');
  const target=page.locator(`#navigatorTree [data-tree-node="${nodeId}"][data-block="${blockId}"] [data-tree-select-node="${nodeId}"]`);
  await target.waitFor({state:'attached'});
  await target.dispatchEvent('click',{bubbles:true,cancelable:true});
  await page.waitForFunction(id=>document.querySelector(`#canvas [data-node-id="${id}"]`)?.classList.contains('v5-selected-node'),nodeId);
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const nav=page.locator('#canvas .v5-nav[data-node-id]').first();
  await nav.waitFor({state:'visible',timeout:15000});
  await page.evaluate(()=>document.body.classList.remove('left-collapsed','right-collapsed'));

  // Select navigation through the editor's delegated Navigator contract. This avoids
  // link/content hit-testing and verifies the same selection state used by the UI.
  await selectNodeThroughNavigator(nav);
  await page.waitForSelector('#elementInspector:not(.hidden) [data-v6-nav-desktop]');

  // Desktop navigation can explicitly switch between inline and dropdown modes.
  const desktopMode=page.locator('#elementInspector [data-v6-nav-desktop]');
  await desktopMode.selectOption('dropdown');
  await page.waitForSelector('#canvas .v5-nav.v5-nav-desktop-dropdown');
  const toggleDisplay=await page.locator('#canvas .v5-nav.v5-nav-desktop-dropdown .v5-nav-toggle').evaluate(el=>getComputedStyle(el).display);
  assert.notEqual(toggleDisplay,'none','Desktop dropdown mode must expose the menu toggle');

  // Mobile icon presets are editable and immediately reflected in the rendered nav.
  await page.locator('#elementInspector [data-v6-nav-icon-preset="⋮"]').click();
  await page.waitForFunction(()=>document.querySelector('#canvas .v5-nav-toggle')?.textContent?.trim()==='⋮');
  assert.equal((await page.locator('#canvas .v5-nav-toggle').textContent()).trim(),'⋮');

  // New controls follow the editor language.
  await page.selectOption('#uiLanguage','az');
  await page.waitForFunction(()=>document.querySelector('#elementInspector [data-v6-nav-desktop]')?.closest('label')?.textContent?.includes('Desktop menyu'));

  // Image + Text exposes the requested 1 / 3 / 6 / 9 shortcuts in addition to manual count.
  await page.click('#blocksTab');
  await page.locator('[data-add-block="imageText"]').click();
  await page.waitForSelector('#blockInspector:not(.hidden) [data-repeat-image-text-preset="3"]');
  const presets=await page.locator('#blockInspector [data-repeat-image-text-preset]').evaluateAll(xs=>xs.map(x=>Number(x.dataset.repeatImageTextPreset)));
  assert.deepEqual(presets,[1,3,6,9]);
  await page.locator('#blockInspector [data-repeat-image-text-preset="3"]').click();
  await page.waitForFunction(()=>Number(document.querySelector('#blockInspector [data-repeat-image-text-count]')?.value)===3);
  assert.equal(await page.locator('#canvas .v5-section.selected .v5-container').nth(1).evaluate(el=>[...el.children].filter(x=>x.classList.contains('v5-container')).length),3);

  assert.deepEqual(errors,[],`Browser page errors:\n${errors.join('\n')}`);
  console.log('V6_NAVIGATION_DND_E2E_OK');
}finally{
  await browser.close();
}
