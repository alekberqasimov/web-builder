import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));

async function change(selector,value){
  const el=page.locator(selector);
  await el.fill(String(value));
  await el.dispatchEvent('change');
}

async function selectNodeThroughNavigator(node){
  const nodeId=await node.getAttribute('data-node-id');
  const blockId=await node.evaluate(el=>el.closest('[data-block-id]')?.dataset.blockId||'');
  assert.ok(nodeId&&blockId,'Navigator selection ids missing');
  const target=page.locator(`#navigatorTree [data-tree-node="${nodeId}"][data-block="${blockId}"] [data-tree-select-node="${nodeId}"]`);
  await target.waitFor({state:'attached'});
  await target.dispatchEvent('click',{bubbles:true,cancelable:true});
  await page.waitForFunction(id=>document.querySelector(`#canvas [data-node-id="${id}"]`)?.classList.contains('v5-selected-node'),nodeId);
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  // Add the repeatable Image + Text block through the actual library UI.
  await page.click('#blocksTab');
  await page.locator('[data-add-block="imageText"]').click();
  const imageTextSection=page.locator('#canvas .v5-section.selected');
  await imageTextSection.waitFor({state:'visible'});
  assert.match((await imageTextSection.innerText()),/Изображения с текстом/);

  // Item count is a block-level setting, so the user does not need to hunt for the inner grid.
  await page.waitForSelector('#blockInspector:not(.hidden) [data-repeat-image-text-count]');
  await change('#blockInspector [data-repeat-image-text-count]',254);
  await page.waitForFunction(()=>{
    const grids=document.querySelectorAll('#canvas .v5-section.selected .v5-container');
    const repeatGrid=grids[1];
    return repeatGrid&&[...repeatGrid.children].filter(x=>x.classList.contains('v5-container')).length===254;
  });
  const repeatCount=await page.locator('#canvas .v5-section.selected .v5-container').nth(1).evaluate(el=>[...el.children].filter(x=>x.classList.contains('v5-container')).length);
  assert.equal(repeatCount,254,'Image + Text manual item count did not create exactly 254 items');

  // Gallery must expose the same free 1..500 count control and render the exact count.
  await page.click('#blocksTab');
  await page.locator('[data-add-block="gallery"]').click();
  const gallerySection=page.locator('#canvas .v5-section.selected');
  const gallery=gallerySection.locator('.v5-gallery[data-node-id]');
  await gallery.waitFor({state:'visible'});
  await selectNodeThroughNavigator(gallery);
  await page.waitForSelector('#elementInspector:not(.hidden) [data-gallery-count]');
  await change('#elementInspector [data-gallery-count]',254);
  await page.waitForFunction(()=>document.querySelectorAll('#canvas .v5-section.selected .v5-gallery figure').length===254);
  assert.equal(await page.locator('#canvas .v5-section.selected .v5-gallery figure').count(),254,'Gallery manual item count did not create exactly 254 items');

  assert.deepEqual(pageErrors,[],`Browser page errors:\n${pageErrors.join('\n')}`);
  console.log('V6_REPEATABLE_E2E_OK');
}finally{
  await browser.close();
}
