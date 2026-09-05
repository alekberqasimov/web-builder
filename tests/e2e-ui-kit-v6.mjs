import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});

async function desktop(){
  const context=await browser.newContext({viewport:{width:1908,height:900}});
  await context.addInitScript(()=>localStorage.setItem('wb:v6:theme','dark'));
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
  await heroHeading.click({position:{x:24,y:24}});
  await page.waitForSelector('#elementInspector .v6-premium-design-editor');
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

  // Layout Engine: a selected container gets responsive flex/grid controls and auto-fit behavior.
  await page.click('#elementTab');
  const firstContainer=page.locator('#canvas .v5-section.selected .v5-container').first();
  await firstContainer.click({position:{x:8,y:8}});
  await page.waitForSelector('#elementInspector [data-v6-direction]');
  await page.selectOption('#elementInspector [data-v6-direction]','row');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#canvas .v5-section.selected .v5-container')).flexDirection==='row');
  await page.click('#elementInspector [data-v6-grid-auto="240"]');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#canvas .v5-section.selected .v5-container')).gridTemplateColumns!=='none');
  const layoutState=await page.evaluate(async()=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const q=appSrc?new URL(appSrc).search:'';
    const runtime=await import('./v5-runtime.mjs'+q);const n=runtime.currentNode();return{base:n.style.base,mobile:n.style.mobile};
  });
  assert.match(String(layoutState.base.gridTemplateColumns),/auto-fit/,'responsive auto-grid model was not written');
  await page.click('#elementInspector [data-v6-stack-mobile]');
  const mobileGrid=await page.evaluate(async()=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const q=appSrc?new URL(appSrc).search:'';const runtime=await import('./v5-runtime.mjs'+q);return runtime.currentNode().style.mobile.gridTemplateColumns;
  });
  assert.equal(mobileGrid,'1fr','mobile one-column stack was not written to responsive model');

  // Media Studio: image composition and visual treatment must affect the actual canvas element.
  const heroImage=page.locator('#canvas .v5-section.selected img.v5-img').first();
  await heroImage.click({position:{x:12,y:12}});
  await page.waitForSelector('#elementInspector [data-v6-image-filter]');
  await page.selectOption('#elementInspector [data-v6-image-filter]','mono');
  await page.selectOption('#elementInspector [data-v6-image-hover]','zoom');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#canvas .v5-section.selected img.v5-img')).filter.includes('grayscale'));
  assert.match(await heroImage.evaluate(el=>getComputedStyle(el).filter),/grayscale/,'Media Studio filter did not affect rendered image');

  assert.deepEqual(errors,[],`UI kit desktop page errors:\n${errors.join('\n')}`);
  await context.close();
}

async function mobile(){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.click('#leftToggle');
  await page.waitForFunction(()=>!document.body.classList.contains('left-collapsed'));
  await page.waitForFunction(()=>{const r=document.querySelector('#leftSidebar')?.getBoundingClientRect();return r&&r.left>=-1});
  const m=await page.evaluate(()=>{
    const s=document.querySelector('#blocksPanel .search'),i=s.querySelector('input'),r=s.getBoundingClientRect(),ir=i.getBoundingClientRect();
    const tabs=[...document.querySelectorAll('.left-tabs button')].map(el=>({text:el.textContent.trim(),client:el.clientWidth,scroll:el.scrollWidth}));
    const premium=[...document.querySelectorAll('#blockList .library-card.is-premium')].map(el=>({client:el.clientWidth,scroll:el.scrollWidth,height:el.getBoundingClientRect().height}));
    return{display:getComputedStyle(s).display,search:{left:r.left,right:r.right,width:r.width,height:r.height},input:{left:ir.left,right:ir.right,width:ir.width,height:ir.height},tabs,premium,drawer:document.querySelector('#leftSidebar').getBoundingClientRect().width,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  assert.equal(m.display,'flex','mobile search must keep one-row flex layout');
  assert.ok(m.input.left>m.search.left+20&&m.input.right<=m.search.right-6,'mobile search text is clipped or outside the field');
  assert.ok(m.drawer<m.viewport*.92,'mobile drawer became a full-screen wall');
  assert.ok(m.scrollWidth<=m.viewport,'mobile builder has horizontal page overflow');
  for(const tab of m.tabs)assert.ok(tab.scroll<=tab.client+1,`mobile tab label is clipped: ${tab.text}`);
  assert.equal(m.premium.length,12,'mobile library lost premium variants');
  assert.ok(m.premium.every(x=>x.scroll<=x.client+1),'premium library card content creates horizontal overflow');
  assert.deepEqual(errors,[],`UI kit mobile page errors:\n${errors.join('\n')}`);
  await context.close();
}

try{
  await desktop();
  await mobile();
  console.log('V6_UI_KIT_E2E_OK');
}finally{
  await browser.close();
}
