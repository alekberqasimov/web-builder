import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.stack||e)));

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.click('#blocksTab');
  await page.selectOption('#blockCategory','ready');
  await page.locator('[data-add-block="premiumFaqSplit"]').click();

  const faq=page.locator('#canvas .v5-accordion[data-node-id]').last();
  await faq.waitFor({state:'visible'});
  const faqId=await faq.getAttribute('data-node-id');
  const blockId=await faq.evaluate(el=>el.closest('[data-block-id]')?.dataset.blockId||'');
  assert.ok(faqId&&blockId,'FAQ selection ids missing');

  // Navigator can be visually collapsed by the editor shell. We need the actual
  // delegated navigator selection event, not viewport geometry, for this contract.
  const treeTarget=page.locator(`#navigatorTree [data-tree-node="${faqId}"][data-block="${blockId}"] [data-tree-select-node="${faqId}"]`);
  await treeTarget.waitFor({state:'attached'});
  await treeTarget.dispatchEvent('click',{bubbles:true,cancelable:true});
  await page.waitForFunction(id=>{
    const panel=document.querySelector('#elementInspector');
    const selected=document.querySelector(`#canvas [data-node-id="${id}"]`);
    return !panel?.classList.contains('hidden')&&
      !!panel?.querySelector('[data-repeat-add="accordion"]')&&
      selected?.classList.contains('v5-selected-node');
  },faqId);
  assert.equal(await page.locator('#elementInspector [data-repeat-add="accordion"]').count(),1,'Accordion base editor missing');
  assert.equal(await page.locator('#elementInspector [data-fx-accordion-add]').count(),1,'Accordion premium editor missing');

  const before=await faq.locator('details').count();
  await page.locator('#elementInspector [data-repeat-add="accordion"]').click();
  await page.waitForFunction(n=>document.querySelectorAll('#canvas .v5-accordion details').length>=n+1,before);

  assert.deepEqual(errors,[],`page errors:\n${errors.join('\n')}`);
  console.log('V6_SELECTION_INSPECTOR_OK');
}finally{
  await context.close();
  await browser.close();
}
