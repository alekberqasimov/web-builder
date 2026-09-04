import test from 'node:test';
import assert from 'node:assert/strict';
import {CUSTOM_SECTION_TYPES,customSectionLabel,makeCustomSection} from '../v6-custom-sections.mjs';

test('custom section catalog exposes the expected layouts',()=>{
  assert.deepEqual(CUSTOM_SECTION_TYPES.map(x=>x.type),['custom-blank','custom-1','custom-2','custom-3','custom-4','custom-grid','custom-nested']);
  assert.equal(customSectionLabel('custom-blank','ru'),'Пустая секция');
});

test('custom columns are responsive by default',()=>{
  const b=makeCustomSection('custom-4','ru');
  assert.equal(b.preset,'custom');
  assert.equal(b.root.children.length,4);
  assert.equal(b.root.style.base.gridTemplateColumns,'repeat(4,minmax(0,1fr))');
  assert.equal(b.root.style.tablet.gridTemplateColumns,'repeat(2,minmax(0,1fr))');
  assert.equal(b.root.style.mobile.gridTemplateColumns,'repeat(1,minmax(0,1fr))');
});

test('custom grid and blank section provide editable containers',()=>{
  const grid=makeCustomSection('custom-grid');
  assert.equal(grid.root.children.length,6);
  assert.equal(grid.root.style.base.gridTemplateColumns,'repeat(3,minmax(0,1fr))');
  assert.ok(grid.root.children.every(x=>x.type==='container'&&x.children.length===0));
  const blank=makeCustomSection('custom-blank');
  assert.equal(blank.root.type,'container');
  assert.equal(blank.root.children.length,0);
});

test('nested custom section creates a real nested container target',()=>{
  const b=makeCustomSection('custom-nested');
  const outer=b.root.children[0];
  const inner=outer.children[0];
  assert.equal(outer.type,'container');
  assert.equal(inner.type,'container');
  assert.equal(inner.children.length,0);
});
