export const SOCIAL_PLATFORMS=[
  ['custom','Custom link'],['whatsapp','WhatsApp'],['telegram','Telegram'],['instagram','Instagram'],['facebook','Facebook'],['tiktok','TikTok'],['youtube','YouTube'],['linkedin','LinkedIn'],['x','X / Twitter'],['email','Email'],['phone','Phone']
];

const clean=v=>String(v??'').trim();
const digits=v=>clean(v).replace(/\D/g,'');
const directUrl=v=>/^https?:\/\//i.test(clean(v));
const setFloatClass=(p,side)=>{const classes=clean(p.className).split(/\s+/).filter(Boolean).filter(x=>x!=='v6-float-left'&&x!=='v6-float-right');if(side)classes.push(`v6-float-${side}`);p.className=[...new Set(classes)].join(' ')};

export function platformFromItem(item={}){
  const hay=`${item.label||''} ${item.url||''}`.toLowerCase();
  if(/wa\.me|whatsapp/.test(hay))return'whatsapp';
  if(/t\.me|telegram/.test(hay))return'telegram';
  if(/instagram/.test(hay))return'instagram';
  if(/facebook|fb\.com/.test(hay))return'facebook';
  if(/tiktok/.test(hay))return'tiktok';
  if(/youtube|youtu\.be/.test(hay))return'youtube';
  if(/linkedin/.test(hay))return'linkedin';
  if(/twitter|x\.com/.test(hay))return'x';
  if(/^mailto:/i.test(item.url||''))return'email';
  if(/^tel:/i.test(item.url||''))return'phone';
  return'custom';
}

export function platformValue(item={},platform=platformFromItem(item)){
  const u=clean(item.url);
  if(platform==='whatsapp')return digits((u.match(/wa\.me\/([^?/#]+)/i)||[])[1]||u);
  if(platform==='telegram')return clean((u.match(/t\.me\/([^?/#]+)/i)||[])[1]||u).replace(/^@/,'');
  if(platform==='email')return u.replace(/^mailto:/i,'');
  if(platform==='phone')return u.replace(/^tel:/i,'');
  return u==='#'?'':u;
}

export function socialHrefFromPlatform(platform,value,message=''){
  const v=clean(value);
  if(platform==='whatsapp'){
    const n=digits(v);if(!n)return'#';
    return`https://wa.me/${n}${clean(message)?`?text=${encodeURIComponent(clean(message))}`:''}`;
  }
  if(platform==='telegram'){
    if(!v)return'#';if(directUrl(v))return v;
    return`https://t.me/${v.replace(/^@/,'').replace(/^https?:\/\/t\.me\//i,'')}`;
  }
  if(platform==='email')return v?`mailto:${v.replace(/^mailto:/i,'')}`:'#';
  if(platform==='phone')return v?`tel:${v.replace(/^tel:/i,'')}`:'#';
  if(['instagram','facebook','tiktok','youtube','linkedin','x'].includes(platform))return v?(directUrl(v)?v:`https://${v.replace(/^\/+/, '')}`):'#';
  return v||'#';
}

export function platformLabel(platform){return({whatsapp:'WhatsApp',telegram:'Telegram',instagram:'Instagram',facebook:'Facebook',tiktok:'TikTok',youtube:'YouTube',linkedin:'LinkedIn',x:'X',email:'Email',phone:'Phone',custom:'Link'})[platform]||'Link'}
export function platformPlaceholder(platform){return({whatsapp:'+994 50 123 45 67',telegram:'username',instagram:'https://instagram.com/brand',facebook:'https://facebook.com/brand',tiktok:'https://tiktok.com/@brand',youtube:'https://youtube.com/@brand',linkedin:'https://linkedin.com/company/brand',x:'https://x.com/brand',email:'hello@example.com',phone:'+994 50 123 45 67',custom:'https://example.com'})[platform]||'https://example.com'}

export function applyFloatingStyleModel(n){
  if(!n||n.type!=='social')return n;
  const p=n.props||(n.props={}),f=p.floating||(p.floating={position:'right',size:56,offsetX:22,offsetY:22,tooltip:true,pulse:true});
  f.position=f.position==='left'?'left':'right';
  f.size=Math.max(44,Math.min(76,Number(f.size)||56));
  f.offsetX=Math.max(8,Math.min(120,Number(f.offsetX)||22));
  f.offsetY=Math.max(8,Math.min(160,Number(f.offsetY)||22));
  setFloatClass(p,f.position);
  n.style.base.position='fixed';n.style.base.bottom=`${f.offsetY}px`;n.style.base.zIndex='999';n.style.base.width='auto';n.style.base['--social-size']=`${f.size}px`;n.style.base['--social-tooltip-enabled']=f.tooltip===false?'0':'1';n.style.base['--social-pulse-animation']=f.pulse===false?'none':'v6SocialPulse 2.4s ease-in-out infinite';
  if(f.position==='left'){n.style.base.left=`${f.offsetX}px`;delete n.style.base.right}else{n.style.base.right=`${f.offsetX}px`;delete n.style.base.left}
  n.style.tablet.bottom=`${Math.max(12,f.offsetY-4)}px`;n.style.mobile.bottom=`max(${Math.max(10,f.offsetY-8)}px, env(safe-area-inset-bottom))`;
  if(f.position==='left'){n.style.tablet.left=`${Math.max(12,f.offsetX-4)}px`;n.style.mobile.left=`${Math.max(10,f.offsetX-8)}px`;delete n.style.tablet.right;delete n.style.mobile.right}else{n.style.tablet.right=`${Math.max(12,f.offsetX-4)}px`;n.style.mobile.right=`${Math.max(10,f.offsetX-8)}px`;delete n.style.tablet.left;delete n.style.mobile.left}
  return n;
}

export function clearFloatingStyleModel(n){
  if(!n||n.type!=='social')return n;setFloatClass(n.props||{},'');
  for(const bag of [n.style?.base,n.style?.tablet,n.style?.mobile])if(bag){for(const key of ['position','left','right','bottom','zIndex','width','--social-size','--social-tooltip-enabled','--social-pulse-animation'])delete bag[key]}
  return n;
}

function looksLikeRootDemo(platform,url){
  const u=clean(url).replace(/\/$/,'').toLowerCase();
  return(platform==='instagram'&&u==='https://instagram.com')||(platform==='facebook'&&(u==='https://facebook.com'||u==='https://fb.com'))||(platform==='youtube'&&u==='https://youtube.com')||(platform==='linkedin'&&u==='https://linkedin.com')||(platform==='x'&&u==='https://x.com')||(platform==='tiktok'&&u==='https://tiktok.com');
}

export function functionalAuditIssues(n){
  const out=[];const add=(level,msg)=>out.push({level,msg});if(!n)return out;const p=n.props||{};
  if(n.type==='form'){
    const s=p.submission||{},provider=String(s.provider||'formspree');
    if(provider==='web3forms'&&!clean(s.accessKey))add('warn','Form: Web3Forms Access Key is missing. Messages will not be delivered.');
    if(provider!=='web3forms'&&!clean(s.endpoint))add('warn',`Form: ${provider} destination is not configured.`);
    if(!(p.fields||[]).length)add('warn','Form: add at least one field.');
  }
  if(n.type==='video'&&!clean(p.url))add('info','Video: add a YouTube, Vimeo or MP4 URL.');
  if(n.type==='map'&&!clean(p.url))add('info','Map: add a Google Maps embed URL.');
  if(n.type==='embed'){
    if(!clean(p.html))add('info','Embed: paste iframe/embed code.');
    if(/example\.com/i.test(p.html||''))add('info','Embed: replace the example.com demo with real content.');
  }
  if(n.type==='tabs'){
    const items=p.items||[];
    if(items.length<2)add('info','Tabs: add at least two tabs.');
    items.forEach((x,i)=>{if(!clean(x.label))add('warn',`Tabs: tab ${i+1} has no title.`);if(!clean(x.content))add('info',`Tabs: tab ${i+1} has no content.`)});
    if(items.length&&Number(p.active)>=items.length)add('warn','Tabs: active tab points outside the tab list.');
  }
  if(n.type==='accordion'){
    const items=p.items||[];if(!items.length)add('warn','Accordion: add at least one item.');
    items.forEach((x,i)=>{if(!clean(x.q))add('warn',`Accordion: item ${i+1} has no question.`);if(!clean(x.a))add('info',`Accordion: item ${i+1} has no answer.`)});
  }
  if(n.type==='reviews'){
    const items=p.items||[];if(!items.length)add('info','Reviews: add at least one review.');
    items.forEach((x,i)=>{if(!clean(x.name))add('info',`Reviews: review ${i+1} has no customer name.`);if(!clean(x.quote))add('warn',`Reviews: review ${i+1} has no review text.`)});
  }
  if(n.type==='social'){
    const items=p.items||[];if(!items.length)add('warn',p.style==='floating'?'Floating contact: add at least one contact method.':'Social links: add at least one link.');
    items.forEach(x=>{
      const platform=platformFromItem(x),url=clean(x.url),value=platformValue(x,platform);
      if(!url||url==='#')add('info',`${platformLabel(platform)}: destination is not configured.`);
      if(looksLikeRootDemo(platform,url))add('info',`${platformLabel(platform)}: replace the demo homepage with your real profile URL.`);
      if(platform==='whatsapp'&&(digits(value).length<8||digits(value)==='994000000000'))add('warn','WhatsApp: enter a real phone number with country code.');
      if(platform==='telegram'&&(!value||/^username$/i.test(value)))add('warn','Telegram: enter a real username or t.me link.');
    });
  }
  return out;
}

export function premiumFunctionalCss(){return `
.v5-tabs-buttons{display:inline-flex;max-width:100%;gap:6px;flex-wrap:wrap;padding:5px;border:1px solid #e2e8f0;border-radius:14px;background:#f8fafc;box-shadow:inset 0 1px 0 rgba(255,255,255,.8);margin-bottom:14px}.v5-tabs-buttons button{appearance:none;color:#344054!important;background:transparent!important;border:1px solid transparent!important;padding:10px 15px!important;border-radius:10px!important;font-weight:750;line-height:1.2;cursor:pointer;transition:color .16s ease,background .16s ease,box-shadow .16s ease,transform .16s ease}.v5-tabs-buttons button:hover{color:#111827!important;background:#fff!important}.v5-tabs-buttons button.active{color:#fff!important;background:linear-gradient(135deg,#705cff,#8c5cff)!important;border-color:#705cff!important;box-shadow:0 7px 18px rgba(112,92,255,.24)}.v5-tab-panel{color:#1f2937!important;padding:20px!important;border:1px solid #e2e8f0!important;border-radius:16px!important;background:#fff!important;box-shadow:0 10px 30px rgba(15,23,42,.055);line-height:1.6;min-height:66px}.v5-tab-panel[hidden]{display:none!important}
.v5-accordion details{overflow:hidden;transition:border-color .16s ease,box-shadow .16s ease}.v5-accordion details[open]{border-color:#c9c1ff;box-shadow:0 12px 34px rgba(112,92,255,.10)}.v5-accordion summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:16px}.v5-accordion summary::-webkit-details-marker{display:none}.v5-accordion summary::after{content:'+';flex:0 0 30px;width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#f3f0ff;color:#705cff;font-size:20px;line-height:1}.v5-accordion details[open] summary::after{content:'−'}
.v5-social a{position:relative}.v5-social a[href*='wa.me'] .v5-social-icon,.v5-social a[href*='t.me'] .v5-social-icon{font-size:0;overflow:visible}.v5-social a[href*='wa.me'] .v5-social-icon::before{content:'☎';font-size:21px;font-family:Arial,sans-serif;font-weight:800;color:#fff;transform:rotate(-14deg)}.v5-social a[href*='t.me'] .v5-social-icon::before{content:'';display:block;width:22px;height:18px;background:#fff;clip-path:polygon(0 44%,100% 0,73% 100%,49% 66%,31% 80%,36% 58%)}.v5-social[data-social-style='pill'] a[href*='wa.me'] .v5-social-icon{background:#25D366}.v5-social[data-social-style='pill'] a[href*='t.me'] .v5-social-icon{background:#229ED9}.v5-social[data-social-style='pill'] a[href*='wa.me'] .v5-social-icon,.v5-social[data-social-style='pill'] a[href*='t.me'] .v5-social-icon{width:28px;height:28px;border-radius:9px}.v5-social[data-social-style='floating']{gap:12px!important;align-items:flex-end!important;pointer-events:none}.v5-social[data-social-style='floating'] a{pointer-events:auto;width:var(--social-size,56px)!important;height:var(--social-size,56px)!important;min-height:0!important;padding:0!important;border:1px solid rgba(255,255,255,.32)!important;border-radius:50%!important;color:#fff!important;background:#111827;box-shadow:0 16px 38px rgba(15,23,42,.28),inset 0 1px 0 rgba(255,255,255,.22)!important;animation:var(--social-pulse-animation,none);backdrop-filter:blur(8px)}.v5-social[data-social-style='floating'] a[href*='wa.me']{background:#25D366!important}.v5-social[data-social-style='floating'] a[href*='t.me']{background:#229ED9!important}.v5-social[data-social-style='floating'] .v5-social-icon{width:30px;height:30px;background:transparent!important}.v5-social[data-social-style='floating'] a::after{position:absolute;right:calc(100% + 10px);top:50%;transform:translate(8px,-50%);padding:7px 10px;border-radius:9px;background:#111827;color:#fff;font-size:12px;font-weight:750;white-space:nowrap;opacity:0;pointer-events:none;box-shadow:0 8px 24px rgba(15,23,42,.2);transition:opacity .16s ease,transform .16s ease}.v5-social[data-social-style='floating'].v6-float-left a::after{left:calc(100% + 10px);right:auto;transform:translate(-8px,-50%)}.v5-social[data-social-style='floating'] a[href*='wa.me']::after{content:'WhatsApp'}.v5-social[data-social-style='floating'] a[href*='t.me']::after{content:'Telegram'}.v5-social[data-social-style='floating'] a:hover::after{opacity:var(--social-tooltip-enabled,1);transform:translate(0,-50%)}.v5-social[data-social-style='floating'] a:hover{transform:translateY(-3px) scale(1.03)}@keyframes v6SocialPulse{0%,100%{box-shadow:0 16px 38px rgba(15,23,42,.28),0 0 0 0 rgba(112,92,255,0)}50%{box-shadow:0 16px 38px rgba(15,23,42,.24),0 0 0 7px rgba(112,92,255,.08)}}
.fx-functional-editor .repeat-row{position:relative}.fx-premium-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.fx-premium-badge{display:inline-flex;align-items:center;min-height:24px;padding:4px 8px;border-radius:999px;background:linear-gradient(135deg,#5f49ff,#8d5cff);color:#fff;font-size:10px;font-weight:850;letter-spacing:.04em;text-transform:uppercase}.fx-social-row,.fx-tab-row,.fx-accordion-row{display:grid;gap:9px;padding:12px;border:1px solid var(--line);border-radius:12px;background:color-mix(in srgb,var(--panel-2) 88%,transparent)}.fx-row-actions{display:grid;grid-template-columns:1fr auto auto auto;gap:6px;align-items:center}.fx-row-actions button{min-width:34px}.fx-help{display:block;color:var(--muted);font-size:11px;line-height:1.45}.fx-functional-editor input[type='range']{width:100%}
@media(max-width:760px){.v5-tabs-buttons{display:flex;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}.v5-tabs-buttons::-webkit-scrollbar{display:none}.v5-tabs-buttons button{flex:0 0 auto}.v5-tab-panel{padding:16px!important}.v5-social[data-social-style='floating'] a::after{display:none}.fx-row-actions{grid-template-columns:1fr auto auto auto}}
`}

export function ensurePremiumFunctionalCss(){
  if(typeof document==='undefined'||document.getElementById('v6PremiumFunctionalCss'))return;
  const s=document.createElement('style');s.id='v6PremiumFunctionalCss';s.textContent=premiumFunctionalCss();document.head.appendChild(s);
}
