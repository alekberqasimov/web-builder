import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,walk} from '../v5-model.mjs';
import {collectCss} from '../v5-public.mjs';
import {layoutDeviceKey,ownLayoutValue,inheritedLayoutValue,setLayoutValue,resetLayoutDevice} from '../v6-advanced-layout.mjs';

function firstNode(block,type){let hit=null;walk(block.root,n=>{if(!hit&&n.type===type)hit=n});return hit}
function escapeRe(v=''){return String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function assertResponsiveRule(css,width,id,declaration){
  const re=new RegExp(`@media\\(max-width:${width}px\\)\\{\\[data-v5-style="${escapeRe(id)}"\\]\\{[^}]*${escapeRe(declaration)}[^}]*\\}\\}`);
  assert.match(css,re,`missing ${width}px rule for ${id}: ${declaration}`);
}

test('advanced layout uses existing base tablet mobile style buckets',()=>{
  const p=defaultProject(),container=firstNode(p.pages[0].blocks[1],'container');
  assert.equal(layoutDeviceKey('desktop'),'base');
  setLayoutValue(container,'display','grid','desktop');
  setLayoutValue(container,'gridTemplateColumns','repeat(3, minmax(0, 1fr))','desktop');
  setLayoutValue(container,'gridTemplateColumns','repeat(2, minmax(0, 1fr))','tablet');
  setLayoutValue(container,'gridTemplateColumns','1fr','mobile');
  assert.equal(container.style.base.display,'grid');
  assert.equal(container.style.base.gridTemplateColumns,'repeat(3, minmax(0, 1fr))');
  assert.equal(container.style.tablet.gridTemplateColumns,'repeat(2, minmax(0, 1fr))');
  assert.equal(container.style.mobile.gridTemplateColumns,'1fr');
});

test('device inheritance is predictable and does not rewrite desktop values',()=>{
  const p=defaultProject(),container=firstNode(p.pages[0].blocks[1],'container');
  setLayoutValue(container,'rowGap','28px','desktop');
  assert.equal(inheritedLayoutValue(container,'rowGap','tablet'),'28px');
  assert.equal(inheritedLayoutValue(container,'rowGap','mobile'),'28px');
  setLayoutValue(container,'rowGap','18px','tablet');
  assert.equal(inheritedLayoutValue(container,'rowGap','mobile'),'18px');
  setLayoutValue(container,'rowGap','10px','mobile');
  assert.equal(container.style.base.rowGap,'28px');
  assert.equal(container.style.tablet.rowGap,'18px');
  assert.equal(container.style.mobile.rowGap,'10px');
});

test('blank responsive values restore inheritance',()=>{
  const p=defaultProject(),container=firstNode(p.pages[0].blocks[1],'container');
  setLayoutValue(container,'columnGap','24px','desktop');
  setLayoutValue(container,'columnGap','12px','mobile');
  setLayoutValue(container,'columnGap','','mobile');
  assert.equal(ownLayoutValue(container,'columnGap','mobile'),'');
  assert.equal(inheritedLayoutValue(container,'columnGap','mobile'),'24px');
});

test('grid and flex child properties export as responsive static CSS',()=>{
  const p=defaultProject(),page=p.pages[0],container=firstNode(page.blocks[1],'container'),child=container.children[0];
  setLayoutValue(container,'display','grid','desktop');
  setLayoutValue(container,'gridTemplateColumns','repeat(auto-fit, minmax(220px, 1fr))','desktop');
  setLayoutValue(container,'gridAutoFlow','row dense','desktop');
  setLayoutValue(container,'justifyItems','center','desktop');
  setLayoutValue(container,'placeContent','space-between','desktop');
  setLayoutValue(container,'gridTemplateColumns','1fr','mobile');
  setLayoutValue(child,'gridColumnEnd','span 2','desktop');
  setLayoutValue(child,'order','2','tablet');
  setLayoutValue(child,'flexGrow','1','mobile');
  const css=collectCss(p,page);
  assert.ok(css.includes('grid-template-columns:repeat(auto-fit, minmax(220px, 1fr))'));
  assert.ok(css.includes('grid-auto-flow:row dense'));
  assert.ok(css.includes('justify-items:center'));
  assert.ok(css.includes('place-content:space-between'));
  assertResponsiveRule(css,760,container.id,'grid-template-columns:1fr');
  assert.ok(css.includes('grid-column-end:span 2'));
  assertResponsiveRule(css,1180,child.id,'order:2');
  assertResponsiveRule(css,760,child.id,'flex-grow:1');
});

test('reset only clears advanced layout keys for current device',()=>{
  const p=defaultProject(),container=firstNode(p.pages[0].blocks[1],'container');
  container.style.mobile.color='red';
  setLayoutValue(container,'display','grid','mobile');
  setLayoutValue(container,'gridTemplateRows','auto 1fr','mobile');
  setLayoutValue(container,'order','3','mobile');
  resetLayoutDevice(container,'mobile');
  assert.equal(container.style.mobile.color,'red');
  assert.equal(container.style.mobile.display,undefined);
  assert.equal(container.style.mobile.gridTemplateRows,undefined);
  assert.equal(container.style.mobile.order,undefined);
});
