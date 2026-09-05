import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(String(e?.stack||e)));
const change=async(locator,value)=>{await locator.fill(String(value));await locator.dispatchEvent('change');await page.waitForTimeout(90)};
const select=async(locator,value)=>{await locator.selectOption(String(value));await page.waitForTimeout(90)};

try{
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:15000});

  // Global design system: real UI -> project theme/tokens.
  await page.click('#siteTab');
  await page.waitForSelector('#v6DesignSystem',{timeout:10000});
  await change(page.locator('#v6DesignSystem [data-ds-number="spacing.md"]'),22);
  await change(page.locator('#v6DesignSystem [data-ds-theme-number="typography.h1.weight"]'),820);
  await change(page.locator('#v6DesignSystem [data-ds-theme-number="button.radius"]'),18);

  // Create a new layout and configure its desktop grid visually.
  await page.click('#blocksTab');
  await page.selectOption('#blockCategory','layouts');
  await page.click('[data-add-block="layout1"]');
  const block=page.locator('#canvas>[data-block-id]').last();
  const container=block.locator('.v5-container[data-node-id]').first();
  const containerId=await container.getAttribute('data-node-id');
  assert.ok(containerId,'layout container missing');
  await container.click();
  await page.waitForSelector('#elementInspector:not(.hidden) [data-v6-grid-mode]',{timeout:10000});
  await select(page.locator('#elementInspector [data-v6-grid-mode]'),'auto-fit');
  await change(page.locator('#elementInspector [data-v6-grid-min]'),260);
  await select(page.locator('#elementInspector [data-v6-gap]'),'var(--wb-space-lg)');

  // Mobile override must not rewrite or misreport the desktop grid mode.
  await page.click('[data-device="mobile"]');
  await page.waitForSelector('#elementInspector:not(.hidden) [data-v6-columns]');
  await select(page.locator('#elementInspector [data-v6-columns]'),'1');
  await page.click('[data-device="desktop"]');
  await page.waitForSelector('#elementInspector:not(.hidden) [data-v6-grid-mode]');
  assert.equal(await page.locator('#elementInspector [data-v6-grid-mode]').inputValue(),'auto-fit','desktop auto-fit mode was polluted by mobile fixed override');
  assert.equal(await page.locator('#elementInspector [data-v6-grid-min]').inputValue(),'260','desktop auto-fit min width was not preserved');

  // Add an image into the selected container and configure responsive media attributes.
  await page.click('#elementsTab');
  await page.click('[data-add-element="image"]');
  await page.waitForSelector('#elementInspector:not(.hidden) [data-v6-image-srcset]',{timeout:10000});
  await change(page.locator('#elementInspector [data-v6-image-srcset]'),'https://cdn.example/image-640.jpg 640w, https://cdn.example/image-1280.jpg 1280w');
  await change(page.locator('#elementInspector [data-v6-image-sizes]'),'(max-width: 760px) 100vw, 50vw');
  await select(page.locator('#elementInspector [data-v6-image-loading]'),'eager');
  await select(page.locator('#elementInspector [data-v6-image-priority]'),'high');
  await select(page.locator('#elementInspector [data-v6-image-decoding]'),'async');
  await select(page.locator('#elementInspector [data-v6-image-filter]'),'saturate(1.06) contrast(1.03)');
  await select(page.locator('#elementInspector [data-v6-image-mask]'),'circle(50% at 50% 50%)');
  await page.locator('#elementInspector [data-v6-image-position="50% 0%"]').click();
  await page.waitForTimeout(100);

  const exported=await page.evaluate(async(containerId)=>{
    const appSrc=[...document.scripts].map(s=>s.src).find(src=>src.includes('/v6-app.mjs'))||'';
    const moduleQuery=appSrc?new URL(appSrc).search:'';
    const load=path=>import(path+moduleQuery);
    const runtime=await load('./v5-runtime.mjs');
    const exp=await load('./v5-export.mjs');
    const project=runtime.state.project;
    if(!project)throw new Error(`Design E2E module identity mismatch: ${moduleQuery||'unversioned'}`);
    const current=project.pages.find(p=>p.id===project.currentPageId)||project.pages[0];
    let container=null,image=null;
    for(const block of current.blocks){
      const stack=[block.root];
      while(stack.length){const n=stack.pop();if(n?.id===containerId)container=n;if(n?.type==='image'&&n.props?.srcset)image=n;if(n?.children)stack.push(...n.children)}
    }
    return{html:exp.exportedDocument(project,current),container,image,moduleQuery,tokens:project.theme.designTokens,theme:project.theme};
  },containerId);

  assert.equal(exported.tokens.spacing.md,22,'global spacing token did not persist');
  assert.equal(exported.theme.typography.h1.weight,820,'global H1 weight did not persist');
  assert.equal(exported.theme.button.radius,18,'global button geometry did not persist');
  assert.equal(exported.container.style.base.gridTemplateColumns,'repeat(auto-fit,minmax(260px,1fr))','desktop auto-fit grid missing in model');
  assert.equal(exported.container.style.mobile.gridTemplateColumns,'repeat(1,minmax(0,1fr))','mobile grid override missing in model');
  assert.ok(exported.image,'configured responsive image missing from model');
  assert.equal(exported.image.props.position,'50% 0%','image focal point did not persist');
  assert.ok(exported.html.includes('--wb-space-md:22px'),'design token CSS missing from export');
  assert.ok(exported.html.includes('font-weight:820'),'global typography did not reach export');
  assert.ok(exported.html.includes('border-radius:18px'),'global button geometry did not reach export');
  assert.ok(exported.html.includes('grid-template-columns:repeat(auto-fit,minmax(260px,1fr))'),'desktop auto-fit grid missing from export');
  assert.ok(exported.html.includes('grid-template-columns:repeat(1,minmax(0,1fr))'),'mobile grid override missing from export');
  assert.ok(exported.html.includes('gap:var(--wb-space-lg)'),'token gap missing from export');
  assert.ok(exported.html.includes('srcset="https://cdn.example/image-640.jpg 640w, https://cdn.example/image-1280.jpg 1280w"'),'srcset missing from export');
  assert.ok(exported.html.includes('sizes="(max-width: 760px) 100vw, 50vw"'),'sizes missing from export');
  assert.ok(exported.html.includes('loading="eager"'),'image loading strategy missing from export');
  assert.ok(exported.html.includes('fetchpriority="high"'),'image fetch priority missing from export');
  assert.ok(exported.html.includes('decoding="async"'),'image decoding missing from export');
  assert.ok(exported.html.includes('filter:saturate(1.06) contrast(1.03)'),'image filter missing from export CSS');
  assert.ok(exported.html.includes('clip-path:circle(50% at 50% 50%)'),'image mask missing from export CSS');
  assert.deepEqual(errors,[],`Design system browser page errors:\n${errors.join('\n')}`);
  console.log(`V6_DESIGN_SYSTEM_E2E_OK${exported.moduleQuery?' VERSIONED':''}`);
}finally{await browser.close()}
