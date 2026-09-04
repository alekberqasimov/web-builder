import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {stat} from 'node:fs/promises';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const errors=[];
const watch=p=>p.on('pageerror',e=>errors.push(String(e?.stack||e)));
const wait=ms=>new Promise(r=>setTimeout(r,ms));

async function stableBox(locator){
  for(let i=0;i<5;i++){
    try{await locator.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'nearest'}));await wait(60);const box=await locator.boundingBox();if(box)return box}catch{}
    await wait(80);
  }
  throw new Error('DnD element could not be resolved to stable geometry');
}
async function restoreHoverSource(source){
  try{
    const isBlockHandle=await source.evaluate(el=>el.classList.contains('v5-block-drag'));
    if(isBlockHandle){await source.locator('xpath=ancestor::*[@data-block-id][1]').hover();await wait(60)}
  }catch{}
}
async function stablePair(source,target){
  for(let i=0;i<6;i++){
    try{
      await source.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'nearest'}));
      await target.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'nearest'}));
      await source.evaluate(el=>el.scrollIntoView({block:'nearest',inline:'nearest'}));
      await restoreHoverSource(source);
      await wait(100);
      const sb=await source.boundingBox(),tb=await target.boundingBox();
      if(sb&&tb)return{sb,tb};
    }catch{}
    await wait(100);
  }
  throw new Error('DnD source/target could not share stable geometry');
}
async function realMouseDrag(page,source,target,{targetY=.7}={}){
  const{sb,tb}=await stablePair(source,target);
  const isElementSource=await source.evaluate(el=>!!el.dataset.nodeId);
  const sx=sb.x+sb.width/2,sy=sb.y+sb.height/2;
  const tx=tb.x+Math.min(Math.max(24,tb.width*.35),Math.max(24,tb.width-24));
  const ty=tb.y+Math.max(12,Math.min(tb.height-12,tb.height*targetY));
  await page.mouse.move(sx,sy);await page.mouse.down();
  await page.mouse.move(sx+10,sy+10,{steps:4});await wait(60);
  if(isElementSource)assert.equal(await source.evaluate(el=>el.classList.contains('pointer-element-source')),true,'element DnD gesture never activated');
  await page.mouse.move((sx+tx)/2,(sy+ty)/2,{steps:8});
  await page.mouse.move(tx,ty,{steps:12});await wait(100);
  if(isElementSource)assert.ok(await page.locator('#canvas .pointer-element-drop').count()>0,'element DnD activated but produced no drop plan');
  await page.mouse.up();await wait(220);
}

async function desktopSuite(){
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const page=await context.newPage();watch(page);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  const blocks=page.locator('#canvas>[data-block-id]');
  assert.ok(await blocks.count()>=4,'default project needs several blocks for DnD QA');
  const beforeOrder=await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId));
  const sourceBlockId=beforeOrder[1],targetBlockId=beforeOrder[2];
  const sourceBlock=page.locator(`#canvas>[data-block-id="${sourceBlockId}"]`);
  const targetBlock=page.locator(`#canvas>[data-block-id="${targetBlockId}"]`);
  await sourceBlock.hover();
  const handle=sourceBlock.locator('.v5-block-drag');await handle.waitFor({state:'visible'});
  await realMouseDrag(page,handle,targetBlock,{targetY:.78});
  const afterDrag=await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId));
  assert.notDeepEqual(afterDrag,beforeOrder,'mouse block DnD did not reorder blocks');
  await page.click('#undoBtn');assert.deepEqual(await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId)),beforeOrder,'Undo did not restore block order');
  await page.click('#redoBtn');assert.deepEqual(await blocks.evaluateAll(xs=>xs.map(x=>x.dataset.blockId)),afterDrag,'Redo did not restore block order');

  await page.click('#blocksTab');await page.selectOption('#blockCategory','layouts');
  await page.click('[data-add-block="layout1"]');
  const layoutA=page.locator('#canvas>[data-block-id]').last();const layoutAId=await layoutA.getAttribute('data-block-id');
  await page.click('#elementsTab');await page.click('[data-add-element="heading"]');
  const source0=page.locator(`#canvas>[data-block-id="${layoutAId}"] .v5-heading[data-node-id]`).last();const nodeId=await source0.getAttribute('data-node-id');
  await page.click('#blocksTab');await page.selectOption('#blockCategory','layouts');await page.click('[data-add-block="layout1"]');
  const layoutB=page.locator('#canvas>[data-block-id]').last();const targetId=await layoutB.locator('.v5-container[data-node-id]').first().getAttribute('data-node-id');
  assert.ok(layoutAId&&nodeId&&targetId,'could not create deterministic element DnD source/target');
  const source=page.locator(`#canvas [data-node-id="${nodeId}"]`),target=page.locator(`#canvas [data-node-id="${targetId}"]`);
  await realMouseDrag(page,source,target,{targetY:.35});
  assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${nodeId}"]`).count(),1,'mouse element DnD did not move element');
  await page.click('#undoBtn');assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${nodeId}"]`).count(),0,'Undo did not reverse element DnD');
  await page.click('#redoBtn');assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${nodeId}"]`).count(),1,'Redo did not reapply element DnD');

  await page.click('#elementsTab');await page.click('[data-add-element="image"]');
  await page.waitForSelector('#elementInspector:not(.hidden) [data-p="alt"]');await page.click('#siteTab');await page.waitForSelector('#v5AssetUpload');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#705cff"/></svg>';
  await page.locator('#v5AssetUpload').setInputFiles({name:'qa-asset.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
  const asset=page.locator('.v5-asset').filter({has:page.locator('input[value="qa-asset"]')}).first();await asset.waitFor({state:'visible'});await asset.locator('[data-asset-use]').click();
  const used=page.locator('#canvas img.v5-img[src^="data:image/svg+xml"]');await used.waitFor({state:'visible'});assert.equal(await used.getAttribute('alt'),'qa-asset','Asset use did not populate ALT');

  const hero=page.locator('#navigatorTree [data-tree-block]').filter({hasText:'Hero'}).first();await hero.locator('[data-tree-select-block]').click();
  page.once('dialog',d=>d.accept('QA Saved Block'));await page.click('#blockInspector [data-block-cmd="preset"]');await page.click('#siteTab');
  const saved=page.locator('#v5MyBlocksManager .v5-myblock-card').filter({has:page.locator('input[value="QA Saved Block"]')}).first();await saved.waitFor({state:'visible'});
  const n0=await blocks.count();await saved.locator('[data-myblock-add]').click();assert.equal(await blocks.count(),n0+1,'My Blocks add failed');

  await page.click('#blocksTab');await page.selectOption('#blockCategory','ready');await page.click('[data-add-block="faq"]');
  const faq=page.locator('#canvas .v5-accordion[data-node-id]').last();await faq.click();await page.waitForSelector('#elementInspector:not(.hidden) [data-repeat-add="accordion"]');
  const f0=await faq.locator('details').count();await page.click('#elementInspector [data-repeat-add="accordion"]');assert.equal(await page.locator('#canvas .v5-accordion').last().locator('details').count(),f0+1,'FAQ add item failed');

  const menu=page.locator('#navigatorTree [data-tree-block]').filter({hasText:'Menu'}).first();await menu.locator('[data-tree-select-block]').click();await page.click('#blockInspector [data-block-cmd="header"]');
  await page.click('#pagesTab');page.once('dialog',d=>d.accept('Global Page'));await page.click('#addPageInline');await page.waitForFunction(()=>document.querySelector('#pageLabel')?.textContent.includes('Global Page'));
  assert.ok(await page.locator('#canvas .v5-nav').count()>=1,'Global Header did not propagate');

  await page.click('#blocksTab');await page.click('[data-add-block="text"]');await page.click('#siteTab');await page.waitForSelector('#v5PageTemplates [data-page-template-save]');
  page.once('dialog',d=>d.accept('QA Page Template'));await page.click('#v5PageTemplates [data-page-template-save]');
  const tpl=page.locator('#v5PageTemplates .v5-page-template-card').filter({has:page.locator('input[value="QA Page Template"]')}).first();await tpl.waitFor({state:'visible'});
  page.once('dialog',d=>d.accept('Template Clone'));await tpl.locator('[data-page-template-add]').click();await page.waitForFunction(()=>document.querySelector('#pageLabel')?.textContent.includes('Template Clone'));
  assert.ok(await page.locator('#canvas .v5-nav').count()>=1,'Global Header missing on template page');assert.ok(await blocks.count()>=2,'Page template content missing');

  const [download]=await Promise.all([page.waitForEvent('download',{timeout:15000}),page.click('#downloadBtn')]);
  assert.match(download.suggestedFilename(),/\.zip$/i);const path=await download.path();assert.ok(path&&((await stat(path)).size>500),'ZIP missing or too small');
  const listing=execFileSync('unzip',['-l',path],{encoding:'utf8'});for(const f of['index.html','project.json','robots.txt','sitemap.xml'])assert.ok(listing.includes(f),`ZIP missing ${f}`);
  await context.close();
}

async function touchSuite(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();watch(page);
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('#canvas .v5-heading[data-node-id]',{timeout:15000});await page.evaluate(()=>document.body.classList.remove('left-collapsed','right-collapsed'));
  const src0=page.locator('#canvas .v5-heading[data-node-id]').first(),nodeId=await src0.getAttribute('data-node-id'),blockId=await src0.evaluate(el=>el.closest('[data-block-id]').dataset.blockId);
  const tgt0=page.locator(`#canvas>[data-block-id]:not([data-block-id="${blockId}"]) .v5-container[data-node-id]`).first(),targetId=await tgt0.getAttribute('data-node-id');
  assert.ok(nodeId&&targetId);const source=page.locator(`#canvas [data-node-id="${nodeId}"]`),target=page.locator(`#canvas [data-node-id="${targetId}"]`);const{sb,tb}=await stablePair(source,target);
  const sx=sb.x+Math.min(20,sb.width/2),sy=sb.y+Math.min(20,sb.height/2),tx=tb.x+Math.min(30,tb.width/2),ty=tb.y+Math.min(35,tb.height/2);
  await source.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:11,isPrimary:true,clientX:sx,clientY:sy,buttons:1});await wait(430);
  await source.dispatchEvent('pointermove',{pointerType:'touch',pointerId:11,isPrimary:true,clientX:tx,clientY:ty,buttons:1});await source.dispatchEvent('pointerup',{pointerType:'touch',pointerId:11,isPrimary:true,clientX:tx,clientY:ty,buttons:0});await wait(220);
  assert.equal(await page.locator(`#canvas [data-node-id="${targetId}"] [data-node-id="${nodeId}"]`).count(),1,'touch long-press DnD failed');await context.close();
}

try{await desktopSuite();await touchSuite();assert.deepEqual(errors,[],`Browser page errors:\n${errors.join('\n')}`);console.log('V5_DEEP_E2E_OK')}finally{await browser.close()}
