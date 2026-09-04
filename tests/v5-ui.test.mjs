import test from 'node:test';
import assert from 'node:assert/strict';
import {dropZoneFromRatio} from '../v5-navigator-dnd.mjs';
import {buildGradient,buildShadow,buildAnimation} from '../v5-visual-editors.mjs';

test('navigator drop zones distinguish before inside after',()=>{
  assert.equal(dropZoneFromRatio(.1,true,true),'before');
  assert.equal(dropZoneFromRatio(.5,true,true),'inside');
  assert.equal(dropZoneFromRatio(.9,true,true),'after');
  assert.equal(dropZoneFromRatio(.2,false,true),'before');
  assert.equal(dropZoneFromRatio(.8,false,true),'after');
});

test('visual gradient builder is deterministic',()=>{
  assert.equal(buildGradient('linear','#111111','#ffffff',90),'linear-gradient(90deg, #111111, #ffffff)');
  assert.equal(buildGradient('radial','#111111','#ffffff',0),'radial-gradient(circle, #111111, #ffffff)');
  assert.equal(buildGradient('none'),'');
});

test('visual shadow builder preserves all controls',()=>{
  assert.equal(buildShadow(1,2,3,4,'#000'),'1px 2px 3px 4px #000');
});

test('animation preset builder supports disabled and timed states',()=>{
  assert.equal(buildAnimation('none',400,0,'ease'),'');
  assert.equal(buildAnimation('fadeIn',500,120,'ease-out'),'fadeIn 500ms ease-out 120ms both');
});
