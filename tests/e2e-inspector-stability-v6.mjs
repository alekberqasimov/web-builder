import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
const page=await context.newPage();
page.setDefaultTimeout(7000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.stack||e)));

async function heartbeat(){
  const elapsed=await page.evaluate(async()=>{const t=performance.now();await new Promise(r=>setTimeout(r,60));return performance.now()-t});
  assert.ok(elapsed<1200,`editor main thread stalled for ${elapsed}ms`);
}
async function realClick(locator){
  await locator.waitFor({state:'visible'});
  await locator.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest'}));
  const box=await locator.boundingBox();
  assert.ok(box,'click target has no geometry');
  await page.mouse.click(box.x+Math.max(4,box.width/2),box.y+Math.max(4,box.height/2));
  await heartbeat();
}
async function ensureRight(){
  if(await page.evaluate(()=>document.body.classList.contains('right-collapsed')))await page.click('#rightToggle');
  await page.waitForFunction(()=>!document.body.classList.contains('right-collapsed'));
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  await page.click('#blocksTab');
  await page.selectOption('#blockCategory','ready');
  await page.locator('[data-add-block="premiumHeroShowcase"]').click();
  const premiumId=await page.locator('#canvas>[data-block-id]').last().getAttribute('data-block-id');
  assert.ok(premiumId,'premium block was not added');

  await page.locator('[data-add-block="navbar"]').click();
  const navId=await page.locator('#canvas>[data-block-id]').last().getAttribute('data-block-id');
  assert.ok(navId,'navigation block was not added');

  await page.click('#navigatorTab');
  await page.waitForSelector('#navigatorPanel:not(.hidden)');
  await ensureRight();

  const premiumTarget=page.locator(`#navigatorTree [data-tree-block="${premiumId}"] [data-tree-select-block]`);
  const navTarget=page.locator(`#navigatorTree [data-tree-block="${navId}"] [data-tree-select-block]`);

  for(let i=0;i<6;i++){
    await realClick(premiumTarget);
    await page.waitForSelector('#blockInspector:not(.hidden) .v6-premium-section-editor');
    assert.equal(await page.locator('#blockInspector .v6-premium-section-editor').count(),1,'premium section inspector duplicated');
    await heartbeat();

    await realClick(navTarget);
    await page.waitForSelector('#blockInspector:not(.hidden)');
    assert.equal(await page.locator('#blockInspector .v6-premium-section-editor').count(),0,'premium section inspector leaked onto non-premium block');
    await heartbeat();
  }

  assert.deepEqual(errors,[],`page errors:\n${errors.join('\n')}`);
  console.log('V6_INSPECTOR_STABILITY_OK');
}finally{
  await context.close();
  await browser.close();
}
