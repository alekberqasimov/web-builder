import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,makeForm,makeReviews,walk} from '../v5-model.mjs';
import {renderNode} from '../v5-render-core.mjs';
import {exportedDocument} from '../v5-export.mjs';
import {FUNCTIONAL_READY_TYPES,makeFunctionalPreset} from '../v6-functional-blocks.mjs';

function firstNode(block,type){let hit=null;walk(block.root,n=>{if(!hit&&n.type===type)hit=n});return hit}

test('functional ready block catalog builds real sections',()=>{
  assert.deepEqual(FUNCTIONAL_READY_TYPES,['form','videoSection','embedSection','socialSection','mapSection','reviewsSlider','tabsSection','accordionSection','floatingContact']);
  for(const type of FUNCTIONAL_READY_TYPES){const b=makeFunctionalPreset(type);assert.ok(b,`${type} missing`);assert.equal(b.type,'section');assert.equal(b.preset,type)}
});

test('form model exposes editable fields and destination settings',()=>{
  const form=makeForm();
  assert.equal(form.type,'form');
  assert.ok(form.props.fields.length>=5);
  assert.equal(form.props.submission.provider,'formspree');
  assert.equal(form.props.submission.ajax,true);
  assert.equal(form.props.submission.honeypot,true);
  assert.ok(form.props.fields.some(x=>x.type==='textarea'));
});

test('form renderer supports Formspree and Web3Forms destinations',()=>{
  const project=defaultProject(),page=project.pages[0],form=makeForm();
  form.props.submission.endpoint='https://formspree.io/f/example';
  let html=renderNode(project,page,form,{editor:false});
  assert.match(html,/data-v5-form="1"/);
  assert.match(html,/action="https:\/\/formspree\.io\/f\/example"/);
  assert.match(html,/name="email"/);
  form.props.submission.provider='web3forms';
  form.props.submission.endpoint='';
  form.props.submission.accessKey='demo-key';
  html=renderNode(project,page,form,{editor:false});
  assert.match(html,/action="https:\/\/api\.web3forms\.com\/submit"/);
  assert.match(html,/name="access_key" value="demo-key"/);
});

test('functional presets contain expected editable nodes',()=>{
  assert.equal(firstNode(makeFunctionalPreset('form'),'form')?.type,'form');
  assert.equal(firstNode(makeFunctionalPreset('videoSection'),'video')?.type,'video');
  assert.equal(firstNode(makeFunctionalPreset('mapSection'),'map')?.type,'map');
  assert.equal(firstNode(makeFunctionalPreset('reviewsSlider'),'reviews')?.type,'reviews');
  assert.equal(firstNode(makeFunctionalPreset('tabsSection'),'tabs')?.type,'tabs');
});

test('reviews model and export include functional runtime and css',()=>{
  const reviews=makeReviews();
  assert.equal(reviews.props.items.length,3);
  const project=defaultProject(),page=project.pages[0];
  page.blocks.push(makeFunctionalPreset('reviewsSlider'));
  page.blocks.push(makeFunctionalPreset('form'));
  const form=firstNode(page.blocks.at(-1),'form');form.props.submission.endpoint='https://formspree.io/f/example';
  const html=exportedDocument(project,page);
  assert.match(html,/data-reviews="1"/);
  assert.match(html,/data-v5-form="1"/);
  assert.match(html,/v5-form-grid/);
  assert.match(html,/data-review-next/);
  assert.match(html,/document\.addEventListener\('submit'/);
});
