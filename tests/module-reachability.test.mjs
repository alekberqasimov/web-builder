import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const modules=fs.readdirSync(root).filter(f=>/^(?:v5|v6)-.*\.mjs$/.test(f));
const moduleSet=new Set(modules);
const importRe=/(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]\.\/(v[56]-[^'"?]+\.mjs)(?:\?[^'"]*)?['"]/g;
const scriptRe=/<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["'](?:\.\/)?(v[56]-[^"'?]+\.mjs)(?:\?[^"']*)?["'][^>]*>/gi;

function deps(file){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  const out=[];let m;
  importRe.lastIndex=0;
  while((m=importRe.exec(text)))if(moduleSet.has(m[1]))out.push(m[1]);
  return out;
}

function browserEntries(){
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const entries=[];let m;
  while((m=scriptRe.exec(html)))if(moduleSet.has(m[1]))entries.push(m[1]);
  return [...new Set(entries)];
}

function reachableFrom(entries){
  const seen=new Set(),stack=[...entries];
  while(stack.length){const file=stack.pop();if(seen.has(file)||!moduleSet.has(file))continue;seen.add(file);for(const d of deps(file))stack.push(d)}
  return seen;
}

test('every production module is reachable from the V6 browser entry points',()=>{
  const entries=browserEntries();
  assert.ok(entries.includes('v6-app.mjs'),'index.html must load v6-app.mjs');
  assert.ok(entries.includes('v6-site-languages.mjs'),'index.html must load multilingual site entry point');
  const reachable=reachableFrom(entries);
  const unreachable=modules.filter(f=>!reachable.has(f)).sort();
  assert.deepEqual(unreachable,[],`Unreachable production modules: ${unreachable.join(', ')}`);
});
