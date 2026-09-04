import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const errors=[];

function noOverlap(a,b,label,tolerance=2){assert.ok(a.bottom<=b.top+tolerance,`${label} overlap: ${JSON.stringify({a,b})}`)}
function inside(inner,outer,label){assert.ok(inner.left>=outer.left-1&&inner.right<=outer.right+1,`${label} escaped horizontally`)}

async function mobileAudit(width,height){
  const ctx=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  const shell=await page.evaluate(()=>{
    const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
    return {viewport:innerWidth,topbar:box('.topbar'),editor:box('.editor-toolbar'),workspace:box('.workspace'),stage:box('.stage'),canvas:box('#canvasFrame'),bodyScroll:document.documentElement.scrollWidth};
  });
  for(const key of['topbar','editor','workspace','stage','canvas'])assert.ok(Math.abs(shell[key].width-width)<=1,`${width}px ${key} width ${shell[key].width}`);
  assert.ok(shell.bodyScroll<=width+1,`${width}px document horizontal overflow ${shell.bodyScroll}`);

  await page.click('#leftToggle');
  await page.waitForFunction(()=>!document.body.classList.contains('left-collapsed'));
  await page.waitForSelector('#blockList .library-card');
  const left=await page.evaluate(()=>{
    const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
    const panel=document.querySelector('.left-sidebar');
    const style=getComputedStyle(document.querySelector('#leftTitle'));
    return {panel:box('.left-sidebar'),head:box('.left-sidebar .sidebar-head'),title:box('#leftTitle'),tabs:box('.left-sidebar .tabs'),search:box('#blocksPanel .search'),tools:box('#blocksPanel .panel-tools'),filters:box('#blocksPanel .v5-lib-filter'),list:box('#blockList'),first:box('#blockList .library-card'),panelScrollWidth:panel.scrollWidth,panelClientWidth:panel.clientWidth,titleColor:style.color,titleOpacity:style.opacity};
  });
  assert.ok(left.panel.width>=Math.min(320,width*.85),`${width}px left panel too narrow: ${left.panel.width}`);
  assert.ok(left.title.width>40&&left.title.height>18,`${width}px panel title invisible`);
  assert.notEqual(left.titleColor,'rgba(0, 0, 0, 0)',`${width}px title transparent`);
  assert.ok(Number(left.titleOpacity)>.7,`${width}px title opacity too low`);
  noOverlap(left.head,left.tabs,`${width}px head/tabs`,12);
  noOverlap(left.tabs,left.search,`${width}px tabs/search`,12);
  noOverlap(left.search,left.tools,`${width}px search/tools`,12);
  noOverlap(left.tools,left.filters,`${width}px tools/filters`,12);
  noOverlap(left.filters,left.list,`${width}px filters/list`,12);
  inside(left.tabs,left.panel,`${width}px tabs`);inside(left.search,left.panel,`${width}px search`);inside(left.tools,left.panel,`${width}px tools`);inside(left.filters,left.panel,`${width}px filters`);inside(left.first,left.panel,`${width}px first card`);
  assert.ok(left.panelScrollWidth<=left.panelClientWidth+1,`${width}px left sidebar horizontal overflow`);

  await page.click('[data-close-panel="left"]');
  await page.click('#rightToggle');
  await page.waitForFunction(()=>!document.body.classList.contains('right-collapsed'));
  await page.waitForSelector('.right-sidebar .panel-scroll>section:not(.hidden)');
  const right=await page.evaluate(()=>{
    const box=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
    const panel=document.querySelector('.right-sidebar');
    const visible=[...document.querySelectorAll('.right-sidebar .panel-scroll>section')].find(el=>!el.classList.contains('hidden'));
    const r=visible?.getBoundingClientRect();
    return {panel:box('.right-sidebar'),head:box('.right-sidebar .sidebar-head'),tabs:box('.right-sidebar .tabs'),inspector:r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null,panelScrollWidth:panel.scrollWidth,panelClientWidth:panel.clientWidth};
  });
  assert.ok(right.panel.width>=Math.min(320,width*.85),`${width}px right panel too narrow`);
  assert.ok(right.inspector&&right.inspector.width>0,`${width}px active inspector missing`);
  noOverlap(right.head,right.tabs,`${width}px right head/tabs`,12);
  noOverlap(right.tabs,right.inspector,`${width}px right tabs/inspector`,14);
  inside(right.tabs,right.panel,`${width}px right tabs`);inside(right.inspector,right.panel,`${width}px inspector`);
  assert.ok(right.panelScrollWidth<=right.panelClientWidth+1,`${width}px right sidebar horizontal overflow`);

  await ctx.close();
}

async function desktopAudit(){
  const ctx=await browser.newContext({viewport:{width:1440,height:950},deviceScaleFactor:1});
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  const m=await page.evaluate(()=>{const b=s=>document.querySelector(s).getBoundingClientRect();return{left:b('.left-sidebar').width,right:b('.right-sidebar').width,stage:b('.stage').width,workspace:b('.workspace').width,lc:document.body.classList.contains('left-collapsed'),rc:document.body.classList.contains('right-collapsed')}});
  assert.equal(m.lc,false,'desktop left sidebar unexpectedly collapsed');assert.equal(m.rc,false,'desktop right sidebar unexpectedly collapsed');
  assert.ok(m.left>=280&&m.right>=320,'desktop sidebars lost usable width');assert.ok(m.stage>700,'desktop canvas stage too narrow');assert.ok(Math.abs(m.workspace-1440)<=1,'desktop workspace not full width');
  await ctx.close();
}

try{
  await mobileAudit(360,800);
  await mobileAudit(390,844);
  await mobileAudit(768,900);
  await desktopAudit();
  assert.deepEqual(errors,[],`Browser page errors:\n${errors.join('\n')}`);
  console.log('V6_LAYOUT_AUDIT_OK');
}finally{await browser.close()}
