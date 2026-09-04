import test from 'node:test';
import assert from 'node:assert/strict';
import {dropZoneFromRatio} from '../v5-navigator-dnd.mjs';
import {buildGradient,buildGradientStops,buildShadow,buildAnimation,buildBorder} from '../v5-visual-editors.mjs';
import {guideCandidates,nearestGuide} from '../v5-smart-guides.mjs';
import {snapAxis} from '../v5-free-position.mjs';
import {validPresetPayload} from '../v5-my-blocks.mjs';
import {bulkStylePatch,bulkValuePatch} from '../v5-bulk-actions.mjs';
import {filterAssets,assetCategory} from '../v5-assets.mjs';
import {normalizeTags,filterAssetMeta} from '../v5-asset-organizer.mjs';
import {filterIcons} from '../v5-icon-library.mjs';
import {buildProAnimation,motionCss} from '../v5-animation-pro.mjs';
import {minifyCss,minifyHtmlDocument} from '../v5-performance.mjs';
import {validPageTemplatePayload} from '../v5-page-templates.mjs';
import {responsiveAudit} from '../v5-responsive-audit.mjs';
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
  assert.equal(buildGradient('linear','#111111','#ffffff',90),'linear-gradient(90deg, #111111 0%, #ffffff 100%)');
  assert.equal(buildGradient('radial','#111111','#ffffff',0),'radial-gradient(circle, #111111 0%, #ffffff 100%)');
  assert.equal(buildGradient('none'),'');
  assert.equal(buildGradientStops('linear',[{color:'#111111',pos:0},{color:'#777777',pos:45},{color:'#ffffff',pos:100}],120),'linear-gradient(120deg, #111111 0%, #777777 45%, #ffffff 100%)');
});

test('visual border builder preserves four sides and radii',()=>{
  assert.deepEqual(buildBorder([1,2,3,4],'dashed','#112233',[5,6,7,8]),{borderWidth:'1px 2px 3px 4px',borderStyle:'dashed',borderColor:'#112233',borderRadius:'5px 6px 7px 8px'});
});

test('visual shadow builder preserves all controls',()=>{
  assert.equal(buildShadow(1,2,3,4,'#000'),'1px 2px 3px 4px #000');
});

test('animation preset builder supports disabled and timed states',()=>{
  assert.equal(buildAnimation('none',400,0,'ease'),'');
  assert.equal(buildAnimation('fadeIn',500,120,'ease-out'),'fadeIn 500ms ease-out 120ms both');
});

test('smart guides expose canvas and node alignment targets',()=>{
  const c=guideCandidates([{left:10,top:20,width:100,height:80}],{left:0,top:0,width:500,height:400});
  assert.ok(c.xs.some(x=>x.label==='CENTER X'&&x.value===60));
  assert.ok(c.xs.some(x=>x.label==='CANVAS CENTER'&&x.value===250));
  assert.equal(nearestGuide(c.xs,62,4)?.label,'CENTER X');
});

test('free position snap aligns element edges and centers',()=>{
  assert.equal(snapAxis(96,40,[{value:100,label:'LEFT'}],8).pos,100);
  assert.equal(snapAxis(178,40,[{value:200,label:'CENTER'}],8).pos,180);
  assert.equal(snapAxis(260,40,[{value:300,label:'RIGHT'}],8).pos,260);
});

test('bulk style helpers include spacing and typography',()=>{
  assert.deepEqual(bulkStylePatch('stretch'),{alignSelf:'stretch',width:'100%'});
  assert.deepEqual(bulkStylePatch('align-center'),{alignSelf:'center'});
  assert.deepEqual(bulkValuePatch('fontSize','18'),{fontSize:'18px'});
  assert.deepEqual(bulkValuePatch('padding','12px 20px'),{padding:'12px 20px'});
});

test('asset filters categorize search folders and tags',()=>{
  const list=[{id:'1',name:'Hero',type:'image/webp',folderId:'f1',tags:['hero','dark']},{id:'2',name:'Logo',type:'image/svg+xml',folderId:'',tags:['brand']},{id:'3',name:'Photo',type:'image/png',folderId:'f2',tags:['team']}];
  assert.equal(assetCategory(list[0]),'webp');
  assert.equal(filterAssets(list,'lo','all').length,1);
  assert.equal(filterAssets(list,'','svg')[0].name,'Logo');
  assert.deepEqual(normalizeTags('Hero, hero, DARK'),['hero','dark']);
  assert.equal(filterAssetMeta(list,'f1','dark').length,1);
  assert.equal(filterAssetMeta(list,'unfiled','brand')[0].id,'2');
});

test('icon library supports category and text search',()=>{
  assert.ok(filterIcons('phone','all').some(x=>x[2]==='☎'));
  assert.ok(filterIcons('','arrows').every(x=>x[0]==='arrows'));
});

test('pro animation and motion css are export-safe',()=>{
  assert.equal(buildProAnimation('slideLeft',600,80,'ease-out',2),'slideLeft 600ms ease-out 80ms 2 both');
  assert.match(motionCss(),/@keyframes slideLeft/);
  assert.match(motionCss(),/@keyframes bounceIn/);
});

test('performance minifier reduces safe html and css whitespace',()=>{
  assert.equal(minifyCss('a { color: red; }'),'a{color:red}');
  assert.equal(minifyHtmlDocument('<div>\n <span>A</span>\n </div>'),'<div><span>A</span></div>');
});

test('saved block and page template payload validation reject unrelated JSON',()=>{
  const block=preset('hero'),project=defaultProject();
  assert.equal(validPresetPayload({name:'Hero',block}),true);
  assert.equal(validPresetPayload({foo:'bar'}),false);
  assert.equal(validPageTemplatePayload({name:'Home',page:project.pages[0]}),true);
  assert.equal(validPageTemplatePayload({foo:'bar'}),false);
});

test('responsive audit catches oversized mobile values',()=>{
  const project=defaultProject(),b=preset('layout1');
  b.style.mobile.width='520px';project.pages[0].blocks.push(b);
  const r=responsiveAudit(project);
  assert.ok(r.issues.some(x=>/overflow 390px viewport/.test(x.msg)));
  assert.ok(r.score<100);
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
  assert.match(html,/@keyframes slideLeft/);
});
