import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const errors=[];

async function testViewport(width,height){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(`${width}px pageerror: ${e}`));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:20000});
  const shell=await page.evaluate(()=>{
    const rect=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}:null};
    return {
      innerWidth,
      bodyScrollWidth:document.documentElement.scrollWidth,
      workspace:rect('.workspace'),stage:rect('.stage'),toolbar:rect('.stage-toolbar'),canvas:rect('#canvasFrame'),
      left:rect('.left-sidebar'),right:rect('.right-sidebar'),
      leftCollapsed:document.body.classList.contains('left-collapsed'),
      rightCollapsed:document.body.classList.contains('right-collapsed'),
      version:document.querySelector('.version')?.textContent?.trim(),
      leftIcon:document.querySelector('#leftToggle')?.textContent?.trim(),
      rightIcon:document.querySelector('#rightToggle')?.textContent?.trim()
    };
  });
  assert.match(shell.version||'',/^v6/);
  assert.equal(shell.leftIcon,'☰');
  assert.equal(shell.rightIcon,'⚙');
  assert.ok(shell.workspace&&shell.stage&&shell.canvas);
  if(width<=1180){
    assert.ok(Math.abs(shell.workspace.width-width)<=1,`workspace ${shell.workspace.width} != ${width}`);
    assert.ok(Math.abs(shell.stage.width-width)<=1,`stage ${shell.stage.width} != ${width}`);
    assert.ok(shell.stage.x>=-1&&shell.stage.right<=width+1,`stage escaped viewport ${JSON.stringify(shell.stage)}`);
    if(width<=760){
      assert.ok(Math.abs(shell.canvas.width-width)<=1,`phone canvas ${shell.canvas.width} != ${width}`);
    }else{
      assert.ok(shell.canvas.width<=width&&shell.canvas.width>=width-32,`tablet canvas ${shell.canvas.width} outside expected range for ${width}`);
    }
    assert.ok(shell.bodyScrollWidth<=width+1,`horizontal page overflow ${shell.bodyScrollWidth} > ${width}`);
    assert.equal(shell.leftCollapsed,true);
    assert.equal(shell.rightCollapsed,true);

    await page.click('#leftToggle');
    await page.waitForTimeout(250);
    const leftOpen=await page.evaluate(()=>{
      const q=s=>document.querySelector(s)?.getBoundingClientRect();
      const h=q('.left-sidebar'),head=q('.left-sidebar .sidebar-head'),tabs=q('.left-sidebar .tabs'),search=q('.left-sidebar .search'),tools=q('.left-sidebar .panel-tools');
      return {h:{x:h.x,width:h.width,right:h.right},head:{y:head.y,bottom:head.bottom},tabs:{y:tabs.y,bottom:tabs.bottom},search:{y:search.y,bottom:search.bottom},tools:{y:tools.y,bottom:tools.bottom}};
    });
    assert.ok(leftOpen.h.x>=-1&&leftOpen.h.right<=width+1,'left panel outside viewport');
    assert.ok(leftOpen.head.bottom<=leftOpen.tabs.y+1,'left header overlaps tabs');
    assert.ok(leftOpen.tabs.bottom<=leftOpen.search.y+1,'tabs overlap search');
    assert.ok(leftOpen.search.bottom<=leftOpen.tools.y+2,'search overlaps category select');

    await page.click('#rightToggle');
    await page.waitForTimeout(250);
    const rightOpen=await page.evaluate(()=>{const r=document.querySelector('.right-sidebar')?.getBoundingClientRect();return{x:r.x,width:r.width,right:r.right}});
    assert.ok(rightOpen.x>=-1&&rightOpen.right<=width+1,'right panel outside viewport');
  }
  await context.close();
}

try{
  await testViewport(360,800);
  await testViewport(390,844);
  await testViewport(768,900);
  await testViewport(1440,1000);
  assert.deepEqual(errors,[],errors.join('\n'));
  console.log('V6_SHELL_PASS');
}finally{
  await browser.close();
}
