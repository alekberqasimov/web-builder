import {currentNode,mutate,attr} from './v5-runtime.mjs';

const TOKEN='v5-nav-desktop-dropdown';
const ICONS=['☰','⋮','•••','＋','⌄'];

function tokens(value=''){return String(value).split(/\s+/).map(x=>x.trim()).filter(Boolean)}
function modeOf(n){
  if(!n?.props)return'inline';
  if(n.props.desktopMenu==='dropdown')return'dropdown';
  return tokens(n.props.className).includes(TOKEN)?'dropdown':'inline';
}
function setMode(value){
  const n=currentNode();if(n?.type!=='nav')return;
  mutate('Navigation desktop behavior',()=>{
    n.props.desktopMenu=value==='dropdown'?'dropdown':'inline';
    const list=tokens(n.props.className).filter(x=>x!==TOKEN);
    if(n.props.desktopMenu==='dropdown')list.push(TOKEN);
    n.props.className=[...new Set(list)].join(' ');
  });
}
function setIcon(value){
  const n=currentNode();if(n?.type!=='nav')return;
  mutate('Navigation mobile icon',()=>{n.props.mobileIcon=String(value||'☰')});
}
function behaviorHtml(n){
  const mode=modeOf(n),icon=n.props?.mobileIcon||'☰';
  return `<div class="v6-nav-behavior" data-v6-nav-behavior="1"><div class="field-grid"><label>Desktop menu<select data-v6-nav-desktop><option value="inline" ${mode==='inline'?'selected':''}>Inline</option><option value="dropdown" ${mode==='dropdown'?'selected':''}>Dropdown</option></select></label><label>Mobile icon<input data-v6-nav-icon value="${attr(icon)}" list="v6NavIconPresets" maxlength="8"><datalist id="v6NavIconPresets">${ICONS.map(x=>`<option value="${attr(x)}"></option>`).join('')}</datalist></label></div><div class="v6-nav-icon-presets" role="group" aria-label="Mobile menu icon presets">${ICONS.map(x=>`<button type="button" data-v6-nav-icon-preset="${attr(x)}" class="${x===icon?'active':''}" aria-label="Use ${attr(x)} icon">${x}</button>`).join('')}</div><small class="v6-nav-help">Desktop: Inline keeps links visible; Dropdown collapses them behind the menu button. Mobile always uses the selected icon and panel settings below.</small></div>`;
}
function enhance(){
  const n=currentNode(),panel=document.querySelector('#elementInspector');
  if(!panel||n?.type!=='nav')return;
  const navFieldset=[...panel.querySelectorAll('fieldset')].find(f=>f.querySelector(':scope>legend')?.textContent?.trim()==='Navigation');
  if(!navFieldset||navFieldset.querySelector('[data-v6-nav-behavior]'))return;
  const wrap=document.createElement('div');wrap.innerHTML=behaviorHtml(n);
  navFieldset.querySelector(':scope>legend')?.after(wrap.firstElementChild);
}
function ensureStyle(){
  if(document.getElementById('v6NavConfigStyle'))return;
  const s=document.createElement('style');s.id='v6NavConfigStyle';
  s.textContent='.v6-nav-behavior{margin:10px 0 12px;padding:10px;border:1px solid rgba(112,92,255,.25);border-radius:12px;background:rgba(112,92,255,.055)}.v6-nav-icon-presets{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.v6-nav-icon-presets button{min-width:34px;height:32px;border:1px solid var(--line);border-radius:8px;background:var(--panel-2);color:var(--text);font-weight:850}.v6-nav-icon-presets button.active{border-color:#705cff;background:#30256b;color:#fff}.v6-nav-help{display:block;margin-top:8px;color:var(--muted);line-height:1.45}';
  document.head.append(s);
}
function bind(){
  ensureStyle();enhance();
  document.addEventListener('change',e=>{
    const t=e.target;
    if(t.matches?.('[data-v6-nav-desktop]')){setMode(t.value);return}
    if(t.matches?.('[data-v6-nav-icon]')){setIcon(t.value);return}
  },true);
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-v6-nav-icon-preset]');if(!b)return;
    e.preventDefault();setIcon(b.dataset.v6NavIconPreset);
  },true);
  const panel=document.querySelector('#elementInspector');
  if(panel)new MutationObserver(()=>queueMicrotask(enhance)).observe(panel,{childList:true,subtree:true});
  window.addEventListener('pageshow',()=>setTimeout(enhance,0));
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
}

export {modeOf};
