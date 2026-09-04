import {block,container} from './v5-core.mjs';

export const CUSTOM_SECTION_TYPES=[
  {type:'custom-blank',icon:'＋',names:{en:'Blank section',ru:'Пустая секция',az:'Boş bölmə'}},
  {type:'custom-1',icon:'▯',names:{en:'1 column',ru:'1 колонка',az:'1 sütun'}},
  {type:'custom-2',icon:'▥',names:{en:'2 columns',ru:'2 колонки',az:'2 sütun'}},
  {type:'custom-3',icon:'▦',names:{en:'3 columns',ru:'3 колонки',az:'3 sütun'}},
  {type:'custom-4',icon:'▦',names:{en:'4 columns',ru:'4 колонки',az:'4 sütun'}},
  {type:'custom-grid',icon:'⊞',names:{en:'Grid 6',ru:'Сетка 6',az:'6-lıq grid'}},
  {type:'custom-nested',icon:'▣',names:{en:'Nested container',ru:'Вложенный контейнер',az:'İç-içə konteyner'}}
];

export function customSectionMeta(type){return CUSTOM_SECTION_TYPES.find(x=>x.type===type)||null}
export function customSectionLabel(type,lang='en'){const m=customSectionMeta(type);return m?.names?.[lang]||m?.names?.en||type}

function namedContainer(name){const c=container([],{gap:16});c.name=name;return c}
function gridRoot(count,desktop,tablet=2,mobile=1){
  const cols=Array.from({length:count},(_,i)=>namedContainer(`Column ${i+1}`));
  const root=container(cols,{gap:18});
  root.name='Section layout';
  root.style.base.display='grid';
  root.style.base.gridTemplateColumns=`repeat(${desktop},minmax(0,1fr))`;
  root.style.tablet.gridTemplateColumns=`repeat(${Math.min(tablet,desktop)},minmax(0,1fr))`;
  root.style.mobile.gridTemplateColumns=`repeat(${mobile},minmax(0,1fr))`;
  root.style.mobile.gap='14px';
  return root;
}

export function makeCustomSection(type='custom-blank',lang='en'){
  let root;
  if(type==='custom-blank')root=namedContainer('Container');
  else if(type==='custom-1')root=gridRoot(1,1,1,1);
  else if(type==='custom-2')root=gridRoot(2,2,2,1);
  else if(type==='custom-3')root=gridRoot(3,3,2,1);
  else if(type==='custom-4')root=gridRoot(4,4,2,1);
  else if(type==='custom-grid')root=gridRoot(6,3,2,1);
  else if(type==='custom-nested'){
    const inner=namedContainer('Inner container');
    const outer=container([inner],{gap:16});outer.name='Outer container';
    root=container([outer],{gap:16});root.name='Section layout';
  }else root=namedContainer('Container');
  const b=block(customSectionLabel(type,lang),root);
  b.preset='custom';
  return b;
}

export function installCustomSectionStyles(){
  if(typeof document==='undefined'||document.getElementById('v6CustomSectionStyles'))return;
  const s=document.createElement('style');s.id='v6CustomSectionStyles';s.textContent=`
.library-card[data-add-block^="custom-"]::before{background:linear-gradient(135deg,#171f37,#222b4a)!important;box-shadow:inset 0 0 0 1px rgba(145,128,255,.14)!important}
.library-card[data-add-block="custom-blank"]::before{background:linear-gradient(135deg,#141d32,#0f1728)!important}
.library-card[data-add-block="custom-1"]::before{background:linear-gradient(90deg,#7562ff 0 100%)!important}
.library-card[data-add-block="custom-2"]::before{background:linear-gradient(90deg,#7562ff 0 48%,transparent 48% 52%,#9b68ff 52% 100%)!important}
.library-card[data-add-block="custom-3"]::before{background:linear-gradient(90deg,#7562ff 0 31%,transparent 31% 34%,#9467ff 34% 65%,transparent 65% 68%,#cf69cb 68% 100%)!important}
.library-card[data-add-block="custom-4"]::before{background:repeating-linear-gradient(90deg,#765fff 0 22%,transparent 22% 26%)!important}
.library-card[data-add-block="custom-grid"]::before{background:repeating-linear-gradient(90deg,#765fff 0 29%,transparent 29% 35%),repeating-linear-gradient(180deg,rgba(255,255,255,.08) 0 42%,transparent 42% 52%),#171f37!important}
.library-card[data-add-block="custom-nested"]::before{background:linear-gradient(135deg,transparent 0 18%,#7a65ff 18% 82%,transparent 82%),linear-gradient(135deg,#1a2340,#10182b)!important}
.v5-container-empty{min-height:92px!important;border-radius:14px;outline:1px dashed rgba(112,92,255,.42)!important;outline-offset:-1px;background:linear-gradient(135deg,rgba(112,92,255,.045),rgba(255,157,102,.025))}
.v5-inline-add{display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;width:auto!important;height:30px!important;min-width:30px!important;padding:0 9px!important;border:1px solid rgba(112,92,255,.78)!important;border-radius:999px!important;background:rgba(255,255,255,.96)!important;color:#5f4fe0!important;font-size:12px!important;font-weight:800!important;box-shadow:0 8px 22px rgba(25,20,76,.18)!important;opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .15s ease,transform .15s ease,box-shadow .15s ease!important}
.v5-inline-add small{font-size:10px!important;font-weight:800!important;color:inherit!important;white-space:nowrap}
.v5-container:hover>.v5-inline-add,.v5-selected-node>.v5-inline-add,.v5-container-empty>.v5-inline-add{opacity:1;pointer-events:auto;transform:translateY(0)}
.v5-inline-add.is-empty{left:50%!important;right:auto!important;top:50%!important;bottom:auto!important;transform:translate(-50%,-50%)!important;height:38px!important;padding:0 13px!important;background:linear-gradient(135deg,#ffffff,#f5f2ff)!important}
.v5-inline-add:hover{box-shadow:0 10px 26px rgba(91,72,213,.28)!important;background:#fff!important}
@media(max-width:760px){.v5-container-empty{min-height:78px!important}.v5-container>.v5-inline-add{opacity:.88;pointer-events:auto}.v5-inline-add{height:34px!important}.v5-inline-add.is-empty{height:40px!important}.v5-inline-add small{display:inline!important}}
`;
  document.head.appendChild(s);
}
