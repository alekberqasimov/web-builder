import {state,currentNode,mutate,attr} from './v5-runtime.mjs';

const TOKEN='v5-nav-desktop-dropdown';
const ICONS=['☰','⋮','•••','＋','⌄'];
const COPY={
  ru:{desktop:'Меню Desktop',inline:'В строку',dropdown:'Dropdown',mobileIcon:'Иконка Mobile',help:'Desktop: «В строку» показывает ссылки постоянно; Dropdown прячет их за кнопкой меню. На Mobile всегда используется выбранная иконка и настройки панели ниже.',icons:'Пресеты иконки Mobile',use:'Использовать'},
  az:{desktop:'Desktop menyu',inline:'Ardıcıl',dropdown:'Dropdown',mobileIcon:'Mobile ikon',help:'Desktop: Ardıcıl linkləri daim göstərir; Dropdown onları menyu düyməsinin arxasında açır. Mobile-da seçilmiş ikon və aşağıdakı panel ayarları istifadə olunur.',icons:'Mobile ikon presetləri',use:'İstifadə et'},
  en:{desktop:'Desktop menu',inline:'Inline',dropdown:'Dropdown',mobileIcon:'Mobile icon',help:'Desktop: Inline keeps links visible; Dropdown collapses them behind the menu button. Mobile always uses the selected icon and panel settings below.',icons:'Mobile menu icon presets',use:'Use'}
};

function lang(){return String(document.querySelector('#uiLanguage')?.value||state.project?.uiLang||'en').slice(0,2)}
function tx(key){return COPY[lang()]?.[key]||COPY.en[key]||key}
function tokens(value=''){return String(value).split(/\s+/).map(x=>x.trim()).filter(Boolean)}
function selectedNode(){if(!state.project)return null;try{return currentNode()}catch{return null}}
function modeOf(n){
  if(!n?.props)return'inline';
  if(n.props.desktopMenu==='dropdown')return'dropdown';
  return tokens(n.props.className).includes(TOKEN)?'dropdown':'inline';
}
function setMode(value){
  const n=selectedNode();if(n?.type!=='nav')return;
  mutate('Navigation desktop behavior',()=>{
    n.props.desktopMenu=value==='dropdown'?'dropdown':'inline';
    const list=tokens(n.props.className).filter(x=>x!==TOKEN);
    if(n.props.desktopMenu==='dropdown')list.push(TOKEN);
    n.props.className=[...new Set(list)].join(' ');
  });
}
function setIcon(value){
  const n=selectedNode();if(n?.type!=='nav')return;
  mutate('Navigation mobile icon',()=>{n.props.mobileIcon=String(value||'☰')});
}
function behaviorHtml(n){
  const mode=modeOf(n),icon=n.props?.mobileIcon||'☰';
  return `<div class="v6-nav-behavior" data-v6-nav-behavior="1"><div class="field-grid"><label>${tx('desktop')}<select data-v6-nav-desktop><option value="inline" ${mode==='inline'?'selected':''}>${tx('inline')}</option><option value="dropdown" ${mode==='dropdown'?'selected':''}>${tx('dropdown')}</option></select></label><label>${tx('mobileIcon')}<input data-v6-nav-icon value="${attr(icon)}" list="v6NavIconPresets" maxlength="8"><datalist id="v6NavIconPresets">${ICONS.map(x=>`<option value="${attr(x)}"></option>`).join('')}</datalist></label></div><div class="v6-nav-icon-presets" role="group" aria-label="${attr(tx('icons'))}">${ICONS.map(x=>`<button type="button" data-v6-nav-icon-preset="${attr(x)}" class="${x===icon?'active':''}" aria-label="${attr(tx('use'))} ${attr(x)}">${x}</button>`).join('')}</div><small class="v6-nav-help">${tx('help')}</small></div>`;
}
function enhance(){
  const panel=document.querySelector('#elementInspector'),n=selectedNode();
  if(!panel||n?.type!=='nav')return;
  const navFieldset=panel.querySelector('[data-p="logoText"]')?.closest('fieldset');
  if(!navFieldset)return;
  const signature=`${lang()}|${modeOf(n)}|${n.props?.mobileIcon||'☰'}`;
  const existing=navFieldset.querySelector('[data-v6-nav-behavior]');
  if(existing?.dataset.v6NavSignature===signature)return;
  const wrap=document.createElement('div');wrap.innerHTML=behaviorHtml(n);
  const next=wrap.firstElementChild;next.dataset.v6NavSignature=signature;
  if(existing)existing.replaceWith(next);else navFieldset.querySelector(':scope>legend')?.after(next);
}
function enhanceWhenReady(attempt=0){
  if(state.project){enhance();return}
  if(attempt<80)setTimeout(()=>enhanceWhenReady(attempt+1),50);
}
function ensureStyle(){
  if(document.getElementById('v6NavConfigStyle'))return;
  const s=document.createElement('style');s.id='v6NavConfigStyle';
  s.textContent='.v6-nav-behavior{margin:10px 0 12px;padding:10px;border:1px solid rgba(112,92,255,.25);border-radius:12px;background:rgba(112,92,255,.055)}.v6-nav-icon-presets{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.v6-nav-icon-presets button{min-width:34px;height:32px;border:1px solid var(--line);border-radius:8px;background:var(--panel-2);color:var(--text);font-weight:850}.v6-nav-icon-presets button.active{border-color:#705cff;background:#30256b;color:#fff}.v6-nav-help{display:block;margin-top:8px;color:var(--muted);line-height:1.45}@media(min-width:761px){#canvas .v5-nav.v5-nav-desktop-dropdown .v5-nav-toggle{display:inline-flex!important;margin-left:auto}#canvas .v5-nav.v5-nav-desktop-dropdown .v5-nav-links{display:none!important;position:absolute;top:calc(100% + 8px);right:0;flex-direction:column;align-items:stretch;min-width:220px;z-index:90}#canvas .v5-nav.v5-nav-desktop-dropdown.open .v5-nav-links{display:flex!important}}';
  document.head.append(s);
}
function bind(){
  ensureStyle();enhanceWhenReady();
  document.addEventListener('change',e=>{
    const t=e.target;
    if(t.matches?.('[data-v6-nav-desktop]')){setMode(t.value);return}
    if(t.matches?.('[data-v6-nav-icon]')){setIcon(t.value);return}
    if(t.matches?.('#uiLanguage'))setTimeout(enhance,0);
  },true);
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-v6-nav-icon-preset]');if(!b)return;
    e.preventDefault();setIcon(b.dataset.v6NavIconPreset);
  },true);
  const panel=document.querySelector('#elementInspector');
  if(panel)new MutationObserver(()=>queueMicrotask(enhance)).observe(panel,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>setTimeout(enhanceWhenReady,0));
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
}

export {modeOf};