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
  await page.waitForFunction(()=>document.querySelector('#blockCategory option[value="custom"]'));
  await page.selectOption('#blockCategory','custom');
  await page.waitForSelector('[data-add-block="custom-3"]');
  assert.equal(await page.locator('#blockList [data-add-block^="custom-"]').count(),7,'custom section catalog should expose 7 layouts');
  await page.click('[data-add-block="custom-3"]');
  await page.waitForFunction(()=>document.querySelectorAll('#canvas .v5-section.selected .v5-container-empty').length>=3);
  const selected=page.locator('#canvas .v5-section.selected');
  assert.equal(await selected.locator('.v5-container-empty').count(),3,'3-column custom section should expose three empty drop places');
  const firstEmpty=selected.locator('.v5-container-empty').first();
  await firstEmpty.locator('[data-inline-add]').click();
  await page.waitForSelector('#elementsPanel:not(.hidden)');
  await page.click('[data-add-element="heading"]');
  await page.waitForFunction(()=>document.querySelectorAll('#canvas .v5-section.selected .v5-heading').length>=1);
  assert.equal(await selected.locator('.v5-heading').count()>=1,true,'inline add place should add an element into the selected container');
  assert.deepEqual(errors,[],`Custom section page errors:\n${errors.join('\n')}`);
  await context.close();
  console.log('V6_CUSTOM_SECTION_E2E_OK');
}finally{
  await browser.close();
}
