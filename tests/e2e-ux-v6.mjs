import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});

async function desktopAudit(){
  const context=await browser.newContext({viewport:{width:1440,height:950}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForSelector('#navigatorTab');
  await page.waitForSelector('[data-panel-pin="left"]');

  const before=await page.locator('.stage').evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(before>500,'desktop stage is unexpectedly narrow');
  assert.equal(await page.locator('#navigatorPanel').isVisible(),false,'navigator must not be mixed into block library by default');
  assert.equal(await page.locator('#blocksPanel').isVisible(),true,'blocks panel must be visible by default');
  assert.equal(await page.locator('[data-panel-pin="left"]').getAttribute('aria-pressed'),'true','left panel should be pinned by default');

  await page.click('[data-panel-pin="left"]');
  await page.waitForFunction(()=>document.body.classList.contains('left-unpinned'));
  const after=await page.locator('.stage').evaluate(el=>el.getBoundingClientRect().width);
  assert.ok(after>before+150,`unpinned left panel should free canvas width: ${before} -> ${after}`);
  assert.equal(await page.locator('#leftSidebar').isVisible(),true,'unpinned panel should remain visible as overlay');

  await page.click('[data-panel-pin="left"]');
  await page.waitForFunction(()=>!document.body.classList.contains('left-unpinned'));

  await page.click('#navigatorTab');
  await page.waitForSelector('#navigatorPanel:not(.hidden)');
  assert.equal(await page.locator('#blocksPanel').isVisible(),false,'block library must hide in navigator mode');
  assert.equal(await page.locator('#navigatorTree .tree-block').count()>0,true,'navigator should contain the page tree');

  assert.deepEqual(errors,[],`Desktop UX page errors:\n${errors.join('\n')}`);
  await context.close();
}

async function mobileAudit(){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForSelector('#navigatorTab');

  assert.equal(await page.locator('.brand-name').isVisible(),true,'Web Builder brand name must remain visible on phone');
  assert.equal((await page.locator('.brand-name').innerText()).trim(),'Web Builder','mobile brand text changed unexpectedly');
  assert.equal(await page.locator('#leftToggle').isVisible(),true,'left blocks control must be visible on phone');
  assert.equal(await page.locator('#rightToggle').isVisible(),true,'right settings control must be visible on phone');

  await page.click('#leftToggle');
  await page.waitForFunction(()=>!document.body.classList.contains('left-collapsed'));

  const metrics=await page.evaluate(()=>{
    const side=document.querySelector('#leftSidebar').getBoundingClientRect();
    const search=document.querySelector('#blocksPanel .search').getBoundingClientRect();
    const cards=[...document.querySelectorAll('#blockList .library-card')].slice(0,4).map(el=>el.getBoundingClientRect());
    const pin=getComputedStyle(document.querySelector('[data-panel-pin="left"]')).display;
    return{
      innerWidth,
      side:{left:side.left,right:side.right,width:side.width},
      search:{left:search.left,right:search.right,width:search.width},
      cardXs:[...new Set(cards.map(r=>Math.round(r.x)))],
      bodyScroll:document.documentElement.scrollWidth,
      pin
    };
  });

  assert.ok(metrics.side.width<=390,'mobile drawer exceeds viewport');
  assert.ok(metrics.side.width<metrics.innerWidth*.92,'mobile drawer should leave visual context instead of becoming a full-screen wall');
  assert.ok(metrics.search.left>=metrics.side.left&&metrics.search.right<=metrics.side.right+1,'search is clipped or overflows the drawer');
  assert.ok(metrics.search.width>300,'mobile search is too narrow');
  assert.ok(metrics.cardXs.length>=2,'block cards must use an adaptive two-column layout on phone');
  assert.equal(metrics.pin,'none','pin control must be hidden on compact drawer mode');
  assert.ok(metrics.bodyScroll<=390,'builder creates horizontal page overflow on mobile');

  await page.click('#navigatorTab');
  await page.waitForSelector('#navigatorPanel:not(.hidden)');
  assert.equal(await page.locator('#navigatorTree .tree-block').count()>0,true,'mobile navigator should remain usable');

  await page.click('#leftToggle');
  await page.waitForFunction(()=>document.body.classList.contains('left-collapsed'));
  await page.click('#rightToggle');
  await page.waitForFunction(()=>!document.body.classList.contains('right-collapsed'));
  const right=await page.locator('#rightSidebar').evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,width:r.width,innerWidth}});
  assert.ok(right.width<right.innerWidth*.92,'right settings drawer should also preserve page context on phone');
  assert.ok(right.right<=right.innerWidth+1&&right.left>=0,'right settings drawer is outside the viewport');

  assert.deepEqual(errors,[],`Mobile UX page errors:\n${errors.join('\n')}`);
  await context.close();
}

try{
  await desktopAudit();
  await mobileAudit();
  console.log('V6_UX_E2E_OK');
}finally{
  await browser.close();
}
