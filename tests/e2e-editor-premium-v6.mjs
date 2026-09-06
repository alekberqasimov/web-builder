import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});

async function desktop(){
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForSelector('#commandBtn');

  const shell=await page.evaluate(()=>({
    premium:document.documentElement.dataset.editorPremium,
    css:[...document.styleSheets].some(s=>String(s.href||'').includes('v6-editor-premium.css')),
    module:[...document.scripts].some(s=>String(s.src||'').includes('v6-editor-premium.mjs')),
    context:!!document.querySelector('#editorContext'),
    command:!!document.querySelector('#commandBtn'),
    svgIcons:['undoBtn','redoBtn','previewBtn','downloadBtn','leftToggle','rightToggle'].every(id=>!!document.querySelector(`#${id} svg`)),
    overflow:document.documentElement.scrollWidth-innerWidth
  }));
  assert.equal(shell.premium,'2','premium editor mode is not active');
  assert.equal(shell.css,true,'premium editor stylesheet missing');
  assert.equal(shell.module,true,'premium editor module missing');
  assert.equal(shell.context,true,'page/save context is missing');
  assert.equal(shell.command,true,'command palette trigger is missing');
  assert.equal(shell.svgIcons,true,'editor chrome still exposes placeholder glyph controls');
  assert.ok(shell.overflow<=1,`desktop premium editor overflow ${shell.overflow}`);

  await page.keyboard.press('Control+K');
  await page.waitForFunction(()=>document.querySelector('#commandPalette')?.open===true);
  assert.equal(await page.locator('#commandResults .command-item').count(),12,'command palette action catalog changed unexpectedly');
  await page.fill('#commandSearch','mobile');
  await page.waitForSelector('#commandResults [data-command-id="mobile"]');
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-device="mobile"]')?.classList.contains('active'));

  if(await page.evaluate(()=>document.body.classList.contains('left-collapsed')))await page.click('#leftToggle');
  await page.waitForFunction(()=>!document.body.classList.contains('left-collapsed'));
  await page.click('#blocksTab');
  await page.waitForSelector('[data-lib-filter="pro"]');
  await page.click('[data-lib-filter="pro"]');
  const pro=await page.evaluate(()=>({
    visible:[...document.querySelectorAll('#blockList .library-item')].filter(x=>!x.hidden).length,
    premiumVisible:[...document.querySelectorAll('#blockList .library-card.is-premium')].filter(x=>!x.closest('.library-item')?.hidden).length,
    meta:document.querySelector('[data-library-meta="block"] strong')?.textContent.trim()
  }));
  assert.equal(pro.visible,12,'PRO filter must expose only curated premium blocks');
  assert.equal(pro.premiumVisible,12,'PRO filter contains non-premium cards or lost premium cards');
  assert.equal(pro.meta,'12','library result counter is incorrect');

  await page.selectOption('#uiLanguage','ru');
  await page.waitForFunction(()=>document.querySelector('#blocksPanel [data-lib-filter="fav"]')?.textContent.includes('Избран'));
  assert.equal((await page.locator('#blocksPanel [data-lib-filter="recent"]').textContent()).trim(),'Недавние','library filters are not localized');

  assert.deepEqual(errors,[],`Premium editor desktop page errors:\n${errors.join('\n')}`);
  await context.close();
}

async function mobile(){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  const m=await page.evaluate(()=>({
    width:innerWidth,scroll:document.documentElement.scrollWidth,
    contextDisplay:getComputedStyle(document.querySelector('#editorContext')).display,
    commandWidth:document.querySelector('#commandBtn').getBoundingClientRect().width,
    topbar:document.querySelector('.topbar').getBoundingClientRect().width
  }));
  assert.ok(m.scroll<=m.width+1,'premium mobile editor creates horizontal overflow');
  assert.equal(m.contextDisplay,'none','desktop page context should not crowd mobile toolbar');
  assert.ok(m.commandWidth>=30,'mobile command trigger is not touchable');
  assert.ok(Math.abs(m.topbar-m.width)<=1,'premium topbar does not fit mobile viewport');
  await page.click('#commandBtn');await page.waitForFunction(()=>document.querySelector('#commandPalette')?.open===true);
  const dlg=await page.locator('#commandPalette').boundingBox();
  assert.ok(dlg&&dlg.width<=390&&dlg.x>=0,'command palette escapes mobile viewport');
  assert.deepEqual(errors,[],`Premium editor mobile page errors:\n${errors.join('\n')}`);
  await context.close();
}

try{await desktop();await mobile();console.log('V6_EDITOR_PREMIUM_E2E_OK')}finally{await browser.close()}
