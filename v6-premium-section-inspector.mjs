import {$,state,currentBlock,mutate,attr} from './v5-runtime.mjs';

const COPY={
  ru:{title:'Премиум-секция',device:'Настройки для',density:'Ритм секции',compact:'Компактно',balanced:'Баланс',spacious:'Воздух',width:'Ширина контента',narrow:'960',standard:'1120',wide:'1280',full:'На всю ширину',tone:'Тон',light:'Светлый',soft:'Мягкий',dark:'Тёмный',brand:'Акцент',align:'Композиция',left:'Слева',center:'По центру',reset:'Сбросить настройки устройства',pro:'PRO'},
  az:{title:'Premium bölmə',device:'Cihaz ayarları',density:'Bölmə ritmi',compact:'Kompakt',balanced:'Balans',spacious:'Geniş',width:'Məzmun eni',narrow:'960',standard:'1120',wide:'1280',full:'Tam en',tone:'Ton',light:'Açıq',soft:'Yumşaq',dark:'Tünd',brand:'Aksent',align:'Kompozisiya',left:'Sol',center:'Mərkəz',reset:'Cihaz ayarlarını sıfırla',pro:'PRO'},
  en:{title:'Premium section',device:'Device settings',density:'Section rhythm',compact:'Compact',balanced:'Balanced',spacious:'Spacious',width:'Content width',narrow:'960',standard:'1120',wide:'1280',full:'Full width',tone:'Tone',light:'Light',soft:'Soft',dark:'Dark',brand:'Accent',align:'Composition',left:'Left',center:'Centered',reset:'Reset device overrides',pro:'PRO'}
};

const DENSITY={
  compact:{desktop:['56px','56px'],tablet:['48px','48px'],mobile:['36px','36px']},
  balanced:{desktop:['88px','88px'],tablet:['68px','68px'],mobile:['48px','48px']},
  spacious:{desktop:['120px','120px'],tablet:['92px','92px'],mobile:['64px','64px']}
};
const WIDTHS={narrow:'960',standard:'1120',wide:'1280',full:''};
const TONES={
  light:{background:'#ffffff',color:'#111827'},
  soft:{background:'linear-gradient(180deg,#f7f8fc 0%,#ffffff 100%)',color:'#111827'},
  dark:{background:'linear-gradient(145deg,#0b1020,#151a2d 62%,#0d1222)',color:'#f8fafc'},
  brand:{background:'radial-gradient(circle at 85% 0%,rgba(118,93,255,.34),transparent 38%),linear-gradient(135deg,#16142c,#211b46)',color:'#ffffff'}
};

function lang(){return String(document.querySelector('#uiLanguage')?.value||state.project?.uiLang||'en').slice(0,2)}
function t(key){return COPY[lang()]?.[key]||COPY.en[key]||key}
function device(){return state.device==='desktop'?'desktop':state.device==='tablet'?'tablet':'mobile'}
function styleBucket(block){block.style||={base:{},tablet:{},mobile:{}};const key=device()==='desktop'?'base':device();block.style[key]||={};return block.style[key]}
function rootBucket(block){const root=block.root;if(!root)return null;root.style||={base:{},tablet:{},mobile:{},hover:{},focus:{}};const key=device()==='desktop'?'base':device();root.style[key]||={};return root.style[key]}
function isPremium(block){return !!(block?.premiumVariant||String(block?.preset||'').startsWith('premium'))}
function activeClass(cond){return cond?' is-active':''}

function detectedDensity(block){
  const s=styleBucket(block),top=String(s.paddingTop||'');
  for(const [name,map] of Object.entries(DENSITY))if(map[device()]?.[0]===top)return name;
  return '';
}
function detectedWidth(block){const v=String(block.contentWidth||'');for(const [k,w] of Object.entries(WIDTHS))if(String(w)===v)return k;return''}
function detectedAlign(block){const s=rootBucket(block)||{};return s.textAlign==='center'?'center':'left'}
function toneKey(block){const s=styleBucket(block),bg=String(s.background||'');for(const [k,v] of Object.entries(TONES))if(v.background===bg)return k;return''}

function markup(block){
  const d=detectedDensity(block),w=detectedWidth(block),a=detectedAlign(block),tone=toneKey(block),dev=device();
  return `<div class="v6-premium-section-editor">
    <div class="v6-pse-head"><div><strong>${t('title')}</strong><small>${t('device')}: ${dev}</small></div><span>${t('pro')}</span></div>
    <fieldset><legend>${t('density')}</legend><div class="v6-pse-grid v6-pse-grid-3">
      <button type="button" data-v6-section-density="compact" class="${activeClass(d==='compact')}">${t('compact')}</button>
      <button type="button" data-v6-section-density="balanced" class="${activeClass(d==='balanced')}">${t('balanced')}</button>
      <button type="button" data-v6-section-density="spacious" class="${activeClass(d==='spacious')}">${t('spacious')}</button>
    </div></fieldset>
    <fieldset><legend>${t('width')}</legend><div class="v6-pse-grid v6-pse-grid-4">
      <button type="button" data-v6-section-width="narrow" class="${activeClass(w==='narrow')}">${t('narrow')}</button>
      <button type="button" data-v6-section-width="standard" class="${activeClass(w==='standard')}">${t('standard')}</button>
      <button type="button" data-v6-section-width="wide" class="${activeClass(w==='wide')}">${t('wide')}</button>
      <button type="button" data-v6-section-width="full" class="${activeClass(w==='full')}">${t('full')}</button>
    </div></fieldset>
    <fieldset><legend>${t('tone')}</legend><div class="v6-pse-grid v6-pse-grid-4">
      <button type="button" data-v6-section-tone="light" class="v6-tone light${activeClass(tone==='light')}">${t('light')}</button>
      <button type="button" data-v6-section-tone="soft" class="v6-tone soft${activeClass(tone==='soft')}">${t('soft')}</button>
      <button type="button" data-v6-section-tone="dark" class="v6-tone dark${activeClass(tone==='dark')}">${t('dark')}</button>
      <button type="button" data-v6-section-tone="brand" class="v6-tone brand${activeClass(tone==='brand')}">${t('brand')}</button>
    </div></fieldset>
    <fieldset><legend>${t('align')}</legend><div class="v6-pse-grid v6-pse-grid-2">
      <button type="button" data-v6-section-align="left" class="${activeClass(a==='left')}">${t('left')}</button>
      <button type="button" data-v6-section-align="center" class="${activeClass(a==='center')}">${t('center')}</button>
    </div></fieldset>
    <button type="button" class="v6-pse-reset" data-v6-section-reset>${t('reset')}</button>
  </div>`;
}

export function enhancePremiumSectionInspector(){
  const root=$('#blockInspector'),block=currentBlock();if(!root||!block||!isPremium(block))return;
  root.querySelector('.v6-premium-section-editor')?.remove();
  const box=document.createElement('div');box.innerHTML=markup(block);const node=box.firstElementChild;
  root.querySelector('.inspector-head')?.after(node);
}
function renderSoon(){queueMicrotask(enhancePremiumSectionInspector)}

function onClick(e){
  const button=e.target.closest?.('button'),block=currentBlock();if(!button||!block||!isPremium(block))return;
  if(button.dataset.v6SectionDensity){
    const key=button.dataset.v6SectionDensity,map=DENSITY[key]?.[device()];if(!map)return;
    mutate('Premium section rhythm',()=>{const s=styleBucket(block);s.paddingTop=map[0];s.paddingBottom=map[1]});return;
  }
  if(button.dataset.v6SectionWidth){
    const value=WIDTHS[button.dataset.v6SectionWidth];if(value===undefined)return;
    mutate('Premium content width',()=>{block.contentWidth=value});return;
  }
  if(button.dataset.v6SectionTone){
    const tone=TONES[button.dataset.v6SectionTone];if(!tone)return;
    mutate('Premium section tone',()=>{const s=styleBucket(block);s.background=tone.background;s.color=tone.color});return;
  }
  if(button.dataset.v6SectionAlign){
    const value=button.dataset.v6SectionAlign;
    mutate('Premium composition alignment',()=>{const s=rootBucket(block);if(!s)return;s.textAlign=value==='center'?'center':'left';s.alignItems=value==='center'?'center':'stretch'});return;
  }
  if(button.matches('[data-v6-section-reset]')){
    mutate('Reset premium device overrides',()=>{
      const key=device()==='desktop'?'base':device();
      const blockKeep={background:block.style?.[key]?.background,color:block.style?.[key]?.color};
      block.style[key]={};
      if(key==='base'){if(blockKeep.background)block.style.base.background=blockKeep.background;if(blockKeep.color)block.style.base.color=blockKeep.color}
      if(block.root?.style)block.root.style[key]={};
    });
  }
}

function installCss(){
  if(document.getElementById('v6PremiumSectionInspectorCss'))return;
  const style=document.createElement('style');style.id='v6PremiumSectionInspectorCss';
  style.textContent=`.v6-premium-section-editor{margin:0 0 10px}.v6-pse-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border:1px solid rgba(126,107,237,.28);border-radius:12px;background:linear-gradient(135deg,rgba(112,92,255,.12),rgba(214,104,183,.05));margin-bottom:8px}.v6-pse-head>div{display:grid;gap:2px}.v6-pse-head strong{font-size:11px}.v6-pse-head small{font-size:9px;color:#8b95a7}.v6-pse-head>span{display:inline-flex;height:20px;align-items:center;padding:0 7px;border-radius:999px;background:linear-gradient(135deg,#604ee9,#8d5cff);color:#fff;font-size:8px;font-weight:850;letter-spacing:.08em}.v6-pse-grid{display:grid;gap:5px;margin-top:6px}.v6-pse-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.v6-pse-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.v6-pse-grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}.v6-pse-grid button{min-height:34px!important;padding:6px 7px!important;font-size:10px!important}.v6-pse-grid button.is-active{border-color:#7d6aed!important;box-shadow:inset 0 0 0 1px #7d6aed!important;background:rgba(112,92,255,.10)!important}.v6-tone.light{background:#fff!important;color:#273043!important}.v6-tone.soft{background:#f2f4f8!important;color:#273043!important}.v6-tone.dark{background:#171b29!important;color:#fff!important}.v6-tone.brand{background:#2d245c!important;color:#fff!important}.v6-pse-reset{width:100%!important;margin-top:7px!important;opacity:.8}@media(max-width:420px){.v6-pse-grid-4{grid-template-columns:repeat(2,minmax(0,1fr))}}`;
  document.head.appendChild(style);
}

function boot(){
  const root=$('#blockInspector'),side=$('#rightSidebar');if(!root||!side||!state.project){setTimeout(boot,60);return}
  installCss();new MutationObserver(renderSoon).observe(root,{childList:true,subtree:false});side.addEventListener('click',onClick);enhancePremiumSectionInspector();
  document.querySelector('#uiLanguage')?.addEventListener('change',()=>setTimeout(enhancePremiumSectionInspector,0));
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()}
