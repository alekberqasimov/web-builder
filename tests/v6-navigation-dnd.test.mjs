import test from 'node:test';
import assert from 'node:assert/strict';
import {makeNav} from '../v5-core.mjs';
import {advancedNavCss} from '../v5-nav-advanced.mjs';
import {precisionBlockDropIndex} from '../v6-dnd-precision.mjs';
import {modeOf} from '../v6-nav-config.mjs';

test('navigation keeps mobile controls and supports desktop dropdown mode',()=>{
  const nav=makeNav();
  assert.equal(nav.type,'nav');
  assert.equal(nav.props.mobileIcon,'☰');
  assert.equal(modeOf({props:{desktopMenu:'inline',className:''}}),'inline');
  assert.equal(modeOf({props:{desktopMenu:'dropdown',className:''}}),'dropdown');
  assert.equal(modeOf({props:{className:'custom v5-nav-desktop-dropdown'}}),'dropdown');
  const css=advancedNavCss();
  assert.match(css,/v5-nav-desktop-dropdown/);
  assert.match(css,/@media\(min-width:761px\)/);
});

test('precision block drop resolves exact insertion slots',()=>{
  const boxes=[
    {top:100,height:100},
    {top:200,height:100},
    {top:300,height:100}
  ];
  assert.equal(precisionBlockDropIndex(110,boxes),0);
  assert.equal(precisionBlockDropIndex(175,boxes),1);
  assert.equal(precisionBlockDropIndex(275,boxes),2);
  assert.equal(precisionBlockDropIndex(500,boxes),3);
});
