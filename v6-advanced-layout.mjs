import {$,state,currentNode,mutate,attr,esc} from './v5-runtime.mjs';

const DEVICE_KEYS={desktop:'base',tablet:'tablet',mobile:'mobile'};
const COPY={
  en:{title:'Advanced Layout',container:'Container layout',item:'Child / item layout',responsive:'Responsive',inherit:'Inherit',columns:'Columns',rows:'Rows',custom:'Custom tracks',rowGap:'Row gap',columnGap:'Column gap',flow:'Auto flow',justifyItems:'Justify items',alignItems:'Align items',placeContent:'Place content',direction:'Direction',wrap:'Wrap',justify:'Justify',align:'Align',order:'Order',grow:'Grow',shrink:'Shrink',basis:'Basis',alignSelf:'Align self',justifySelf:'Justify self',colStart:'Column start',colEnd:'Column end',rowStart:'Row start',rowEnd:'Row end',reset:'Reset this device',autoFit:'Auto-fit',autoFill:'Auto-fill'},
  az:{title:'Advanced Layout',container:'Container düzülüşü',item:'Child / item düzülüşü',responsive:'Responsive',inherit:'Miras al',columns:'Sütunlar',rows:'Sətirlər',custom:'Custom tracks',rowGap:'Sətir aralığı',columnGap:'Sütun aralığı',flow:'Auto flow',justifyItems:'Justify items',alignItems:'Align items',placeContent:'Place content',direction:'İstiqamət',wrap:'Wrap',justify:'Justify',align:'Align',order:'Sıra',grow:'Grow',shrink:'Shrink',basis:'Basis',alignSelf:'Align self',justifySelf:'Justify self',colStart:'Sütun başlanğıcı',colEnd:'Sütun sonu',rowStart:'Sətir başlanğıcı',rowEnd:'Sətir sonu',reset:'Bu device-i sıfırla',autoFit:'Auto-fit',autoFill:'Auto-fill'},
  ru:{title:'Advanced Layout',container:'Layout контейнера',item:'Layout дочернего элемента',responsive:'Responsive',inherit:'Наследовать',columns:'Колонки',rows:'Строки',custom:'Custom tracks',rowGap:'Отступ строк',columnGap:'Отступ колонок',flow:'Auto flow',justifyItems:'Justify items',alignItems:'Align items',placeContent:'Place content',direction:'Direction',wrap:'Wrap',justify:'Justify',align:'Align',order:'Order',grow:'Grow',shrink:'Shrink',basis:'Basis',alignSelf:'Align self',justifySelf:'Justify self',colStart:'Column start',colEnd:'Column end',rowStart:'Row start',rowEnd:'Row end',reset:'Сбросить для устройства',autoFit:'Auto-fit',autoFill:'Auto-fill'}
};
const tx=k=>COPY[state.project?.uiLang||'ru']?.[k]||COPY.en[k]||k;

export function layoutDeviceKey(device='desktop'){return DEVICE_KEYS[device]||'base'}
export function ownLayoutValue(target,key,device='desktop'){return target?.style?.[layoutDeviceKey(device)]?.[key]??''}
export function inheritedLayoutValue(target,key,device='desktop'){
  const style=target?.style||{},base=style.base?.[key]??'';
  if(device==='desktop')return base;
  const tablet=style.tablet?.[key]??'';
  if(device==='tablet')return tablet||base;
  return (style.mobile?.[key]??'')||tablet||base;
}
export function setLayoutValue(target,key,value,device='desktop'){
  if(!target?.style)return false;
  const bucket=layoutDeviceKey(device);target.style[bucket]??={};
  const clean=String(value??'').trim();
  if(clean)target.style[bucket][key]=clean;else delete target.style[bucket][key];
  return true;
}
export function resetLayoutDevice(target,device='desktop'){
  if(!target?.style)return false;const bucket=layoutDeviceKey(device);target.style[bucket]??={};
  for(const key of LAYOUT_KEYS)delete target.style[bucket][key];return true;
}

const LAYOUT_KEYS=['display','gridTemplateColumns','gridTemplateRows','gridAutoFlow','rowGap','columnGap','gap','justifyItems','alignItems','placeContent','justifyContent','flexDirection','flexWrap','gridColumn','gridRow','gridColumnStart','gridColumnEnd','gridRowStart','gridRowEnd','order','flexGrow','flexShrink','flexBasis','alignSelf','justifySelf'];
const options=(values,current)=>`<option value="">${tx('inherit')}</option>`+values.map(([v,l])=>`<option value="${attr(v)}" ${current===v?'selected':''}>${esc(l||v)}</option>`).join('');
const input=(label,key,placeholder='')=>{const n=currentNode(),v=ownLayoutValue(n,key,state.device),inherit=inheritedLayoutValue(n,key,state.device);return`<label>${label}<input data-al-key="${key}" value="${attr(v)}" placeholder="${attr(placeholder||(inherit?`${tx('inherit')}: ${inherit}`:''))}"></label>`};
const select=(label,key,values)=>{const n=currentNode(),v=ownLayoutValue(n,key,state.device);return`<label>${label}<select data-al-key="${key}">${options(values,v)}</select></label>`};

function trackPreset(value,label,active){return`<button type="button" data-al-track="${attr(value)}" class="${active===value?'active':''}">${esc(label)}</button>`}
function containerPanel(n){
  const display=ownLayoutValue(n,'display',state.device)||inheritedLayoutValue(n,'display',state.device)||n.props?.layout||'flex';
  const cols=ownLayoutValue(n,'gridTemplateColumns',state.device);
  return `<div class="al-section"><div class="al-section-head"><strong>${tx('container')}</strong><span>${esc(state.device)} · ${tx('responsive')}</span></div><div class="al-mode"><button type="button" data-al-key-button="display" data-al-value="flex" class="${display==='flex'?'active':''}">Flex</button><button type="button" data-al-key-button="display" data-al-value="grid" class="${display==='grid'?'active':''}">Grid</button></div>${display==='grid'?`<div class="al-track-title">${tx('columns')}</div><div class="al-track-presets">${[1,2,3,4,5,6].map(i=>trackPreset(i===1?'1fr':`repeat(${i}, minmax(0, 1fr))`,String(i),cols)).join('')}${trackPreset('repeat(auto-fit, minmax(220px, 1fr))',tx('autoFit'),cols)}${trackPreset('repeat(auto-fill, minmax(220px, 1fr))',tx('autoFill'),cols)}</div>${input(tx('custom'),'gridTemplateColumns','repeat(3, minmax(180px, 1fr))')}${input(tx('rows'),'gridTemplateRows','auto auto')}${select(tx('flow'),'gridAutoFlow',[['row','Row'],['column','Column'],['row dense','Row dense'],['column dense','Column dense']])}<div class="field-grid">${input(tx('rowGap'),'rowGap','16px')}${input(tx('columnGap'),'columnGap','16px')}</div><div class="field-grid">${select(tx('justifyItems'),'justifyItems',[['stretch','Stretch'],['start','Start'],['center','Center'],['end','End']])}${select(tx('alignItems'),'alignItems',[['stretch','Stretch'],['start','Start'],['center','Center'],['end','End']])}</div>${select(tx('placeContent'),'placeContent',[['stretch','Stretch'],['start','Start'],['center','Center'],['end','End'],['space-between','Space between'],['space-around','Space around'],['space-evenly','Space evenly']])}`:`<div class="field-grid">${select(tx('direction'),'flexDirection',[['row','Row'],['column','Column'],['row-reverse','Row reverse'],['column-reverse','Column reverse']])}${select(tx('wrap'),'flexWrap',[['nowrap','No wrap'],['wrap','Wrap'],['wrap-reverse','Wrap reverse']])}</div>${input('Gap','gap','16px')}<div class="field-grid">${select(tx('justify'),'justifyContent',[['flex-start','Start'],['center','Center'],['flex-end','End'],['space-between','Space between'],['space-around','Space around'],['space-evenly','Space evenly']])}${select(tx('align'),'alignItems',[['stretch','Stretch'],['flex-start','Start'],['center','Center'],['flex-end','End'],['baseline','Baseline']])}</div>`}</div>`;
}
function itemPanel(){
  return `<div class="al-section"><div class="al-section-head"><strong>${tx('item')}</strong><span>${esc(state.device)}</span></div><div class="field-grid">${input(tx('colStart'),'gridColumnStart','auto')}${input(tx('colEnd'),'gridColumnEnd','span 2')}</div><div class="field-grid">${input(tx('rowStart'),'gridRowStart','auto')}${input(tx('rowEnd'),'gridRowEnd','span 2')}</div><div class="field-grid">${input(tx('order'),'order','0')}${input(tx('basis'),'flexBasis','auto')}</div><div class="field-grid">${input(tx('grow'),'flexGrow','0')}${input(tx('shrink'),'flexShrink','1')}</div><div class="field-grid">${select(tx('alignSelf'),'alignSelf',[['auto','Auto'],['stretch','Stretch'],['flex-start','Start'],['center','Center'],['flex-end','End'],['baseline','Baseline']])}${select(tx('justifySelf'),'justifySelf',[['auto','Auto'],['stretch','Stretch'],['start','Start'],['center','Center'],['end','End']])}</div></div>`;
}
function panelHtml(n){return `<fieldset id="v6AdvancedLayout"><legend>${tx('title')} · PRO</legend><div class="al-device-bar"><span>${tx('responsive')}</span><div><button type="button" data-al-device="desktop" class="${state.device==='desktop'?'active':''}">Desktop</button><button type="button" data-al-device="tablet" class="${state.device==='tablet'?'active':''}">Tablet</button><button type="button" data-al-device="mobile" class="${state.device==='mobile'?'active':''}">Mobile</button></div></div>${n.type==='container'?containerPanel(n):''}${itemPanel()}<button type="button" data-al-reset class="al-reset">↺ ${tx('reset')}</button></fieldset>`}

export function enhanceAdvancedLayoutUi(){
  const panel=$('#elementInspector'),n=currentNode();if(!panel||!n||state.activeRight!=='element')return;
  if(!panel.querySelector('#v6AdvancedLayout'))panel.insertAdjacentHTML('beforeend',panelHtml(n));
}
function setAndRender(key,value){const n=currentNode();if(!n)return;mutate(`Advanced layout: ${key}`,()=>setLayoutValue(n,key,value,state.device))}
function clickHandler(e){
  const root=e.target.closest('#v6AdvancedLayout');if(!root)return;
  const device=e.target.closest('[data-al-device]');if(device){state.device=device.dataset.alDevice;state.render();return}
  const mode=e.target.closest('[data-al-key-button]');if(mode){setAndRender(mode.dataset.alKeyButton,mode.dataset.alValue);return}
  const track=e.target.closest('[data-al-track]');if(track){setAndRender('gridTemplateColumns',track.dataset.alTrack);return}
  if(e.target.closest('[data-al-reset]')){const n=currentNode();if(n)mutate('Reset advanced layout',()=>resetLayoutDevice(n,state.device));return}
}
function inputHandler(e){const el=e.target.closest('[data-al-key]');if(!el||!el.closest('#v6AdvancedLayout'))return;setAndRender(el.dataset.alKey,el.value)}
function css(){if(document.getElementById('v6AdvancedLayoutCss'))return;const s=document.createElement('style');s.id='v6AdvancedLayoutCss';s.textContent=`#v6AdvancedLayout{border-color:rgba(79,125,255,.34)!important;background:linear-gradient(180deg,rgba(60,101,255,.07),rgba(255,255,255,.01))!important}.al-device-bar,.al-section-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.al-device-bar{padding:7px 0 9px;border-bottom:1px solid rgba(128,138,160,.16)}.al-device-bar>div,.al-mode,.al-track-presets{display:flex;gap:5px;flex-wrap:wrap}.al-device-bar button,.al-mode button,.al-track-presets button{padding:5px 8px;min-width:0;font-size:9px}.al-device-bar button.active,.al-mode button.active,.al-track-presets button.active{border-color:#6f7cff;background:rgba(95,108,255,.18)}.al-section{display:grid;gap:8px;padding:10px 0;border-bottom:1px solid rgba(128,138,160,.14)}.al-section-head span{font-size:9px;color:#8f9ab0}.al-track-title{font-size:9px;font-weight:700;color:#9fa9bd;text-transform:uppercase;letter-spacing:.05em}.al-reset{width:100%;margin-top:10px}@media(max-width:430px){.al-device-bar{align-items:flex-start;flex-direction:column}.al-device-bar>div{width:100%}.al-device-bar button{flex:1}.al-track-presets button{flex:1 1 calc(25% - 5px)}}`;document.head.appendChild(s)}
function boot(){const panel=$('#rightSidebar');if(!panel||!state.project){setTimeout(boot,60);return}css();panel.addEventListener('click',clickHandler,true);panel.addEventListener('change',inputHandler,true);new MutationObserver(()=>queueMicrotask(enhanceAdvancedLayoutUi)).observe(panel,{childList:true,subtree:true});enhanceAdvancedLayoutUi()}
if(typeof document!=='undefined'){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()}
