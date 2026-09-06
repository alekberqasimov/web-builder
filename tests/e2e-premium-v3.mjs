import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});

async function ensureLeft(page){if(await page.evaluate(()=>document.body.classList.contains('left-collapsed')))await page.click('#leftToggle');await page.waitForFunction(()=>!document.body.classList.contains('left-collapsed'))}
async function ensureRight(page){if(await page.evaluate(()=>document.body.classList.contains('right-collapsed')))await page.click('#rightToggle');await page.waitForFunction(()=>!document.body.classList.contains('right-collapsed'))}

try{
  const context=await browser.newContext({viewport:{width:1440,height:940}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  await ensureLeft(page);await page.click('#blocksTab');
  await page.waitForSelector('[data-add-block="premiumHeroShowcase"]');
  await page.click('[data-add-block="premiumHeroShowcase"]');
  await ensureRight(page);
  await page.click('#blockTab');
  await page.waitForSelector('.v6-premium-section-editor');

  const before=await page.evaluate(()=>({
    premium:!!document.querySelector('.v6-premium-section-editor'),
    width:document.querySelector('#canvas [data-block-id]:last-of-type')?.getAttribute('data-block-id')||'',
    overflow:document.documentElement.scrollWidth-innerWidth
  }));
  assert.equal(before.premium,true,'premium section inspector not attached');
  assert.ok(before.overflow<=1,`desktop premium v3 overflow ${before.overflow}`);

  await page.click('[data-v6-section-density="compact"]');
  await page.waitForTimeout(60);
  assert.ok(await page.locator('[data-v6-section-density="compact"]').evaluate(el=>el.classList.contains('is-active')),'section density preset did not persist');
  await page.click('[data-v6-section-width="wide"]');
  await page.waitForTimeout(60);
  assert.ok(await page.locator('[data-v6-section-width="wide"]').evaluate(el=>el.classList.contains('is-active')),'content width preset did not persist');
  await page.click('[data-v6-section-tone="soft"]');
  await page.waitForTimeout(60);
  assert.ok(await page.locator('[data-v6-section-tone="soft"]').evaluate(el=>el.classList.contains('is-active')),'section tone preset did not persist');

  const premiumBlock=page.locator('#canvas [data-block-id]').last();
  await premiumBlock.locator('.v5-heading').first().click();
  await page.waitForSelector('.v6-premium-type-editor');
  assert.match((await page.locator('.v6-pte-head strong').textContent())||'',/Типографика|Tipoqrafika|Typography/,'premium typography inspector missing');
  await page.click('[data-v6-type-scale="display"]');
  await page.click('[data-v6-type-measure="narrow"]');
  await page.waitForTimeout(60);
  assert.ok(await page.locator('[data-v6-type-measure="narrow"]').evaluate(el=>el.classList.contains('is-active')),'text measure preset did not persist');

  await premiumBlock.locator('.v5-btn').first().click();
  await page.waitForSelector('.v6-premium-type-editor [data-v6-button-size="large"]');
  await page.click('[data-v6-button-size="large"]');
  await page.click('[data-v6-button-flow="full"]');
  await page.waitForTimeout(60);
  assert.ok(await page.locator('[data-v6-button-flow="full"]').evaluate(el=>el.classList.contains('is-active')),'button full-width preset did not persist');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(120);
  const mobile=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,side:document.querySelector('#rightSidebar')?.getBoundingClientRect().width||0}));
  assert.ok(mobile.scroll<=mobile.width+1,`premium v3 mobile editor overflow ${mobile.scroll-mobile.width}`);
  assert.ok(mobile.side<=mobile.width*.9+2,`premium v3 inspector drawer is too wide: ${mobile.side}`);
  assert.deepEqual(errors,[],`Premium v3 page errors:\n${errors.join('\n')}`);
  await context.close();
  console.log('V6_PREMIUM_V3_E2E_OK');
}finally{await browser.close()}
