import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const modules=fs.readdirSync(root).filter(f=>/^(?:v5|v6)-.*\.mjs$/.test(f));
const moduleSet=new Set(modules);
const importRe=/(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]\.\/(v[56]-[^'"?]+\.mjs)(?:\?[^'"]*)?['"]/g;

function deps(file){
  const text=fs.readFileSync(path.join(root,file),'utf8');
  const out=[];let m;
  while((m=importRe.exec(text)))if(moduleSet.has(m[1]))out.push(m[1]);
  return out;
}

function reachableFrom(entries){
  const seen=new Set(),stack=[...entries];
  while(stack.length){const file=stack.pop();if(seen.has(file)||!moduleSet.has(file))continue;seen.add(file);for(const d of deps(file))stack.push(d)}
  return seen;
}

test('every production module is reachable from the V6 browser entry points',()=>{
  const reachable=reachableFrom(['v6-app.mjs','v6-ux.mjs']);
  const unreachable=modules.filter(f=>!reachable.has(f)).sort();
  assert.deepEqual(unreachable,[],`Unreachable production modules: ${unreachable.join(', ')}`);
});
