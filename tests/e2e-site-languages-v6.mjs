import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1440,height:950}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForSelector('[data-site-language-switch]',{timeout:15000});
  assert.equal(await page.locator('[data-site-language-switch] option').count(),3,'default site language selector should expose 3 site languages');
  assert.equal(await page.locator('#uiLanguage').inputValue(),'ru','builder UI language should remain separate');

  await page.click('#siteTab');
  await page.waitForSelector('[data-site-languages-config]');
  let dialogs=['de','Deutsch'];
  page.on('dialog',async d=>{const value=dialogs.shift();await d.accept(value??'')});
  await page.click('[data-site-lang-add]');
  await page.waitForFunction(()=>document.querySelectorAll('[data-site-language-switch] option').length===4);
  assert.equal(await page.locator('#uiLanguage').inputValue(),'ru','adding site language must not change builder UI language');

  await page.click('#pageTab');
  await page.waitForSelector('[data-linked-translations]');
  await page.waitForSelector('[data-create-translation="de"]');
  await page.click('[data-create-translation="de"]');
  await page.waitForFunction(()=>document.querySelector('[data-page="lang"]')?.value==='de');
  assert.equal(await page.locator('[data-site-language-switch]').inputValue(),'de','site selector should follow opened translation');
  assert.equal(await page.locator('#uiLanguage').inputValue(),'ru','site switch must not change builder UI language');

  await page.selectOption('[data-site-language-switch]','ru');
  await page.waitForFunction(()=>document.querySelector('[data-page="lang"]')?.value==='ru');
  await page.selectOption('[data-site-language-switch]','de');
  await page.waitForFunction(()=>document.querySelector('[data-page="lang"]')?.value==='de');

  await page.click('#pagesTab');
  await page.waitForSelector('#pagesPanel:not(.hidden)');
  const visibleRows=await page.locator('#pageList [data-page-id]').evaluateAll(rows=>rows.filter(r=>getComputedStyle(r).display!=='none').map(r=>r.textContent));
  assert.ok(visibleRows.length>=1,'active site language should have visible page rows');
  assert.deepEqual(errors,[],`Multilingual page errors:\n${errors.join('\n')}`);
  await context.close();
  console.log('V6_SITE_LANGUAGES_E2E_OK');
}finally{
  await browser.close();
}
