import {uid,clone,walk,styleBag,findNode} from './v5-model.mjs';
import {$,state,currentPage,currentBlock,currentNode,mutate,attr,esc} from './v5-runtime.mjs';

const COPY={
  en:{legend:'Components & Reusable Styles',component:'Global Component',make:'Make global component',detach:'Detach / make local',auto:'Linked · edits update every instance',classes:'Reusable classes',createClass:'Create from local style',apply:'Apply class',remove:'Remove',detachClass:'Detach to local',updateClass:'Update class from local',components:'Global Components',styles:'Reusable Styles',add:'Add',rename:'Rename',duplicate:'Duplicate',delete:'Delete',used:'Used',none:'None yet',siteHint:'Edit any linked instance once and all linked copies update. Export stays static HTML.',legacy:'Global Header / Footer remain supported separately.'},
  az:{legend:'Komponentlər və Reusable Styles',component:'Global Component',make:'Global component et',detach:'Ayır / local copy et',auto:'Bağlıdır · dəyişiklik bütün instancelarda yenilənir',classes:'Reusable class-lar',createClass:'Local stildən class yarat',apply:'Class tətbiq et',remove:'Sil',detachClass:'Local-a ayır',updateClass:'Local stildən class-ı yenilə',components:'Global Components',styles:'Reusable Styles',add:'Əlavə et',rename:'Adını dəyiş',duplicate:'Kopyala',delete:'Sil',used:'İstifadə',none:'Hələ yoxdur',siteHint:'İstənilən bağlı instance-i bir dəfə dəyiş — bütün bağlı nüsxələr yenilənir. Export static HTML qalır.',legacy:'Global Header / Footer ayrıca dəstəklənməyə davam edir.'},
  ru:{legend:'Компоненты и Reusable Styles',component:'Global Component',make:'Сделать global component',detach:'Отвязать / сделать local',auto:'Связан · изменения обновят все экземпляры',classes:'Reusable классы',createClass:'Создать класс из local style',apply:'Применить класс',remove:'Убрать',detachClass:'Отвязать в local',updateClass:'Обновить класс из local',components:'Global Components',styles:'Reusable Styles',add:'Добавить',rename:'Переименовать',duplicate:'Дублировать',delete:'Удалить',used:'Используется',none:'Пока нет',siteHint:'Измени любой связанный экземпляр один раз — обновятся все связанные копии. Экспорт остаётся static HTML.',legacy:'Global Header / Footer продолжают работать отдельно.'}
};
const tx=k=>COPY[state.project?.uiLang||'ru']?.[k]||COPY.en[k]||k;

export function ensureReuseConfig(project){
  if(!project||typeof project!=='object')return project;
  if(!Array.isArray(project.components))project.components=[];
  if(!Array.isArray(project.styleClasses))project.styleClasses=[];
  return project;
}

function normalizeIds(value){
  const c=clone(value);
  const rec=x=>{
    if(!x||typeof x!=='object')return;
    if(Array.isArray(x)){x.forEach(rec);return}
    delete x.id;delete x.componentRef;
    for(const v of Object.values(x))rec(v);
  };
  rec(c);return c;
}
const signature=value=>JSON.stringify(normalizeIds(value));
function remapNodeIds(n,existing=null){
  if(!n)return n;
  n.id=existing?.id||uid('el');
  const kids=n.children||[],old=existing?.children||[];
  for(let i=0;i<kids.length;i++)remapNodeIds(kids[i],old[i]?.type===kids[i].type?old[i]:null);
  return n;
}
function materialize(def,existing=null){
  const x=clone(def.template);
  if(def.kind==='block'){
    x.id=existing?.id||uid('block');
    x.componentRef=def.id;
    x.globalRole='';
    remapNodeIds(x.root,existing?.root||null);
  }else{
    x.componentRef=def.id;
    remapNodeIds(x,existing||null);
  }
  return x;
}
function componentDefinition(project,id){return ensureReuseConfig(project)?.components.find(x=>x.id===id)||null}
function containsComponentRefNode(root){let hit=false;walk(root,n=>{if(n.componentRef)hit=true});return hit}
function nodePath(root,id,path=[]){
  if(!root)return null;
  const next=[...path,root];
  if(root.id===id)return next;
  for(const c of root.children||[]){const found=nodePath(c,id,next);if(found)return found}
  return null;
}
export function selectedComponentOwner(project,page,blockId,nodeId=''){
  ensureReuseConfig(project);
  const pg=project?.pages?.find(p=>p.id===page?.id)||page;
  const b=pg?.blocks?.find(x=>x.id===blockId);
  if(!b)return null;
  if(b.componentRef)return{kind:'block',instance:b,id:b.componentRef,block:b};
  if(!nodeId)return null;
  const path=nodePath(b.root,nodeId)||[];
  const n=[...path].reverse().find(x=>x.componentRef);
  return n?{kind:'node',instance:n,id:n.componentRef,block:b}:null;
}
export function canCreateComponent(project,page,blockId,nodeId=''){
  const b=page?.blocks?.find(x=>x.id===blockId);if(!b)return false;
  if(b.globalRole||b.componentRef)return false;
  if(!nodeId)return !containsComponentRefNode(b.root);
  const path=nodePath(b.root,nodeId)||[];
  if(path.some(x=>x.componentRef))return false;
  const n=path.at(-1);return !!n&&!containsComponentRefNode(n);
}
export function createComponent(project,page,blockId,nodeId='',name='Component'){
  ensureReuseConfig(project);
  if(!canCreateComponent(project,page,blockId,nodeId))return null;
  const b=page.blocks.find(x=>x.id===blockId),source=nodeId?findNode(b.root,nodeId):b;
  if(!source)return null;
  const def={id:uid('cmp'),name:String(name||'Component').trim()||'Component',kind:nodeId?'node':'block',template:clone(source),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  delete def.template.componentRef;
  if(def.kind==='block')def.template.globalRole='';
  project.components.push(def);source.componentRef=def.id;return def;
}
function replaceNodeInstances(root,def,source){
  if(!root?.children)return;
  for(let i=0;i<root.children.length;i++){
    const n=root.children[i];
    if(n.componentRef===def.id&&n!==source){root.children[i]=materialize(def,n);continue}
    replaceNodeInstances(n,def,source);
  }
}
export function syncComponentInstances(project,componentId,sourceInstance=null){
  ensureReuseConfig(project);const def=componentDefinition(project,componentId);if(!def||!sourceInstance)return false;
  if(signature(def.template)===signature(sourceInstance))return false;
  def.template=clone(sourceInstance);delete def.template.componentRef;if(def.kind==='block')def.template.globalRole='';def.updatedAt=new Date().toISOString();
  for(const pg of project.pages||[]){
    for(let i=0;i<(pg.blocks||[]).length;i++){
      const b=pg.blocks[i];
      if(def.kind==='block'&&b.componentRef===def.id&&b!==sourceInstance){pg.blocks[i]=materialize(def,b);continue}
      replaceNodeInstances(b.root,def,sourceInstance);
    }
  }
  return true;
}
export function syncSelectedComponent(project,page,blockId,nodeId=''){
  const owner=selectedComponentOwner(project,page,blockId,nodeId);if(!owner)return false;
  return syncComponentInstances(project,owner.id,owner.instance);
}
export function detachSelectedComponent(project,page,blockId,nodeId=''){
  const owner=selectedComponentOwner(project,page,blockId,nodeId);if(!owner)return false;owner.instance.componentRef='';return true;
}
export function componentUsage(project,id){
  let count=0;for(const pg of project?.pages||[])for(const b of pg.blocks||[]){if(b.componentRef===id)count++;walk(b.root,n=>{if(n.componentRef===id)count++})}return count;
}
export function deleteComponent(project,id){
  ensureReuseConfig(project);let found=false;
  for(const pg of project.pages||[])for(const b of pg.blocks||[]){if(b.componentRef===id){b.componentRef='';found=true}walk(b.root,n=>{if(n.componentRef===id){n.componentRef='';found=true}})}
  project.components=project.components.filter(x=>x.id!==id);return found;
}
function targetInsideComponent(project,page,block,node){
  if(!block)return false;if(block.componentRef)return true;if(!node)return false;const path=nodePath(block.root,node.id)||[];return path.some(x=>x.componentRef);
}
export function addComponentInstance(project,id,page,block=null,node=null){
  ensureReuseConfig(project);const def=componentDefinition(project,id);if(!def||!page)return null;
  if(def.kind==='block'){
    const x=materialize(def),footerIndex=page.blocks.findIndex(b=>b.globalRole==='footer'||b.preset==='footer');
    footerIndex>=0?page.blocks.splice(footerIndex,0,x):page.blocks.push(x);return x;
  }
  const host=node?.type==='container'?node:block?.root;
  if(!host||host.type!=='container'||targetInsideComponent(project,page,block,node))return null;
  const x=materialize(def);host.children??=[];host.children.push(x);return x;
}

function selectionTarget(page,blockId,nodeId=''){const b=page?.blocks?.find(x=>x.id===blockId);if(!b)return null;return nodeId?findNode(b.root,nodeId):b}
function classDefinition(project,id){return ensureReuseConfig(project)?.styleClasses.find(x=>x.id===id)||null}
function freshStyle(){return styleBag()}
export function createStyleClass(project,name,style=null){
  ensureReuseConfig(project);const clean=String(name||'Style').trim()||'Style';if(project.styleClasses.some(x=>x.name.toLowerCase()===clean.toLowerCase()))return null;
  const x={id:uid('cls'),name:clean,style:clone(style||freshStyle()),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};project.styleClasses.push(x);return x;
}
export function applyStyleClass(target,id){if(!target)return false;target.classIds=Array.isArray(target.classIds)?target.classIds:[];if(target.classIds.includes(id))return false;target.classIds.push(id);return true}
export function removeStyleClass(target,id){if(!target||!Array.isArray(target.classIds))return false;const before=target.classIds.length;target.classIds=target.classIds.filter(x=>x!==id);return before!==target.classIds.length}
function mergeStyleMissing(local,shared){for(const stateKey of['base','tablet','mobile','hover','focus']){local[stateKey]??={};for(const[k,v]of Object.entries(shared?.[stateKey]||{}))if(local[stateKey][k]===undefined||local[stateKey][k]==='')local[stateKey][k]=v}return local}
export function detachStyleClass(target,def){if(!target||!def)return false;target.style=mergeStyleMissing(clone(target.style||freshStyle()),def.style);return removeStyleClass(target,def.id)}
export function promoteLocalStyleToClass(target,def){if(!target||!def)return false;def.style=clone(target.style||freshStyle());def.updatedAt=new Date().toISOString();target.style=freshStyle();applyStyleClass(target,def.id);return true}
export function classUsage(project,id,verbose=false){
  let count=0;const labels=[];for(const pg of project?.pages||[])for(const b of pg.blocks||[]){if((b.classIds||[]).includes(id)){count++;if(verbose)labels.push(`${pg.name} / ${b.name||'Section'}`)}walk(b.root,n=>{if((n.classIds||[]).includes(id)){count++;if(verbose)labels.push(`${pg.name} / ${b.name||'Section'} / ${n.name||n.type}`)}})}return verbose?{count,labels}:count;
}
export function deleteStyleClass(project,id){
  ensureReuseConfig(project);for(const pg of project.pages||[])for(const b of pg.blocks||[]){removeStyleClass(b,id);walk(b.root,n=>removeStyleClass(n,id))}project.styleClasses=project.styleClasses.filter(x=>x.id!==id);
}

function appliedClassHtml(target){
  const ids=target?.classIds||[],defs=ensureReuseConfig(state.project).styleClasses.filter(x=>ids.includes(x.id));
  return defs.length?defs.map(x=>`<span class="v6-reuse-chip"><b>${esc(x.name)}</b><button type="button" data-reuse-class-detach="${attr(x.id)}" title="${tx('detachClass')}">↗</button><button type="button" data-reuse-class-remove="${attr(x.id)}" title="${tx('remove')}">×</button></span>`).join(''):`<small>${tx('none')}</small>`;
}
function selectionHtml(){
  const pg=currentPage(),b=currentBlock(),n=currentNode(),target=n||b;if(!pg||!b||!target)return'';
  const owner=selectedComponentOwner(state.project,pg,b.id,n?.id||''),canMake=canCreateComponent(state.project,pg,b.id,n?.id||''),available=state.project.styleClasses.filter(x=>!(target.classIds||[]).includes(x.id));
  return `<fieldset id="v6ReuseSelection"><legend>${tx('legend')} · PRO</legend><div class="v6-reuse-sub"><strong>${tx('component')}</strong>${owner?`<span class="v6-reuse-linked">● ${esc(componentDefinition(state.project,owner.id)?.name||'Component')}</span><small>${tx('auto')}</small><button type="button" data-reuse-cmd="detach-component">${tx('detach')}</button>`:canMake?`<button type="button" data-reuse-cmd="make-component">＋ ${tx('make')}</button>`:`<small>Nested/global header-footer references cannot be wrapped again.</small>`}</div><div class="v6-reuse-sub"><strong>${tx('classes')}</strong><div class="v6-reuse-chips">${appliedClassHtml(target)}</div><div class="v6-reuse-row"><select data-reuse-class-select><option value="">${tx('apply')}…</option>${available.map(x=>`<option value="${attr(x.id)}">${esc(x.name)}</option>`).join('')}</select><button type="button" data-reuse-cmd="apply-class">${tx('apply')}</button></div><button type="button" data-reuse-cmd="create-class">＋ ${tx('createClass')}</button>${(target.classIds||[]).length?`<button type="button" data-reuse-cmd="update-class">↻ ${tx('updateClass')}</button>`:''}</div></fieldset>`;
}
function siteHtml(){
  ensureReuseConfig(state.project);const comps=state.project.components,styles=state.project.styleClasses;
  return `<fieldset id="v6ReuseManager"><legend>${tx('components')} · PRO</legend><div class="v6-reuse-note">${tx('siteHint')}<br>${tx('legacy')}</div><div class="v6-reuse-list">${comps.map(x=>`<div class="v6-reuse-item"><div><strong>${esc(x.name)}</strong><small>${x.kind} · ${tx('used')}: ${componentUsage(state.project,x.id)}</small></div><div><button type="button" data-reuse-add="${attr(x.id)}">${tx('add')}</button><button type="button" data-reuse-rename-component="${attr(x.id)}" title="${tx('rename')}">✎</button><button type="button" data-reuse-delete-component="${attr(x.id)}" class="danger" title="${tx('delete')}">×</button></div></div>`).join('')||`<small>${tx('none')}</small>`}</div></fieldset><fieldset id="v6StyleManager"><legend>${tx('styles')} · PRO</legend><div class="v6-reuse-list">${styles.map(x=>{const u=classUsage(state.project,x.id,true);return`<div class="v6-reuse-item"><div><strong>${esc(x.name)}</strong><small title="${attr(u.labels.join(' · '))}">${tx('used')}: ${u.count}${u.labels.length?` · ${esc(u.labels.slice(0,2).join(' · '))}`:''}</small></div><div><button type="button" data-reuse-duplicate-class="${attr(x.id)}" title="${tx('duplicate')}">⧉</button><button type="button" data-reuse-rename-class="${attr(x.id)}" title="${tx('rename')}">✎</button><button type="button" data-reuse-delete-class="${attr(x.id)}" class="danger" title="${tx('delete')}">×</button></div></div>`}).join('')||`<small>${tx('none')}</small>`}</div></fieldset>`;
}
export function enhanceReuseUi(){
  if(!state.project)return;ensureReuseConfig(state.project);
  const active=state.activeRight;
  if((active==='block'||active==='element')){const panel=$(active==='block'?'#blockInspector':'#elementInspector');if(panel&&!panel.querySelector('#v6ReuseSelection'))panel.insertAdjacentHTML('beforeend',selectionHtml())}
  if(active==='site'){const panel=$('#siteInspector');if(panel&&!panel.querySelector('#v6ReuseManager'))panel.insertAdjacentHTML('afterbegin',siteHtml())}
}
function selectedTarget(){return selectionTarget(currentPage(),state.selectedBlockId,state.selectedNodeId)}
function handleClick(e){
  const cmd=e.target.closest('[data-reuse-cmd]')?.dataset.reuseCmd;
  if(cmd==='make-component'){
    const name=prompt('Component name',currentNode()?.name||currentBlock()?.name||'Component');if(!name)return;
    mutate('Create global component',()=>createComponent(state.project,currentPage(),state.selectedBlockId,state.selectedNodeId,name));return;
  }
  if(cmd==='detach-component'){mutate('Detach global component',()=>detachSelectedComponent(state.project,currentPage(),state.selectedBlockId,state.selectedNodeId));return}
  if(cmd==='create-class'){
    const target=selectedTarget();if(!target)return;const name=prompt('Reusable class name','card-premium');if(!name)return;
    mutate('Create reusable class',()=>{const def=createStyleClass(state.project,name,target.style||freshStyle());if(def){target.style=freshStyle();applyStyleClass(target,def.id)}});return;
  }
  if(cmd==='apply-class'){
    const target=selectedTarget(),sel=e.currentTarget.querySelector('[data-reuse-class-select]');if(!target||!sel?.value)return;mutate('Apply reusable class',()=>applyStyleClass(target,sel.value));return;
  }
  if(cmd==='update-class'){
    const target=selectedTarget(),id=target?.classIds?.at(-1),def=classDefinition(state.project,id);if(!target||!def)return;mutate('Update reusable class',()=>promoteLocalStyleToClass(target,def));return;
  }
  const rem=e.target.closest('[data-reuse-class-remove]');if(rem){const target=selectedTarget();mutate('Remove reusable class',()=>removeStyleClass(target,rem.dataset.reuseClassRemove));return}
  const det=e.target.closest('[data-reuse-class-detach]');if(det){const target=selectedTarget(),def=classDefinition(state.project,det.dataset.reuseClassDetach);mutate('Detach reusable class',()=>detachStyleClass(target,def));return}
  const add=e.target.closest('[data-reuse-add]');if(add){mutate('Add component instance',()=>{const b=currentBlock(),n=currentNode(),x=addComponentInstance(state.project,add.dataset.reuseAdd,currentPage(),b,n);if(x){if(componentDefinition(state.project,add.dataset.reuseAdd)?.kind==='block'){state.selectedBlockId=x.id;state.selectedNodeId='';state.activeRight='block'}else{state.selectedNodeId=x.id;state.activeRight='element'}}});return}
  const rc=e.target.closest('[data-reuse-rename-component]');if(rc){const d=componentDefinition(state.project,rc.dataset.reuseRenameComponent),name=d&&prompt('Component name',d.name);if(name)mutate('Rename component',()=>d.name=name.trim()||d.name);return}
  const dc=e.target.closest('[data-reuse-delete-component]');if(dc){const d=componentDefinition(state.project,dc.dataset.reuseDeleteComponent);if(d&&confirm(`Delete component “${d.name}”? Linked instances will become local copies.`))mutate('Delete component',()=>deleteComponent(state.project,d.id));return}
  const dup=e.target.closest('[data-reuse-duplicate-class]');if(dup){const d=classDefinition(state.project,dup.dataset.reuseDuplicateClass);if(d)mutate('Duplicate reusable class',()=>{let name=`${d.name} Copy`,n=2;while(state.project.styleClasses.some(x=>x.name===name))name=`${d.name} Copy ${n++}`;createStyleClass(state.project,name,d.style)});return}
  const rcl=e.target.closest('[data-reuse-rename-class]');if(rcl){const d=classDefinition(state.project,rcl.dataset.reuseRenameClass),name=d&&prompt('Reusable class name',d.name);if(name&&!state.project.styleClasses.some(x=>x.id!==d.id&&x.name.toLowerCase()===name.trim().toLowerCase()))mutate('Rename reusable class',()=>d.name=name.trim()||d.name);return}
  const dcl=e.target.closest('[data-reuse-delete-class]');if(dcl){const d=classDefinition(state.project,dcl.dataset.reuseDeleteClass);if(d&&confirm(`Delete reusable class “${d.name}”?`))mutate('Delete reusable class',()=>deleteStyleClass(state.project,d.id));return}
}
function css(){if(document.getElementById('v6ReuseCss'))return;const s=document.createElement('style');s.id='v6ReuseCss';s.textContent=`#v6ReuseSelection,#v6ReuseManager,#v6StyleManager{border-color:rgba(86,130,255,.34)!important;background:linear-gradient(180deg,rgba(72,108,255,.07),rgba(255,255,255,.01))!important}.v6-reuse-sub{display:grid;gap:7px;margin:8px 0;padding:9px;border:1px solid rgba(128,138,160,.18);border-radius:10px}.v6-reuse-linked{color:#52d39a;font-size:10px}.v6-reuse-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}.v6-reuse-chips{display:flex;gap:5px;flex-wrap:wrap}.v6-reuse-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 5px 4px 8px;border:1px solid rgba(112,92,255,.28);border-radius:999px;background:rgba(112,92,255,.08);font-size:9px}.v6-reuse-chip button{min-width:22px!important;width:22px!important;height:22px!important;padding:0!important}.v6-reuse-note{font-size:9.5px;line-height:1.45;color:#9fa9bd;margin-bottom:8px}.v6-reuse-list{display:grid;gap:6px}.v6-reuse-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px;border:1px solid rgba(128,138,160,.18);border-radius:9px}.v6-reuse-item>div:first-child{min-width:0;display:grid;gap:2px}.v6-reuse-item strong,.v6-reuse-item small{overflow:hidden;text-overflow:ellipsis}.v6-reuse-item>div:last-child{display:flex;gap:4px}.v6-reuse-item button{min-width:28px;padding:5px 7px}@media(max-width:430px){.v6-reuse-item{grid-template-columns:1fr}.v6-reuse-item>div:last-child{justify-content:flex-start}}`;document.head.appendChild(s)}
function wrapRender(){
  if(!state.project||state.render?.__v6ReuseWrapped)return false;
  const base=state.render;if(typeof base!=='function')return false;
  const wrapped=(...args)=>{ensureReuseConfig(state.project);syncSelectedComponent(state.project,currentPage(),state.selectedBlockId,state.selectedNodeId);const out=base(...args);queueMicrotask(enhanceReuseUi);return out};
  wrapped.__v6ReuseWrapped=true;state.render=wrapped;return true;
}
function boot(){
  const side=$('#rightSidebar');if(!side||!state.project){setTimeout(boot,60);return}
  ensureReuseConfig(state.project);css();wrapRender();side.addEventListener('click',handleClick,true);new MutationObserver(()=>queueMicrotask(enhanceReuseUi)).observe(side,{childList:true,subtree:true});enhanceReuseUi();
}
if(typeof document!=='undefined'){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()}
