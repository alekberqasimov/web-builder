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
  // Mobile editor shell must occupy the full viewport. This protects against
  // hidden sidebar grid columns squeezing the stage to ~50% width.
  const mobileContext=await browser.newContext({viewport:{width:360,height:800},deviceScaleFactor:1});
  const mobilePage=await mobileContext.newPage();
  await mobilePage.goto(base,{waitUntil:'domcontentloaded'});
  await mobilePage.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  const mobileLayout=await mobilePage.evaluate(()=>{
    const workspace=document.querySelector('.workspace')?.getBoundingClientRect();
    const stage=document.querySelector('.stage')?.getBoundingClientRect();
    const canvas=document.querySelector('#canvasFrame')?.getBoundingClientRect();
    return {innerWidth,workspace:workspace?.width||0,stage:stage?.width||0,stageLeft:stage?.left||0,stageRight:stage?.right||0,canvas:canvas?.width||0,left:document.querySelector('#leftToggle')?.textContent?.trim(),right:document.querySelector('#rightToggle')?.textContent?.trim()};
  });
  assert.ok(Math.abs(mobileLayout.workspace-mobileLayout.innerWidth)<=1,`mobile workspace width ${mobileLayout.workspace} != viewport ${mobileLayout.innerWidth}`);
  assert.ok(Math.abs(mobileLayout.stage-mobileLayout.innerWidth)<=1,`mobile stage width ${mobileLayout.stage} != viewport ${mobileLayout.innerWidth}`);
  assert.ok(mobileLayout.stageLeft>=-1&&mobileLayout.stageRight<=mobileLayout.innerWidth+1,`mobile stage escaped viewport: ${JSON.stringify(mobileLayout)}`);
  assert.ok(Math.abs(mobileLayout.canvas-mobileLayout.innerWidth)<=1,`mobile canvas width ${mobileLayout.canvas} != viewport ${mobileLayout.innerWidth}`);
  assert.equal(mobileLayout.left,'☰');
  assert.equal(mobileLayout.right,'⚙');
  await mobileContext.close();

  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  assert.match(await page.locator('.version').innerText(),/^v6\./);

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
  console.log('V6_E2E_OK');
}finally{
  await browser.close();
}
