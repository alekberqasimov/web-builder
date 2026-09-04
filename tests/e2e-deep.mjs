import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {stat} from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const errors=[];
const watch=p=>p.on('pageerror',e=>errors.push(String(e?.stack||e)));
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function desktopSuite(){
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const page=await context.newPage();watch(page);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  // Real mouse block DnD + Undo/Redo.
  const blocks=page.locator('#canvas>[data-block-id]');
  assert.ok(await blocks.count()>=4,'default project needs several blocks for DnD QA');
  const beforeOrder=await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId));
  const sourceBlock=blocks.nth(1),targetBlock=blocks.nth(3);
  await sourceBlock.locator('.v5-block-drag').dragTo(targetBlock,{targetPosition:{x:24,y:24}});
  await page.waitForTimeout(150);
  const afterDrag=await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId));
  assert.notDeepEqual(afterDrag,beforeOrder,'mouse block DnD did not reorder blocks');
  await page.click('#undoBtn');
  assert.deepEqual(await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId)),beforeOrder,'Undo did not restore block order');
  await page.click('#redoBtn');
  assert.deepEqual(await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId)),afterDrag,'Redo did not restore dragged block order');

  // Real mouse element DnD across blocks + Undo/Redo.
  const source=page.locator('#canvas .v5-heading[data-node-id]').first();
  const sourceId=await source.getAttribute('data-node-id');
  const sourceBlockId=await source.evaluate(el=>el.closest('[data-block-id]').dataset.blockId);
  const target=page.locator(`#canvas>[data-block-id]:not([data-block-id="${sourceBlockId}"]) .v5-container[data-node-id]`).first();
  const targetId=await target.getAttribute('data-node-id');
  assert.ok(sourceId&&targetId,'could not resolve element DnD source/target');
  await source.dragTo(target,{targetPosition:{x:30,y:40}});
  await page.waitForTimeout(150);
  assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${sourceId}"]`).count(),1,'mouse element DnD did not move element into target container');
  await page.click('#undoBtn');
  assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${sourceId}"]`).count(),0,'Undo did not reverse element DnD');
  await page.click('#redoBtn');
  assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${sourceId}"]`).count(),1,'Redo did not reapply element DnD');

  // Add an Image, upload an Asset and reuse it on the selected Image.
  await page.click('#elementsTab');
  await page.click('[data-add-element="image"]');
  await page.waitForSelector('#elementInspector:not(.hidden) [data-p="alt"]');
  await page.click('#siteTab');
  await page.waitForSelector('#v5AssetUpload');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#705cff"/></svg>';
  await page.locator('#v5AssetUpload').setInputFiles({name:'qa-asset.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
  const assetCard=page.locator('.v5-asset').filter({has:page.locator('input[value="qa-asset"]')}).first();
  await assetCard.waitFor({state:'visible'});
  await assetCard.locator('[data-asset-use]').click();
  const usedImage=page.locator('#canvas img.v5-img[src^="data:image/svg+xml"]');
  await usedImage.waitFor({state:'visible'});
  assert.equal(await usedImage.getAttribute('alt'),'qa-asset','Asset Manager did not populate image ALT');

  // Save a regular block into My Blocks and add it back to the page.
  const heroTree=page.locator('#navigatorTree [data-tree-block]').filter({hasText:'Hero'}).first();
  await heroTree.locator('[data-tree-select-block]').click();
  await page.waitForSelector('#blockInspector:not(.hidden) [data-block-cmd="preset"]');
  page.once('dialog',d=>d.accept('QA Saved Block'));
  await page.click('#blockInspector [data-block-cmd="preset"]');
  await page.click('#siteTab');
  const savedBlock=page.locator('#v5MyBlocksManager .v5-myblock-card').filter({has:page.locator('input[value="QA Saved Block"]')}).first();
  await savedBlock.waitFor({state:'visible'});
  const countBeforePreset=await page.locator('#canvas>[data-block-id]').count();
  await savedBlock.locator('[data-myblock-add]').click();
  assert.equal(await page.locator('#canvas>[data-block-id]').count(),countBeforePreset+1,'My Blocks did not add a saved block');

  // FAQ repeater can grow beyond its default item count.
  await page.click('#blocksTab');
  await page.selectOption('#blockCategory','ready');
  await page.click('[data-add-block="faq"]');
  const faq=page.locator('#canvas .v5-accordion[data-node-id]').last();
  await faq.click();
  await page.waitForSelector('#elementInspector:not(.hidden) [data-repeat-add="accordion"]');
  const faqBefore=await faq.locator('details').count();
  await page.click('#elementInspector [data-repeat-add="accordion"]');
  const faqAfter=await page.locator('#canvas .v5-accordion').last().locator('details').count();
  assert.equal(faqAfter,faqBefore+1,'FAQ Add item did not increase repeater count');

  // Mark Menu as Global Header, then create a page: header must propagate.
  const menuTree=page.locator('#navigatorTree [data-tree-block]').filter({hasText:'Menu'}).first();
  await menuTree.locator('[data-tree-select-block]').click();
  await page.waitForSelector('#blockInspector [data-block-cmd="header"]');
  await page.click('#blockInspector [data-block-cmd="header"]');
  await page.click('#pagesTab');
  page.once('dialog',d=>d.accept('Global Page'));
  await page.click('#addPageInline');
  await page.waitForFunction(()=>document.querySelector('#pageLabel')?.textContent.includes('Global Page'));
  assert.ok(await page.locator('#canvas .v5-nav').count()>=1,'Global Header did not propagate to a newly created page');

  // Page Template: save current page and create another page from it.
  await page.click('#blocksTab');
  await page.click('[data-add-block="text"]');
  await page.click('#siteTab');
  await page.waitForSelector('#v5PageTemplates [data-page-template-save]');
  page.once('dialog',d=>d.accept('QA Page Template'));
  await page.click('#v5PageTemplates [data-page-template-save]');
  const tpl=page.locator('#v5PageTemplates .v5-page-template-card').filter({has:page.locator('input[value="QA Page Template"]')}).first();
  await tpl.waitFor({state:'visible'});
  page.once('dialog',d=>d.accept('Template Clone'));
  await tpl.locator('[data-page-template-add]').click();
  await page.waitForFunction(()=>document.querySelector('#pageLabel')?.textContent.includes('Template Clone'));
  assert.ok(await page.locator('#canvas .v5-nav').count()>=1,'Global Header missing on page created from template');
  assert.ok(await page.locator('#canvas>[data-block-id]').count()>=2,'Page Template did not preserve page content');

  // Browser ZIP export must download a real archive with core site files.
  const [download]=await Promise.all([page.waitForEvent('download',{timeout:15000}),page.click('#downloadBtn')]);
  const name=download.suggestedFilename();
  assert.match(name,/\.zip$/i,'Download site did not produce ZIP');
  const path=await download.path();
  assert.ok(path,'Playwright did not receive ZIP path');
  assert.ok((await stat(path)).size>500,'ZIP download is unexpectedly small');
  const listing=execFileSync('unzip',['-l',path],{encoding:'utf8'});
  for(const required of ['index.html','project.json','robots.txt','sitemap.xml'])assert.ok(listing.includes(required),`ZIP is missing ${required}`);

  await context.close();
}

async function touchSuite(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();watch(page);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas .v5-heading[data-node-id]',{timeout:15000});
  // Open editor panels on narrow viewport so canvas is interactable.
  await page.evaluate(()=>document.body.classList.remove('left-collapsed','right-collapsed'));
  const source=page.locator('#canvas .v5-heading[data-node-id]').first();
  const info=await source.evaluate(el=>({nodeId:el.dataset.nodeId,blockId:el.closest('[data-block-id]').dataset.blockId}));
  const target=page.locator(`#canvas>[data-block-id]:not([data-block-id="${info.blockId}"]) .v5-container[data-node-id]`).first();
  const targetId=await target.getAttribute('data-node-id');
  const sb=await source.boundingBox(),tb=await target.boundingBox();
  assert.ok(sb&&tb&&targetId,'touch DnD geometry unavailable');
  const sx=sb.x+Math.min(20,sb.width/2),sy=sb.y+Math.min(20,sb.height/2),tx=tb.x+Math.min(30,tb.width/2),ty=tb.y+Math.min(35,tb.height/2);
  await source.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:11,isPrimary:true,clientX:sx,clientY:sy,buttons:1});
  await wait(430);
  await source.dispatchEvent('pointermove',{pointerType:'touch',pointerId:11,isPrimary:true,clientX:tx,clientY:ty,buttons:1});
  await source.dispatchEvent('pointerup',{pointerType:'touch',pointerId:11,isPrimary:true,clientX:tx,clientY:ty,buttons:0});
  await page.waitForTimeout(200);
  assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${info.nodeId}"]`).count(),1,'touch long-press DnD did not move element');
  await context.close();
}

try{
  await desktopSuite();
  await touchSuite();
  assert.deepEqual(errors,[],`Browser page errors:\n${errors.join('\n')}`);
  console.log('V5_DEEP_E2E_OK');
}finally{
  await browser.close();
}
