import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
await mkdir('qa-screenshots',{recursive:true});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base);await page.waitForSelector('#canvas [data-block-id]');
 await page.waitForFunction(()=>document.querySelector('#saveStatus').dataset.saveState==='saved');
 assert.equal(await page.locator('#blockList .library-card').first().getAttribute('data-add-block'),'premiumHeroSaas');
 for(const old of ['hero','features','cards','split','quote','cta','contact','faq','stats','testimonials','pricing','logos'])assert.equal(await page.locator(`[data-add-block="${old}"]`).count(),0);
 await page.fill('#blockSearch','тариф');assert.equal(await page.locator('#blockList .library-card').count(),1);
 assert.equal(await page.locator('#blockList .library-card').getAttribute('data-add-block'),'premiumPricing');
 await page.fill('#blockSearch','');
 // Native sibling buttons avoid nested interactive controls.
 assert.equal(await page.locator('.library-card [role="button"],.library-card button').count(),0);
 await page.locator('[data-fav-key="premiumPricing"]').click();
 assert.equal(await page.locator('[data-fav-key="premiumPricing"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-kind="block"][data-lib-filter="fav"]').click();
 assert.equal(await page.locator('#blockList .library-card:visible').count(),1);
 await page.locator('[data-kind="block"][data-lib-filter="all"]').click();
 await page.screenshot({path:'qa-screenshots/editor-desktop.png'});
 await page.click('[data-device="mobile"]');await page.fill('#customWidth','1369');await page.locator('#customWidth').dispatchEvent('change');
 assert.equal(Math.round(await page.locator('#canvasFrame').evaluate(e=>e.getBoundingClientRect().width)),1369);
 assert.equal(await page.locator('#canvas').getAttribute('data-device'),'desktop');
 await page.click('[data-device="mobile"]');assert.equal(await page.locator('#canvasFrame').getAttribute('data-custom-width'),null);
 await page.click('#previewBtn');assert.equal((await page.locator('#previewFrame').getAttribute('sandbox')).includes('allow-same-origin'),false);await page.click('#closePreview');
 // ZIP is bundled and the real download path delivers a ZIP, independent of CDN availability.
 assert.equal(await page.evaluate(()=>!!window.JSZip),true);
 const downloaded=page.waitForEvent('download');await page.click('#downloadBtn');const dl=await downloaded;assert.match(dl.suggestedFilename(),/\.zip$/);
 // Render the production export of the whole premium collection at narrow and wide widths.
 const html=await page.evaluate(async()=>{const q=new URL([...document.scripts].find(s=>s.src.includes('/v6-app.mjs')).src).search;const {state}=await import('./v5-runtime.mjs'+q),{makePremiumPreset,PREMIUM_READY_TYPES}=await import('./v6-premium-blocks.mjs'+q),{exportedDocument}=await import('./v5-export.mjs'+q);const p=structuredClone(state.project);p.pages[0].blocks=PREMIUM_READY_TYPES.map(makePremiumPreset);return exportedDocument(p,p.pages[0])});
 const exported=await context.newPage();exported.on('pageerror',e=>errors.push(String(e)));
 for(const width of [320,390,768,1440]){
   await exported.setViewportSize({width,height:960});await exported.setContent(html);
   const over=await exported.evaluate(()=>[...document.querySelectorAll('.v5-section')].map(el=>({name:el.querySelector('h1,h2')?.textContent,client:el.clientWidth,scroll:el.scrollWidth})).filter(x=>x.scroll>x.client+2));
   assert.deepEqual(over,[],`Export overflow at ${width}px: ${JSON.stringify(over)}`);
   await exported.screenshot({path:`qa-screenshots/premium-export-${width}.png`,fullPage:true});
 }
 // Every retained premium preset must also fit the simulated mobile editor.
 await page.evaluate(async()=>{const q=new URL([...document.scripts].find(s=>s.src.includes('/v6-app.mjs')).src).search;const r=await import('./v5-runtime.mjs'+q),m=await import('./v6-premium-blocks.mjs'+q);r.currentPage().blocks=m.PREMIUM_READY_TYPES.map(m.makePremiumPreset);r.state.device='mobile';r.state.render()});
 await page.waitForTimeout(100);
 const simulated=await page.evaluate(()=>[...document.querySelectorAll('#canvas .v5-section')].map(el=>({client:el.clientWidth,scroll:el.scrollWidth})).filter(x=>x.scroll>x.client+2));assert.deepEqual(simulated,[]);
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const phone=await mobile.newPage();
 await phone.goto(base);await phone.waitForSelector('#canvas [data-block-id]');await phone.click('#leftToggle');
 await phone.screenshot({path:'qa-screenshots/editor-mobile.png'});
 assert.ok(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.equal(await phone.locator('#blockList .library-card.is-premium').count(),12);
 // Storage failure must never be presented as successful persistence.
 const denied=await browser.newContext();await denied.addInitScript(()=>Object.defineProperty(window,'indexedDB',{value:{open(){throw new Error('Storage denied')}}}));const failing=await denied.newPage();await failing.goto(base);
 await failing.waitForSelector('#saveStatus[data-save-state="error"]',{timeout:10000});
 assert.match(await failing.locator('#saveStatus').innerText(),/Не сохранено/);
 assert.deepEqual(errors,[]);console.log('V6_QUALITY_AUDIT_E2E_OK');
}finally{await browser.close()}
