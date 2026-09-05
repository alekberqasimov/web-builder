import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,walk,findNode,styleBag} from '../v5-model.mjs';
import {collectCss} from '../v5-public.mjs';
import {ensureReuseConfig,createComponent,addComponentInstance,syncComponentInstances,detachSelectedComponent,deleteComponent,createStyleClass,applyStyleClass,detachStyleClass,classUsage,deleteStyleClass,canCreateComponent} from '../v6-reuse.mjs';
import {enforceComponentReferenceInvariant} from '../v6-reuse-guard.mjs';

function firstNode(block,type){let hit=null;walk(block.root,n=>{if(!hit&&n.type===type)hit=n});return hit}

test('reuse config is non-destructive for existing projects',()=>{
  const p=defaultProject();
  const heading=firstNode(p.pages[0].blocks[1],'heading');
  heading.style.base.borderRadius='37px';
  const before=JSON.stringify(heading.style);
  delete p.components;delete p.styleClasses;
  ensureReuseConfig(p);
  assert.deepEqual(p.components,[]);
  assert.deepEqual(p.styleClasses,[]);
  assert.equal(JSON.stringify(heading.style),before);
});

test('block component sync updates all instances while preserving concrete ids',()=>{
  const p=defaultProject(),page=p.pages[0],source=page.blocks[1];
  assert.equal(canCreateComponent(p,page,source.id,''),true,`default hero unexpectedly rejected: ${JSON.stringify({name:source.name,globalRole:source.globalRole,componentRef:source.componentRef})}`);
  const def=createComponent(p,page,source.id,'','Reusable Hero');
  assert.ok(def);
  const copy=addComponentInstance(p,def.id,page);
  assert.ok(copy);
  const sourceHeading=firstNode(source,'heading'),copyHeading=firstNode(copy,'heading');
  const copyBlockId=copy.id,copyHeadingId=copyHeading.id;
  sourceHeading.props.text='Updated everywhere';
  assert.equal(syncComponentInstances(p,def.id,source),true);
  const synced=page.blocks.find(x=>x.id===copyBlockId);
  assert.equal(synced.id,copyBlockId);
  assert.equal(firstNode(synced,'heading').id,copyHeadingId);
  assert.equal(firstNode(synced,'heading').props.text,'Updated everywhere');
});

test('detach makes a component instance local and delete keeps page content',()=>{
  const p=defaultProject(),page=p.pages[0],source=page.blocks[1];
  assert.equal(canCreateComponent(p,page,source.id,''),true);
  const def=createComponent(p,page,source.id,'','Hero Symbol');
  assert.ok(def);
  const copy=addComponentInstance(p,def.id,page);
  assert.ok(copy);
  const heading=firstNode(copy,'heading');heading.props.text='Local soon';
  assert.equal(detachSelectedComponent(p,page,copy.id,''),true);
  assert.equal(copy.componentRef,'');
  firstNode(source,'heading').props.text='Master changed';
  syncComponentInstances(p,def.id,source);
  assert.equal(firstNode(copy,'heading').props.text,'Local soon');
  deleteComponent(p,def.id);
  assert.ok(page.blocks.some(x=>x.id===copy.id));
  assert.equal(p.components.length,0);
});

test('nested component creation is rejected',()=>{
  const p=defaultProject(),page=p.pages[0],block=page.blocks[1];
  const child=firstNode(block,'heading');
  const def=createComponent(p,page,block.id,child.id,'Heading Symbol');
  assert.ok(def);
  assert.equal(canCreateComponent(p,page,block.id,''),false);
});

test('component invariant detaches illicit nested references but preserves concrete content',()=>{
  const p=defaultProject(),page=p.pages[0],source=page.blocks[1];
  const def=createComponent(p,page,source.id,'','Guarded Hero');
  assert.ok(def);
  const nested=firstNode(source,'heading');
  const originalText=nested.props.text;
  nested.componentRef='cmp_illicit_nested';
  def.template.root.children[0].componentRef='cmp_template_nested';
  const cleared=enforceComponentReferenceInvariant(p);
  assert.ok(cleared>=2);
  assert.equal(source.componentRef,def.id,'component root link must stay intact');
  assert.equal(nested.componentRef,'','nested instance link must detach');
  assert.equal(nested.props.text,originalText,'nested concrete content must be preserved');
  let definitionHasRef=false;
  walk(def.template.root,n=>{if(n.componentRef)definitionHasRef=true});
  assert.equal(definitionHasRef,false,'component definition must never contain nested references');
});

test('reusable styles export before local styles so local stays highest priority',()=>{
  const p=defaultProject(),page=p.pages[0],block=page.blocks[1],heading=firstNode(block,'heading');
  const clsStyle=styleBag();clsStyle.base.color='rgb(255,0,0)';clsStyle.mobile.fontSize='19px';
  const def=createStyleClass(p,'hero-title',clsStyle);applyStyleClass(heading,def.id);
  heading.style.base.color='rgb(0,0,255)';
  const css=collectCss(p,page),selector=`[data-v5-style="${heading.id}"]`;
  const sharedAt=css.indexOf(`${selector}{color:rgb(255,0,0)}`);
  const localColorAt=css.indexOf('color:rgb(0,0,255)',sharedAt+1);
  assert.ok(sharedAt>=0,'shared class rule missing');
  assert.ok(localColorAt>sharedAt,'local color must be emitted after reusable class color');
  assert.ok(css.includes(`@media(max-width:760px){${selector}{font-size:19px}}`));
  assert.equal(classUsage(p,def.id),1);
});

test('detach reusable style copies only missing shared values and preserves local overrides',()=>{
  const p=defaultProject(),block=p.pages[0].blocks[1],heading=firstNode(block,'heading');
  const s=styleBag();s.base.color='red';s.base.fontWeight='800';
  const def=createStyleClass(p,'title-shared',s);applyStyleClass(heading,def.id);
  heading.style.base.color='blue';
  detachStyleClass(heading,def);
  assert.equal(heading.style.base.color,'blue');
  assert.equal(heading.style.base.fontWeight,'800');
  assert.deepEqual(heading.classIds,[]);
});

test('deleting reusable style removes references without rewriting local styles',()=>{
  const p=defaultProject(),block=p.pages[0].blocks[1],heading=firstNode(block,'heading');
  const s=styleBag();s.base.padding='11px';const def=createStyleClass(p,'temp-style',s);applyStyleClass(heading,def.id);
  heading.style.base.borderRadius='37px';deleteStyleClass(p,def.id);
  assert.equal(heading.style.base.borderRadius,'37px');
  assert.deepEqual(heading.classIds,[]);
  assert.equal(p.styleClasses.length,0);
});
