import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,makeHtml,makeMap,makeForm,container,block} from '../v5-model.mjs';
import {renderNode} from '../v5-render-core.mjs';
import {exportedDocument} from '../v5-export.mjs';
import {validateProjectInput,validateExportPaths,safeResourceUrl,safeNavigationUrl} from '../v6-safety.mjs';
import {catalogMeta} from '../v6-catalog.mjs';

test('project import rejects malformed and dangerous payloads before mutation',()=>{
 for(const value of [null,{},[],{schemaVersion:5,pages:[]},{schemaVersion:99,pages:[{blocks:[]}]},JSON.parse('{"pages":[{"blocks":[]}],"__proto__":{}}'),{schemaVersion:5,pages:[{blocks:[{}]}]}])assert.throws(()=>validateProjectInput(value));
 assert.equal(validateProjectInput(defaultProject()).schemaVersion,5);
});
test('archive refuses traversal, backslash, duplicate and encoded paths',()=>{
 for(const paths of [['../index.html'],['a/../../x.html'],['/x.html'],['a\\x.html'],['a%2fx.html'],['index.html','INDEX.html'],['404.html','404.html']])assert.throws(()=>validateExportPaths(paths));
 assert.deepEqual(validateExportPaths(['index.html','az/index.html','about.html']),['index.html','az/index.html','about.html']);
});
test('resource and navigation schemes cannot execute imported JavaScript',()=>{
 for(const url of ['javascript:alert(1)','JaVaScRiPt:alert(1)','java\nscript:alert(1)','data:text/html,<script>1</script>','vbscript:1']){assert.equal(safeResourceUrl(url),'');assert.equal(safeNavigationUrl(url),'#')}
 assert.equal(safeResourceUrl('data:image/png;base64,AA',{image:true}),'data:image/png;base64,AA');
});
test('custom HTML is isolated in editor and remains author-controlled in export',()=>{
 const p=defaultProject(),pg=p.pages[0],n=makeHtml('<img src=x onerror="window.parent.test=1">');
 const editor=renderNode(p,pg,n,{editor:true});assert.match(editor,/<iframe[^>]+sandbox=""/);assert.doesNotMatch(editor,/<img src=x/);
 assert.match(renderNode(p,pg,n),/<img src=x/);
 const map=renderNode(p,pg,makeMap('javascript:alert(1)'),{editor:true});assert.doesNotMatch(map,/javascript:/);
});
test('CSS cannot terminate the exported style element',()=>{
 const p=defaultProject();p.theme.customCss='</style><script>window.injected=1</script>';
 const out=exportedDocument(p,p.pages[0]);assert.doesNotMatch(out,/<script>window.injected/);assert.match(out,/\\3c \/style>/);
});
test('form submission format reaches the public runtime',()=>{
 const p=defaultProject(),f=makeForm();f.props.submission.format='json';p.pages[0].blocks=[block('Form',container([f]))];
 assert.match(exportedDocument(p,p.pages[0]),/data-format="json"/);
});
test('catalog supports local-language discovery without constructing presets',()=>{
 assert.match(catalogMeta('premiumPricing','ru').name,/Тариф/);assert.match(catalogMeta('premiumPricing','az').name,/Tarif/);
 assert.match(catalogMeta('premiumPricing','ru').keywords,/Pricing/);
});
test('new projects start with the premium collection',()=>{
 assert.deepEqual(defaultProject().pages[0].blocks.map(b=>b.preset),['navbar','premiumHeroSaas','premiumBento','premiumCtaBanner','footer']);
});
