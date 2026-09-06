import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const base=process.env.E2E_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});

async function normalStartup(){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:12000});
  assert.equal(errors.length,0,`normal startup page errors: ${errors.join('\n')}`);
  await context.close();
}

async function blockedStorageStartup(){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.addInitScript(()=>{
    try{Object.defineProperty(indexedDB,'open',{configurable:true,value:()=>({})})}catch{}
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.stack||e)));
  const started=Date.now();
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#canvas [data-block-id]',{timeout:12000});
  const elapsed=Date.now()-started;
  assert.ok(elapsed<9000,`storage fallback startup took ${elapsed}ms`);
  assert.equal(errors.length,0,`blocked-storage startup page errors: ${errors.join('\n')}`);
  await context.close();
}

try{
  await normalStartup();
  await blockedStorageStartup();
  console.log('V6_STARTUP_RESILIENCE_OK');
}finally{await browser.close()}
