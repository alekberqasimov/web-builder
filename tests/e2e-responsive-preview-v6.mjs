import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900}});
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));

function columnCount(value=''){return value.trim()?value.trim().split(/\s+/).length:0}

async function featuresMetrics(){
  return page.evaluate(()=>{
    const section=document.querySelector('#canvas .v5-section.selected');
    const root=section?.querySelector('.v5-section-inner > .v5-container');
    const grid=root?.children?.[2];
    if(!section||!root||!grid||!grid.classList.contains('v5-container')||grid.children.length!==3)return null;
    const gr=grid.getBoundingClientRect();
    const cards=[...grid.children].map(el=>{const r=el.getBoundingClientRect();const h=el.querySelector('h3'),p=el.querySelector('.v5-text');return{width:r.width,left:r.left,right:r.right,headingClient:h?.clientWidth||0,headingScroll:h?.scrollWidth||0,textClient:p?.clientWidth||0,textScroll:p?.scrollWidth||0}});
    return{
      columns:getComputedStyle(grid).gridTemplateColumns,
      grid:{width:gr.width,left:gr.left,right:gr.right,scrollWidth:grid.scrollWidth,clientWidth:grid.clientWidth},
      cards,
      section:{scrollWidth:section.scrollWidth,clientWidth:section.clientWidth},
      canvas:{device:document.querySelector('#canvas').dataset.device,width:document.querySelector('#canvas').getBoundingClientRect().width},
      editorFont:getComputedStyle(document.body).fontFamily,
      simulatorLoaded:!!document.querySelector('#editorResponsiveStyle')
    };
  });
}

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForFunction(()=>!!document.querySelector('#editorResponsiveStyle'));

  // The default document is intentionally allowed to evolve. Add the exact preset under test through the real library UI.
  await page.click('#blocksTab');
  await page.locator('[data-add-block="features"]').click();
  await page.locator('#canvas .v5-section.selected').waitFor({state:'visible'});

  let m=await featuresMetrics();
  assert.ok(m,'Features block added from the library did not expose the expected three-card grid');
  assert.equal(m.simulatorLoaded,true,'responsive canvas simulator did not load');
  assert.equal(m.canvas.device,'desktop');
  assert.equal(columnCount(m.columns),3,'desktop Features must render in three columns');
  assert.match(m.editorFont,/Inter|system-ui|Segoe UI/i,'site typography leaked into builder chrome');

  await page.click('.device-switch [data-device="tablet"]');
  await page.waitForFunction(()=>document.querySelector('#canvas')?.dataset.device==='tablet');
  await page.waitForTimeout(50);
  m=await featuresMetrics();
  assert.equal(columnCount(m.columns),2,`tablet Features must render in two columns, got ${m?.columns}`);

  await page.click('.device-switch [data-device="mobile"]');
  await page.waitForFunction(()=>document.querySelector('#canvas')?.dataset.device==='mobile');
  await page.waitForTimeout(50);
  m=await featuresMetrics();
  assert.equal(columnCount(m.columns),1,`mobile Features must stack to one column, got ${m?.columns}`);
  assert.ok(m.canvas.width<=391,`mobile canvas width is too wide: ${m.canvas.width}`);
  assert.ok(m.section.scrollWidth<=m.section.clientWidth+1,'Features section overflows horizontally on simulated mobile');
  assert.ok(m.grid.scrollWidth<=m.grid.clientWidth+1,'Features grid overflows horizontally on simulated mobile');
  for(const [i,c] of m.cards.entries()){
    assert.ok(c.width>=m.grid.width-2,`mobile card ${i+1} did not expand to the stacked grid width`);
    assert.ok(c.headingScroll<=c.headingClient+1,`mobile card ${i+1} heading overflows its card`);
    assert.ok(c.textScroll<=c.textClient+1,`mobile card ${i+1} body text overflows its card`);
  }

  assert.deepEqual(errors,[],`Responsive preview page errors:\n${errors.join('\n')}`);
  console.log('V6_RESPONSIVE_PREVIEW_E2E_OK');
}finally{
  await context.close();
  await browser.close();
}
