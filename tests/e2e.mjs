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
  // V6 mobile shell: stage/canvas must occupy the viewport and panels must be overlays.
  const mobileContext=await browser.newContext({viewport:{width:360,height:800},deviceScaleFactor:1});
  const mobilePage=await mobileContext.newPage();
  await mobilePage.goto(base,{waitUntil:'domcontentloaded'});
  await mobilePage.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  const mobileLayout=await mobilePage.evaluate(()=>{
    const rect=s=>document.querySelector(s)?.getBoundingClientRect();
    const workspace=rect('.workspace'),stage=rect('.stage'),canvas=rect('#canvasFrame');
    return {innerWidth,workspace:workspace?.width||0,stage:stage?.width||0,stageLeft:stage?.left||0,stageRight:stage?.right||0,canvas:canvas?.width||0,left:document.querySelector('#leftToggle')?.textContent?.trim(),right:document.querySelector('#rightToggle')?.textContent?.trim(),leftCollapsed:document.body.classList.contains('left-collapsed'),rightCollapsed:document.body.classList.contains('right-collapsed')};
  });
  assert.ok(Math.abs(mobileLayout.workspace-mobileLayout.innerWidth)<=1,`mobile workspace width ${mobileLayout.workspace} != viewport ${mobileLayout.innerWidth}`);
  assert.ok(Math.abs(mobileLayout.stage-mobileLayout.innerWidth)<=1,`mobile stage width ${mobileLayout.stage} != viewport ${mobileLayout.innerWidth}`);
  assert.ok(mobileLayout.stageLeft>=-1&&mobileLayout.stageRight<=mobileLayout.innerWidth+1,`mobile stage escaped viewport: ${JSON.stringify(mobileLayout)}`);
  assert.ok(Math.abs(mobileLayout.canvas-mobileLayout.innerWidth)<=1,`mobile canvas width ${mobileLayout.canvas} != viewport ${mobileLayout.innerWidth}`);
  assert.equal(mobileLayout.left,'☰');
  assert.equal(mobileLayout.right,'⚙');
  assert.equal(mobileLayout.leftCollapsed,true,'left panel must start closed on mobile');
  assert.equal(mobileLayout.rightCollapsed,true,'right panel must start closed on mobile');

  // Mobile library must open as an overlay without squeezing the stage.
  await mobilePage.click('#leftToggle');
  await mobilePage.waitForFunction(()=>!document.body.classList.contains('left-collapsed'));
  const panelLayout=await mobilePage.evaluate(()=>({stage:document.querySelector('.stage').getBoundingClientRect().width,panel:document.querySelector('.left-sidebar').getBoundingClientRect().width,viewport:innerWidth,backdrop:getComputedStyle(document.querySelector('#panelBackdrop')).display}));
  assert.ok(Math.abs(panelLayout.stage-panelLayout.viewport)<=1,'opening mobile panel squeezed stage');
  assert.ok(panelLayout.panel>280&&panelLayout.panel<=panelLayout.viewport,'mobile library panel width is unusable');
  assert.notEqual(panelLayout.backdrop,'none','mobile panel backdrop did not open');
  await mobilePage.click('[data-close-panel="left"]');
  await mobilePage.waitForFunction(()=>document.body.classList.contains('left-collapsed'));
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

  // Manual canvas width remains explicit and is not reduced to a preset.
  await page.fill('#customWidth','1369');
  await page.locator('#customWidth').dispatchEvent('change');
  assert.equal(await page.locator('#canvasFrame').evaluate(el=>el.style.width),'1369px');
  assert.equal(await page.locator('#canvasFrame').getAttribute('data-custom-width'),'1');

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
