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
    const overflow=sel=>[...document.querySelectorAll(sel)].map(el=>({text:el.textContent.trim(),client:el.clientWidth,scroll:el.scrollWidth,overflow:getComputedStyle(el).overflow,fontSize:getComputedStyle(el).fontSize,fontWeight:getComputedStyle(el).fontWeight}));
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
      search:{display:getComputedStyle(search).display,rect:{x:sr.x,y:sr.y,width:sr.width,height:sr.height,right:sr.right,bottom:sr.bottom},input:{x:ir.x,y:ir.y,width:ir.width,height:ir.height,right:ir.right,bottom:ir.bottom},icon:{x:xr.x,y:xr.y,width:xr.width,height:xr.height,right:xr.right,bottom:xr.bottom},placeholder:getComputedStyle(input,'::placeholder').color},
      brand:{size:getComputedStyle(document.querySelector('.brand-name')).fontSize,weight:getComputedStyle(document.querySelector('.brand-name')).fontWeight},
      actionWeight:getComputedStyle(document.querySelector('#newBtn')).fontWeight,
      canvas:{stageLeft:stage.left,stageRight:stage.right,frameLeft:frame.left,frameRight:frame.right}
    };
  });

  assert.equal(metrics.version,'v6.2','production chrome should expose V6.2 UI kit version');
  assert.equal(metrics.kitLoaded,true,'V6.2 UI kit stylesheet is not loaded');
  assert.ok(metrics.left.width>=320,'desktop library panel is too cramped');
  assert.ok(metrics.right.width>=350,'desktop inspector panel is too cramped');
  for(const tab of [...metrics.leftTabs,...metrics.rightTabs])assert.ok(tab.scroll<=tab.client+1,`tab label is clipped: ${tab.text}`);
  assert.equal(metrics.search.display,'flex','search label regressed to grid layout');
  assert.ok(metrics.search.input.x>metrics.search.icon.x,'search input must stay beside the icon');
  assert.ok(metrics.search.input.y>=metrics.search.rect.y&&metrics.search.input.bottom<=metrics.search.rect.bottom+1,'search input is vertically outside its control');
  assert.ok(Math.abs((metrics.search.icon.y+metrics.search.icon.height/2)-(metrics.search.input.y+metrics.search.input.height/2))<3,'search icon and text are not vertically aligned');
  assert.ok(Number.parseInt(metrics.brand.weight)<=800,'brand typography is too heavy');
  assert.ok(Number.parseInt(metrics.actionWeight)<=700,'toolbar typography is too heavy');
  assert.ok(metrics.canvas.frameLeft>=metrics.canvas.stageLeft-1&&metrics.canvas.frameRight<=metrics.canvas.stageRight+1,'desktop canvas is clipped behind a pinned sidebar');
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
    return{display:getComputedStyle(s).display,search:{left:r.left,right:r.right,width:r.width,height:r.height},input:{left:ir.left,right:ir.right,width:ir.width,height:ir.height},tabs,drawer:document.querySelector('#leftSidebar').getBoundingClientRect().width,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth};
  });
  assert.equal(m.display,'flex','mobile search must keep one-row flex layout');
  assert.ok(m.input.left>m.search.left+20&&m.input.right<=m.search.right-6,'mobile search text is clipped or outside the field');
  assert.ok(m.drawer<m.viewport*.92,'mobile drawer became a full-screen wall');
  assert.ok(m.scrollWidth<=m.viewport,'mobile builder has horizontal page overflow');
  for(const tab of m.tabs)assert.ok(tab.scroll<=tab.client+1,`mobile tab label is clipped: ${tab.text}`);
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
