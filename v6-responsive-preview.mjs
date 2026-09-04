import {walk} from './v5-ops.mjs';
import {state,currentPage} from './v5-runtime.mjs';

const camel=k=>k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase());
const cssText=o=>Object.entries(o||{}).filter(([,v])=>v!==''&&v!==null&&v!==undefined).map(([k,v])=>`${camel(k)}:${v}`).join(';');

function resolvedStyle(style={},device='desktop'){
  const out={...(style.base||{})};
  if(device==='tablet'||device==='mobile')Object.assign(out,style.tablet||{});
  if(device==='mobile')Object.assign(out,style.mobile||{});
  return out;
}

function modelOverrides(project,page,device){
  const scope=`#canvas[data-device="${device}"]`;
  let out='';
  for(const b of page.blocks||[]){
    const blockCss=cssText(resolvedStyle(b.style,device));
    if(blockCss)out+=`${scope} [data-v5-style="${b.id}"]{${blockCss}}`;
    walk(b.root,n=>{
      const nodeCss=cssText(resolvedStyle(n.style,device));
      if(nodeCss)out+=`${scope} [data-v5-style="${n.id}"]{${nodeCss}}`;
    });
  }
  return out;
}

function shellIsolation(project,device){
  const t=project.theme||{},c=t.colors||{},fonts=t.fonts||{},typ=t.typography||{};
  const bodyFont=fonts.body||'Arial,sans-serif';
  const headingFont=fonts.heading||bodyFont;
  const bodySize=Number(typ.body?.size)||18;
  const bodyLine=Number(typ.body?.lineHeight)||1.55;
  const h1=Number(typ.h1?.size)||56,h2=Number(typ.h2?.size)||40,h3=Number(typ.h3?.size)||24;
  const h1Line=Number(typ.h1?.lineHeight)||1.05,h2Line=Number(typ.h2?.lineHeight)||1.12,h3Line=Number(typ.h3?.lineHeight)||1.2;
  const h1Weight=Number(typ.h1?.weight)||800,h2Weight=Number(typ.h2?.weight)||750,h3Weight=Number(typ.h3?.weight)||700;
  const container=Number(t.containerWidth)||1120;
  const scope=`#canvas[data-device="${device}"]`;

  let out=`body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;line-height:1.4;color:var(--text);background:var(--bg)}#canvas{container-type:inline-size;font-family:${bodyFont};font-size:${device==='mobile'?16:bodySize}px;line-height:${bodyLine};color:${c.text||'#111827'};background:${c.background||'#fff'}}#canvas a{color:inherit}#canvas .v5-block-toolbar,#canvas .v5-inline-add{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}`;

  out+=`${scope} .v5-section-inner{width:${device==='mobile'?'100%':`min(100%,${container}px)`};margin:0 auto}${scope} .v5-container,${scope} .v5-node{min-width:0;max-width:100%}${scope} .v5-heading{font-family:${headingFont};overflow-wrap:break-word;word-break:normal}${scope} .v5-text{overflow-wrap:break-word;word-break:normal}${scope} .v5-img{max-width:100%}`;

  if(device==='mobile'){
    out+=`${scope} h1.v5-heading{font-size:clamp(34px,10cqw,48px);line-height:${h1Line};font-weight:${h1Weight}}${scope} h2.v5-heading{font-size:clamp(28px,8cqw,38px);line-height:${h2Line};font-weight:${h2Weight}}${scope} h3.v5-heading{font-size:clamp(20px,5.8cqw,26px);line-height:${h3Line};font-weight:${h3Weight}}${scope} .v5-gallery{grid-template-columns:repeat(var(--gal-m,1),minmax(0,1fr))}${scope} .v5-gallery.masonry{columns:var(--gal-m,1)}${scope} .v5-nav{flex-wrap:nowrap}${scope} .v5-nav-toggle{display:inline-flex;margin-left:auto}${scope} .v5-nav-links{display:none;position:absolute;top:calc(100% + 8px);right:0;flex-direction:column;align-items:stretch;background:${c.background||'#fff'};color:${c.text||'#111827'};padding:14px;border:1px solid ${c.border||'#dfe3ec'};border-radius:14px;box-shadow:0 18px 50px rgba(15,23,42,.18);min-width:220px}${scope} .v5-nav.open .v5-nav-links{display:flex}${scope} .v5-nav[data-panel="left"] .v5-nav-links{left:0;right:auto}${scope} .v5-nav[data-panel="center"] .v5-nav-links{left:50%;right:auto;transform:translateX(-50%)}${scope} .v5-nav[data-panel="full"] .v5-nav-links{left:0;right:0;width:100%}${scope} .v5-btn{max-width:100%}`;
  }else{
    out+=`${scope} h1.v5-heading{font-size:${h1}px;line-height:${h1Line};font-weight:${h1Weight}}${scope} h2.v5-heading{font-size:${h2}px;line-height:${h2Line};font-weight:${h2Weight}}${scope} h3.v5-heading{font-size:${h3}px;line-height:${h3Line};font-weight:${h3Weight}}${scope} .v5-nav-toggle{display:none}${scope} .v5-nav-links{display:flex;position:static;transform:none;flex-direction:row;align-items:center;background:transparent;border:0;box-shadow:none;padding:0;min-width:0}`;
    if(device==='tablet')out+=`${scope} .v5-gallery{grid-template-columns:repeat(var(--gal-t,2),minmax(0,1fr))}${scope} .v5-gallery.masonry{columns:var(--gal-t,2)}`;
    else out+=`${scope} .v5-gallery{grid-template-columns:repeat(var(--gal-d,3),minmax(0,1fr))}${scope} .v5-gallery.masonry{columns:var(--gal-d,3)}`;
  }
  return out;
}

export function responsivePreviewCss(project,page,device='desktop'){
  if(!project||!page)return'';
  device=['desktop','tablet','mobile'].includes(device)?device:'desktop';
  return `${shellIsolation(project,device)}${modelOverrides(project,page,device)}`;
}

let scheduled=false,observer=null;
function ensureStyle(){
  let el=document.getElementById('editorResponsiveStyle');
  if(!el){el=document.createElement('style');el.id='editorResponsiveStyle';document.head.appendChild(el)}
  return el;
}
function sync(){
  scheduled=false;
  if(!state.project)return;
  const page=currentPage();
  if(!page)return;
  ensureStyle().textContent=responsivePreviewCss(state.project,page,state.device||'desktop');
}
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(sync)}
function boot(){
  if(!state.project||!document.getElementById('canvas')){setTimeout(boot,40);return}
  sync();
  const runtime=document.getElementById('runtimeStyle');
  observer=new MutationObserver(schedule);
  if(runtime)observer.observe(runtime,{childList:true,characterData:true,subtree:true});
  observer.observe(document.getElementById('canvas'),{attributes:true,attributeFilter:['data-device']});
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-device]'))setTimeout(sync,0)},true);
  window.addEventListener('pageshow',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
