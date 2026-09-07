import {$,state,currentNode,currentBlock,mutate} from './v5-runtime.mjs';

const COPY={
  ru:{type:'Типографика PRO',cta:'CTA PRO',scale:'Масштаб',compact:'Компакт',balanced:'Баланс',display:'Display',align:'Выравнивание',left:'Слева',center:'Центр',measure:'Ширина строки',narrow:'Узко',normal:'Баланс',wide:'Широко',size:'Размер кнопки',small:'S',medium:'M',large:'L',width:'Ширина',auto:'Авто',full:'100%'},
  az:{type:'Tipoqrafika PRO',cta:'CTA PRO',scale:'Miqyas',compact:'Kompakt',balanced:'Balans',display:'Display',align:'Düzülüş',left:'Sol',center:'Mərkəz',measure:'Mətn eni',narrow:'Dar',normal:'Balans',wide:'Geniş',size:'Düymə ölçüsü',small:'S',medium:'M',large:'L',width:'En',auto:'Auto',full:'100%'},
  en:{type:'Typography PRO',cta:'CTA PRO',scale:'Scale',compact:'Compact',balanced:'Balanced',display:'Display',align:'Alignment',left:'Left',center:'Center',measure:'Text measure',narrow:'Narrow',normal:'Balanced',wide:'Wide',size:'Button size',small:'S',medium:'M',large:'L',width:'Width',auto:'Auto',full:'100%'}
};
const HEADING={
  compact:{desktop:['40px','1.08','-.035em'],tablet:['36px','1.1','-.03em'],mobile:['30px','1.12','-.025em']},
  balanced:{desktop:['56px','1.04','-.045em'],tablet:['46px','1.07','-.04em'],mobile:['36px','1.1','-.03em']},
  display:{desktop:['72px','.98','-.055em'],tablet:['58px','1.01','-.05em'],mobile:['42px','1.06','-.04em']}
};
const TEXT={
  compact:{desktop:['15px','1.55'],tablet:['15px','1.55'],mobile:['15px','1.55']},
  balanced:{desktop:['17px','1.65'],tablet:['16px','1.62'],mobile:['16px','1.6']},
  display:{desktop:['20px','1.62'],tablet:['18px','1.6'],mobile:['17px','1.58']}
};
const MEASURE={narrow:'560px',normal:'720px',wide:'900px'};
const BUTTON={small:{padding:'9px 13px',fontSize:'13px',minHeight:'38px'},medium:{padding:'12px 17px',fontSize:'14px',minHeight:'44px'},large:{padding:'15px 21px',fontSize:'15px',minHeight:'50px'}};
function lang(){return String(document.querySelector('#uiLanguage')?.value||state.project?.uiLang||'en').slice(0,2)}
function t(k){return COPY[lang()]?.[k]||COPY.en[k]||k}
function dev(){return state.device==='desktop'?'desktop':state.device==='tablet'?'tablet':'mobile'}
function premium(){const b=currentBlock();return !!(b?.premiumVariant||String(b?.preset||'').startsWith('premium'))}
function bucket(n){n.style||={};const key=dev()==='desktop'?'base':dev();n.style[key]||={};return n.style[key]}
function detectMeasure(n){const v=String(bucket(n).maxWidth||'');return Object.entries(MEASURE).find(([,x])=>x===v)?.[0]||''}
function buttonWidth(n){return bucket(n).width==='100%'?'full':'auto'}
function signature(n){
  const s=bucket(n);
  return [currentBlock()?.id||'',n.id,n.type,dev(),lang(),s.fontSize||'',s.lineHeight||'',s.letterSpacing||'',s.maxWidth||'',s.textAlign||'',s.marginInline||'',s.width||'',s.padding||'',s.minHeight||''].join('|');
}
function panel(n){
  if(!premium())return'';
  if(n.type==='heading'||n.type==='text'){
    const m=detectMeasure(n),a=bucket(n).textAlign==='center'?'center':'left';
    return `<div class="v6-premium-type-editor"><div class="v6-pte-head"><strong>${t('type')}</strong><span>${dev()}</span></div><fieldset><legend>${t('scale')}</legend><div class="v6-pte-grid v6-pte-grid-3"><button data-v6-type-scale="compact" type="button">${t('compact')}</button><button data-v6-type-scale="balanced" type="button">${t('balanced')}</button><button data-v6-type-scale="display" type="button">${t('display')}</button></div></fieldset><fieldset><legend>${t('measure')}</legend><div class="v6-pte-grid v6-pte-grid-3"><button data-v6-type-measure="narrow" class="${m==='narrow'?'is-active':''}" type="button">${t('narrow')}</button><button data-v6-type-measure="normal" class="${m==='normal'?'is-active':''}" type="button">${t('normal')}</button><button data-v6-type-measure="wide" class="${m==='wide'?'is-active':''}" type="button">${t('wide')}</button></div></fieldset><fieldset><legend>${t('align')}</legend><div class="v6-pte-grid v6-pte-grid-2"><button data-v6-type-align="left" class="${a==='left'?'is-active':''}" type="button">${t('left')}</button><button data-v6-type-align="center" class="${a==='center'?'is-active':''}" type="button">${t('center')}</button></div></fieldset></div>`;
  }
  if(n.type==='button'){
    const w=buttonWidth(n);
    return `<div class="v6-premium-type-editor"><div class="v6-pte-head"><strong>${t('cta')}</strong><span>${dev()}</span></div><fieldset><legend>${t('size')}</legend><div class="v6-pte-grid v6-pte-grid-3"><button data-v6-button-size="small" type="button">${t('small')}</button><button data-v6-button-size="medium" type="button">${t('medium')}</button><button data-v6-button-size="large" type="button">${t('large')}</button></div></fieldset><fieldset><legend>${t('width')}</legend><div class="v6-pte-grid v6-pte-grid-2"><button data-v6-button-flow="auto" class="${w==='auto'?'is-active':''}" type="button">${t('auto')}</button><button data-v6-button-flow="full" class="${w==='full'?'is-active':''}" type="button">${t('full')}</button></div></fieldset></div>`;
  }
  return'';
}
export function enhancePremiumTypeInspector(){
  if(!state.project)return;
  const root=$('#elementInspector'),n=currentNode(),existing=root?.querySelector('.v6-premium-type-editor');
  if(!root||!n){existing?.remove();return}
  const html=panel(n);
  if(!html){existing?.remove();return}
  const sig=signature(n);
  if(existing?.dataset.v6PremiumTypeSignature===sig)return;
  const box=document.createElement('div');box.innerHTML=html;const next=box.firstElementChild;next.dataset.v6PremiumTypeSignature=sig;
  if(existing)existing.replaceWith(next);else root.querySelector('.inspector-head')?.after(next);
}
function refreshAfterSelection(e){
  if(!e.target.closest?.('#canvas [data-node-id],#navigatorTree [data-tree-select-node]'))return;
  queueMicrotask(enhancePremiumTypeInspector);
  setTimeout(enhancePremiumTypeInspector,240);
}
function onClick(e){const b=e.target.closest?.('button'),n=currentNode();if(!b||!n||!premium())return;
  if(b.dataset.v6TypeScale){const set=n.type==='heading'?HEADING:TEXT,row=set[b.dataset.v6TypeScale]?.[dev()];if(!row)return;mutate('Premium typography scale',()=>{const s=bucket(n);s.fontSize=row[0];s.lineHeight=row[1];if(n.type==='heading')s.letterSpacing=row[2]});return}
  if(b.dataset.v6TypeMeasure){const v=MEASURE[b.dataset.v6TypeMeasure];if(!v)return;mutate('Premium text measure',()=>bucket(n).maxWidth=v);return}
  if(b.dataset.v6TypeAlign){mutate('Premium text alignment',()=>{const s=bucket(n);s.textAlign=b.dataset.v6TypeAlign==='center'?'center':'left';if(b.dataset.v6TypeAlign==='center')s.marginInline='auto';else s.marginInline=''});return}
  if(b.dataset.v6ButtonSize){const v=BUTTON[b.dataset.v6ButtonSize];if(!v)return;mutate('Premium button size',()=>Object.assign(bucket(n),v));return}
  if(b.dataset.v6ButtonFlow){mutate('Premium button width',()=>{bucket(n).width=b.dataset.v6ButtonFlow==='full'?'100%':''});return}
}
function installCss(){if(document.getElementById('v6PremiumTypeCss'))return;const s=document.createElement('style');s.id='v6PremiumTypeCss';s.textContent=`.v6-premium-type-editor{margin-bottom:9px}.v6-pte-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;margin-bottom:7px;border-radius:10px;border:1px solid rgba(126,107,237,.22);background:rgba(112,92,255,.07)}.v6-pte-head strong{font-size:10px}.v6-pte-head span{font-size:8px;text-transform:uppercase;color:#8b95a7}.v6-pte-grid{display:grid;gap:5px;margin-top:5px}.v6-pte-grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.v6-pte-grid-3{grid-template-columns:repeat(3,minmax(0,1fr))}.v6-pte-grid button{min-height:32px!important;padding:5px 7px!important;font-size:9px!important}.v6-pte-grid button.is-active{border-color:#7d6aed!important;box-shadow:inset 0 0 0 1px #7d6aed!important;background:rgba(112,92,255,.10)!important}`;document.head.appendChild(s)}
function boot(){
  const root=$('#elementInspector'),side=$('#rightSidebar');if(!root||!side||!state.project){setTimeout(boot,60);return}
  installCss();
  new MutationObserver(()=>queueMicrotask(enhancePremiumTypeInspector)).observe(root,{childList:true,subtree:false});
  side.addEventListener('click',onClick);
  document.addEventListener('click',refreshAfterSelection,true);
  enhancePremiumTypeInspector();
  document.querySelector('#uiLanguage')?.addEventListener('change',()=>setTimeout(enhancePremiumTypeInspector,0));
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot()}
