import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});

async function desktop(){
  const context=await browser.newContext({viewport:{width:1908,height:900}});
  await context.addInitScript(()=>{if(window===window.top)localStorage.setItem('wb:v6:theme','dark')});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForSelector('#navigatorTab');

  const metrics=await page.evaluate(()=>{
    const rect=sel=>{const r=document.querySelector(sel).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
    const overflow=sel=>[...document.querySelectorAll(sel)].map(el=>({text:el.textContent.trim(),client:el.clientWidth,scroll:el.scrollWidth,fontWeight:getComputedStyle(el).fontWeight}));
    const search=document.querySelector('#blocksPanel .search');
    const input=search.querySelector('input');
    const icon=search.querySelector('span');
    const sr=search.getBoundingClientRect(),ir=input.getBoundingClientRect(),xr=icon.getBoundingClientRect();
    const stage=document.querySelector('.stage').getBoundingClientRect();
    const frame=document.querySelector('#canvasFrame').getBoundingClientRect();
    return{
      version:document.querySelector('.version')?.textContent.trim(),
      kitLoaded:[...document.styleSheets].some(s=>String(s.href||'').includes('v6-ui-kit.css')),
      left:rect('#leftSidebar'),right:rect('#rightSidebar'),
      leftTabs:overflow('.left-tabs button'),rightTabs:overflow('.right-tabs button'),
      search:{display:getComputedStyle(search).display,rect:{x:sr.x,y:sr.y,width:sr.width,height:sr.height,right:sr.right,bottom:sr.bottom},input:{x:ir.x,y:ir.y,width:ir.width,height:ir.height,right:ir.right,bottom:ir.bottom},icon:{x:xr.x,y:xr.y,width:xr.width,height:xr.height,right:xr.right,bottom:xr.bottom}},
      brandWeight:getComputedStyle(document.querySelector('.brand-name')).fontWeight,
      actionWeight:getComputedStyle(document.querySelector('#newBtn')).fontWeight,
      canvas:{stageLeft:stage.left,stageRight:stage.right,frameLeft:frame.left,frameRight:frame.right}
    };
  });

  assert.equal(metrics.version,'v6.4','production chrome should expose V6.4 UI kit version');
  assert.equal(metrics.kitLoaded,true,'V6 UI kit stylesheet is not loaded');
  assert.ok(metrics.left.width>=320,'desktop library panel is too cramped');
  assert.ok(metrics.right.width>=350,'desktop inspector panel is too cramped');
  for(const tab of [...metrics.leftTabs,...metrics.rightTabs])assert.ok(tab.scroll<=tab.client+1,`tab label is clipped: ${tab.text}`);
  assert.equal(metrics.search.display,'flex','search label regressed to grid layout');
  assert.ok(metrics.search.input.x>metrics.search.icon.x,'search input must stay beside the icon');
  assert.ok(metrics.search.input.y>=metrics.search.rect.y&&metrics.search.input.bottom<=metrics.search.rect.bottom+1,'search input is vertically outside its control');
  assert.ok(Math.abs((metrics.search.icon.y+metrics.search.icon.height/2)-(metrics.search.input.y+metrics.search.input.height/2))<3,'search icon and text are not vertically aligned');
  assert.ok(Number.parseInt(metrics.brandWeight)<=800,'brand typography is too heavy');
  assert.ok(Number.parseInt(metrics.actionWeight)<=700,'toolbar typography is too heavy');
  assert.ok(metrics.canvas.frameLeft>=metrics.canvas.stageLeft-1&&metrics.canvas.frameRight<=metrics.canvas.stageRight+1,'desktop canvas is clipped behind a pinned sidebar');

  // Premium library must be discoverable, visually marked and genuinely editable.
  await page.waitForSelector('[data-add-block="premiumHeroSaas"]');
  assert.equal(await page.locator('#blockList .library-card.is-premium').count(),12,'premium ready library should expose twelve variants');
  assert.equal((await page.locator('[data-add-block="premiumHeroSaas"] .v6-premium-badge').textContent()).trim(),'PRO','premium library card badge is missing');
  await page.click('[data-add-block="premiumHeroSaas"]');
  await page.waitForSelector('#canvas .v5-section.selected h1.v5-heading');
  const heroHeading=page.locator('#canvas .v5-section.selected h1.v5-heading');
  const heroHeadingId=await heroHeading.getAttribute('data-node-id');
  assert.ok(heroHeadingId,'premium hero heading id is missing');
  // Exercise the editor's delegated canvas-selection contract directly. This keeps
  // the UI-kit test independent from Chromium hit-testing/contenteditable focus.
  await heroHeading.dispatchEvent('click',{bubbles:true,cancelable:true});
  await page.waitForFunction(id=>{
    const panel=document.querySelector('#elementInspector');
    const selected=document.querySelector(`#canvas [data-node-id="${id}"]`);
    return !panel?.classList.contains('hidden')&&selected?.classList.contains('v5-selected-node');
  },heroHeadingId);
  await page.waitForSelector('#elementInspector .v6-premium-design-editor',{timeout:10000});
  await page.click('#elementInspector [data-v6-max-width="720px"]');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#canvas .v5-section.selected h1.v5-heading')).maxWidth==='720px');
  assert.equal(await heroHeading.evaluate(el=>getComputedStyle(el).maxWidth),'720px','Quick Design text measure did not affect the selected heading');

  // Global design system must update the exported theme without rewriting local element styles.
  await page.click('#siteTab');
  await page.waitForSelector('#v6DesignSystem');
  await page.selectOption('#v6DesignSystem [data-v6-ds="preset"]','commerce');
  await page.waitForFunction(async()=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const q=appSrc?new URL(appSrc).search:'';
    const runtime=await import('./v5-runtime.mjs'+q);
    return runtime.state.project?.theme?.designPreset==='commerce';
  });
  const designExport=await page.evaluate(async()=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const q=appSrc?new URL(appSrc).search:'';
    const runtime=await import('./v5-runtime.mjs'+q),exp=await import('./v5-export.mjs'+q);
    const project=runtime.state.project,page=project.pages.find(p=>p.id===project.currentPageId)||project.pages[0];
    return{preset:project.theme.designPreset,primary:project.theme.colors.primary,width:project.theme.containerWidth,html:exp.exportedDocument(project,page)};
  });
  assert.equal(designExport.preset,'commerce','global design preset did not persist');
  assert.equal(designExport.primary,'#0F766E','global palette did not apply');
  assert.equal(designExport.width,1200,'global container width did not apply');
  assert.ok(designExport.html.includes('background:#0F766E'),'global primary did not reach exported CSS');
  assert.ok(designExport.html.includes('width:min(100%,1200px)'),'global container width did not reach exported CSS');

  // Layout Engine: select the actual root container through Navigator, then edit it.
  const rootContainerId=await page.evaluate(async()=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const q=appSrc?new URL(appSrc).search:'';
    const runtime=await import('./v5-runtime.mjs'+q);
    const p=runtime.state.project.pages.find(p=>p.id===runtime.state.project.currentPageId)||runtime.state.project.pages[0];
    return p.blocks.find(b=>b.id===runtime.state.selectedBlockId)?.root?.id||'';
  });
  assert.ok(rootContainerId,'premium block root container was not found');
  await page.click('#navigatorTab');
  const rootTree=page.locator(`#navigatorTree [data-tree-node="${rootContainerId}"] [data-tree-select-node="${rootContainerId}"]`);
  await rootTree.waitFor({state:'attached'});
  await rootTree.dispatchEvent('click',{bubbles:true,cancelable:true});
  await page.waitForSelector('#elementInspector .v6-premium-design-editor [data-v6-layout]');
  await page.selectOption('#elementInspector [data-v6-layout]','grid');
  await page.selectOption('#elementInspector [data-v6-columns]','2');
  await page.waitForFunction(id=>getComputedStyle(document.querySelector(`#canvas [data-node-id="${id}"]`)).display==='grid',rootContainerId);

  assert.deepEqual(errors,[],`Desktop page errors:\n${errors.join('\n')}`);
  await context.close();
}

async function mobile(){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(()=>{if(window===window.top)localStorage.setItem('wb:v6:theme','dark')});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  const metrics=await page.evaluate(()=>({
    scrollWidth:document.documentElement.scrollWidth,innerWidth,
    topbar:document.querySelector('.topbar').getBoundingClientRect().width,
    toolbar:document.querySelector('.editor-toolbar').getBoundingClientRect().width,
    frame:document.querySelector('#canvasFrame').getBoundingClientRect().width,
    brandDisplay:getComputedStyle(document.querySelector('.brand-name')).display
  }));
  assert.ok(metrics.scrollWidth<=metrics.innerWidth+1,'mobile shell has horizontal document overflow');
  assert.ok(metrics.topbar<=metrics.innerWidth+1&&metrics.toolbar<=metrics.innerWidth+1,'mobile chrome exceeds viewport');
  assert.ok(metrics.frame<=metrics.innerWidth+1,'mobile canvas frame exceeds viewport');
  assert.notEqual(metrics.brandDisplay,'none','mobile keeps compact product identity visible');
  assert.deepEqual(errors,[],`Mobile page errors:\n${errors.join('\n')}`);
  await context.close();
}

try{
  await desktop();
  await mobile();
  console.log('V6_UI_KIT_E2E_OK');
}finally{
  await browser.close();
}
