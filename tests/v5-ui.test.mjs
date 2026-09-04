import test from 'node:test';
import assert from 'node:assert/strict';
import {dropZoneFromRatio} from '../v5-navigator-dnd.mjs';
import {buildGradient,buildShadow,buildAnimation} from '../v5-visual-editors.mjs';
import {defaultProject,preset,makeButton,walk} from '../v5-model.mjs';
import {deepAuditProject} from '../v5-deep-audit.mjs';
import {exportedDocument} from '../v5-render.mjs';

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

test('deep audit catches long SEO title and insecure link',()=>{
  const project=defaultProject(),page=project.pages[0];
  page.seo.title='x'.repeat(70);
  const block=preset('layout1'),button=makeButton('Open');
  button.props.link={type:'url',value:'http://example.com',newTab:false,nofollow:false};
  block.root.children.push(button);page.blocks.push(block);
  const result=deepAuditProject(project);
  assert.ok(result.issues.some(x=>/SEO title is long/.test(x.msg)));
  assert.ok(result.issues.some(x=>/HTTPS/.test(x.msg)));
  assert.ok(result.score<100);
});

test('advanced navigation settings are rendered into export',()=>{
  const project=defaultProject(),page=project.pages[0];
  let nav=null;walk(page.blocks[0].root,n=>{if(n.type==='nav')nav=n});
  assert.ok(nav);
  Object.assign(nav.props,{logoWidth:210,logoHeight:58,desktopGap:34,mobilePanel:'left',mobilePanelWidth:360,mobileIconPosition:'center',mobileIconSize:31,background:'#112233',textColor:'#fefefe'});
  nav.props.cta={enabled:true,text:'Open docs',variant:'outline',position:'right',link:{type:'url',value:'example.com/docs',newTab:true,nofollow:false}};
  const html=exportedDocument(project,page);
  assert.match(html,/--nav-logo-w:210px/);
  assert.match(html,/--nav-mobile-w:360px/);
  assert.match(html,/data-panel="left"/);
  assert.match(html,/data-icon-pos="center"/);
  assert.match(html,/https:\/\/example\.com\/docs/);
  assert.match(html,/Open docs/);
});
