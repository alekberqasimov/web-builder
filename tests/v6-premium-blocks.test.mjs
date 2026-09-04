import test from 'node:test';
import assert from 'node:assert/strict';
import {PREMIUM_READY_TYPES,PREMIUM_BLOCK_META,makePremiumPreset} from '../v6-premium-blocks.mjs';
import {preset,defaultProject} from '../v5-model.mjs';
import {exportedDocument} from '../v5-export.mjs';

function types(root,out=[]){if(!root)return out;out.push(root.type);for(const child of root.children||[])types(child,out);return out}

test('premium library exposes twelve distinct commercial variants',()=>{
  assert.equal(PREMIUM_READY_TYPES.length,12);
  assert.equal(new Set(PREMIUM_READY_TYPES).size,12);
  for(const type of PREMIUM_READY_TYPES){
    assert.ok(PREMIUM_BLOCK_META[type],`metadata missing for ${type}`);
    const block=makePremiumPreset(type);
    assert.ok(block,`preset missing for ${type}`);
    assert.equal(block.preset,type);
    assert.equal(block.premiumVariant,true);
    assert.ok(block.root);
    assert.ok(block.style.base.paddingTop);
    assert.ok(block.style.mobile.paddingTop);
  }
});

test('premium media and conversion blocks contain real functional elements',()=>{
  assert.ok(types(makePremiumPreset('premiumMediaSplit').root).includes('video'));
  assert.ok(types(makePremiumPreset('premiumMediaMosaic').root).includes('gallery'));
  assert.ok(types(makePremiumPreset('premiumTestimonialSpotlight').root).includes('reviews'));
  assert.ok(types(makePremiumPreset('premiumFaqSplit').root).includes('accordion'));
  assert.ok(types(makePremiumPreset('premiumContactConversion').root).includes('form'));
});

test('premium variants do not mutate legacy ready block presets',()=>{
  const legacy=preset('hero');
  assert.ok(legacy);
  assert.notEqual(legacy.premiumVariant,true);
  assert.equal(legacy.preset,'hero');
});

test('premium blocks retain responsive styles and functional markup in static export',()=>{
  const project=defaultProject(),page=project.pages[0];
  page.blocks=[makePremiumPreset('premiumHeroSaas'),makePremiumPreset('premiumMediaSplit'),makePremiumPreset('premiumContactConversion')];
  const html=exportedDocument(project,page);
  assert.match(html,/Turn a strong idea into a premium digital experience/);
  assert.match(html,/class="[^"]*v5-video/);
  assert.match(html,/data-v5-form="1"/);
  assert.match(html,/@media\(max-width:760px\)/);
  assert.match(html,/data-v5-style=/);
});
