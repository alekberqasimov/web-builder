import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
const pageErrors=[];
page.on('pageerror',e=>pageErrors.push(String(e?.stack||e)));

async function change(locator,value){await locator.fill(value);await locator.dispatchEvent('change')}
async function waitValue(selector,value){await page.waitForFunction(({selector,value})=>document.querySelector(selector)?.value===value,{selector,value})}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  assert.match(await page.locator('.version').innerText(),/^v5\./);

  // Public mobile menu must actually open in Preview.
  await page.click('#previewBtn');
  await page.waitForSelector('#previewDialog[open]');
  await page.selectOption('#previewDevice','mobile');
  const preview=page.frameLocator('#previewFrame');
  await preview.locator('.v5-nav-toggle').first().waitFor({state:'visible'});
  await preview.locator('.v5-nav-toggle').first().click();
  assert.equal(await preview.locator('.v5-nav').first().evaluate(el=>el.classList.contains('open')),true,'mobile nav did not open in preview');
  await page.click('#closePreview');

  // Create page and verify automatic slug lifecycle.
  await page.click('#pagesTab');
  page.once('dialog',d=>d.accept('Landing Test'));
  await page.click('#addPageInline');
  await page.waitForSelector('#pageInspector:not(.hidden)');
  assert.equal(await page.locator('[data-page="name"]').inputValue(),'Landing Test');
  assert.equal(await page.locator('[data-page="slug"]').inputValue(),'landing-test');
  await change(page.locator('[data-page="name"]'),'Pricing Test');
  await waitValue('[data-page="slug"]','pricing-test');

  // Add a Button through Elements. A blank page should get a layout automatically.
  await page.click('#elementsTab');
  await page.click('[data-add-element="button"]');
  await page.waitForSelector('#elementInspector:not(.hidden) [data-link="type"]');
  await change(page.locator('#elementInspector [data-p="text"]'),'Visit docs');

  // URL target must be an editable input, not a one-option select.
  await page.selectOption('#elementInspector [data-link="type"]','url');
  await page.waitForSelector('#elementInspector input[data-link-target]');
  const target=page.locator('#elementInspector input[data-link-target]');
  await change(target,'example.com/docs');
  await page.locator('#elementInspector [data-link-bool="newTab"]').check();
  const docsButton=page.locator('#canvas a.v5-btn[href="https://example.com/docs"]');
  await docsButton.waitFor({state:'visible'});
  assert.equal(await docsButton.getAttribute('target'),'_blank');
  assert.equal((await docsButton.innerText()).trim(),'Visit docs');

  // Persist -> reload -> state and resolved URL must survive.
  await page.waitForTimeout(450);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas a.v5-btn[href="https://example.com/docs"]',{timeout:15000});
  assert.match(await page.locator('#pageLabel').innerText(),/Pricing Test/);

  // Device switch must update the editor canvas.
  await page.click('[data-device="mobile"]');
  assert.equal(await page.locator('#canvas').getAttribute('data-device'),'mobile');

  // Preview uses the same saved/resolved link as Editor.
  await page.click('#previewBtn');
  await page.waitForSelector('#previewDialog[open]');
  const preview2=page.frameLocator('#previewFrame');
  const previewDocs=preview2.locator('a.v5-btn[href="https://example.com/docs"]');
  await previewDocs.waitFor({state:'visible'});
  assert.equal(await previewDocs.getAttribute('href'),'https://example.com/docs');
  assert.equal(await previewDocs.getAttribute('target'),'_blank');
  await page.click('#closePreview');

  assert.deepEqual(pageErrors,[],`Browser page errors:\n${pageErrors.join('\n')}`);
  console.log('V5_E2E_OK');
}finally{
  await browser.close();
}
