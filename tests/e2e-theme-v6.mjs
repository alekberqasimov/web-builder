import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});

function channel(v){return Number(v)/255}
function luminance(rgb){
  const values=rgb.map(v=>{const c=channel(v);return c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4});
  return 0.2126*values[0]+0.7152*values[1]+0.0722*values[2];
}
function contrast(a,b){const A=luminance(a),B=luminance(b);return (Math.max(A,B)+0.05)/(Math.min(A,B)+0.05)}
function parseColor(value){
  const s=String(value||'').trim();
  if(/^#[0-9a-f]{6}$/i.test(s))return [parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16)];
  const m=s.match(/rgba?\((\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)[ ,]+(\d+(?:\.\d+)?)/i);
  if(m)return [Number(m[1]),Number(m[2]),Number(m[3])];
  throw new Error(`Unsupported color: ${s}`);
}

try{
  const context=await browser.newContext({viewport:{width:1440,height:950}});
  await context.addInitScript(()=>localStorage.setItem('wb:v6:theme','dark'));
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  await page.waitForSelector('#themeToggle',{state:'visible'});

  async function theme(){return page.locator('html').getAttribute('data-builder-theme')}
  async function shellColors(){
    return page.evaluate(()=>({
      body:getComputedStyle(document.body).backgroundColor,
      text:getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
      muted:getComputedStyle(document.documentElement).getPropertyValue('--muted').trim(),
      panel:getComputedStyle(document.documentElement).getPropertyValue('--panel').trim(),
      panel3:getComputedStyle(document.documentElement).getPropertyValue('--panel-3').trim(),
      tab:getComputedStyle(document.querySelector('#elementsTab')).color,
      breadcrumb:getComputedStyle(document.querySelector('.breadcrumb')).color,
      save:getComputedStyle(document.querySelector('.save-status')).color,
      placeholder:getComputedStyle(document.querySelector('.search input'),'::placeholder').color
    }));
  }
  function assertReadable(colors,label){
    const panel=parseColor(colors.panel),panel3=parseColor(colors.panel3);
    const checks=[
      ['muted token',parseColor(colors.muted),panel],
      ['inactive tab',parseColor(colors.tab),panel3],
      ['breadcrumb',parseColor(colors.breadcrumb),panel3],
      ['save status',parseColor(colors.save),panel3],
      ['search placeholder',parseColor(colors.placeholder),panel3]
    ];
    for(const [name,fg,bg] of checks){
      const ratio=contrast(fg,bg);
      assert.ok(ratio>=4.5,`${label} ${name} contrast ${ratio.toFixed(2)} is below 4.5:1`);
    }
  }

  assert.equal(await theme(),'dark','saved dark theme should be applied before the editor becomes interactive');
  const dark=await shellColors();
  assertReadable(dark,'dark');
  assert.equal(await page.locator('#themeToggle').getAttribute('data-theme'),'dark');

  await page.click('#themeToggle');
  await page.waitForFunction(()=>document.documentElement.dataset.builderTheme==='light');
  assert.equal(await page.evaluate(()=>localStorage.getItem('wb:v6:theme')),'light','theme choice must persist');
  assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'),'#f5f7fb');
  const light=await shellColors();
  assertReadable(light,'light');
  assert.notEqual(light.body,dark.body,'light and dark shell backgrounds must be visually different');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});
  assert.equal(await theme(),'light','light theme must survive reload');

  await page.selectOption('#uiLanguage','en');
  await page.waitForTimeout(50);
  assert.match(await page.locator('#themeToggle').getAttribute('aria-label'),/dark/i,'theme control should relabel with builder UI language');

  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(100);
  const box=await page.locator('#themeToggle').boundingBox();
  assert.ok(box&&box.width>=30&&box.height>=30,'theme toggle must remain usable on mobile');
  assert.deepEqual(errors,[],`Theme/contrast page errors:\n${errors.join('\n')}`);

  await context.close();
  console.log('V6_THEME_CONTRAST_E2E_OK');
}finally{
  await browser.close();
}
