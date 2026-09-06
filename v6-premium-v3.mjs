const WIDTH_BY_TYPE={
  premiumHeroSaas:'1240',premiumHeroShowcase:'1240',premiumBento:'1180',premiumMediaSplit:'1180',
  premiumMediaMosaic:'1180',premiumLogoCloud:'1180',premiumStatsBand:'1180',premiumTestimonialSpotlight:'1120',
  premiumPricing:'1160',premiumFaqSplit:'1120',premiumContactConversion:'1120',premiumCtaBanner:'1180'
};
const INTENT_BY_TYPE={
  premiumHeroSaas:'conversion',premiumHeroShowcase:'brand',premiumBento:'product',premiumMediaSplit:'story',
  premiumMediaMosaic:'portfolio',premiumLogoCloud:'trust',premiumStatsBand:'proof',premiumTestimonialSpotlight:'trust',
  premiumPricing:'commerce',premiumFaqSplit:'objection',premiumContactConversion:'lead',premiumCtaBanner:'conversion'
};

function nodes(root,out=[]){if(!root)return out;out.push(root);for(const child of root.children||[])nodes(child,out);return out}
function ensureBuckets(node){node.style||={};for(const key of ['base','tablet','mobile','hover','focus'])node.style[key]||={};return node.style}
function placeholder(index=0){
  const palettes=[['#ebe7ff','#7664e8','#1d1738'],['#e8f0f8','#5d7894','#16263a'],['#f5e9df','#c77c53','#3c241c'],['#e6f1ec','#589574','#17362a']];
  const [soft,accent,ink]=palettes[index%palettes.length];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${soft}"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="1200" height="900" fill="url(#g)"/><circle cx="930" cy="180" r="210" fill="${accent}" opacity=".16"/><circle cx="170" cy="760" r="250" fill="${accent}" opacity=".10"/><rect x="110" y="105" width="980" height="690" rx="42" fill="#fff" opacity=".86"/><rect x="160" y="160" width="370" height="34" rx="17" fill="${accent}" opacity=".9"/><rect x="160" y="230" width="690" height="70" rx="20" fill="${ink}" opacity=".93"/><rect x="160" y="330" width="560" height="22" rx="11" fill="${ink}" opacity=".20"/><rect x="160" y="372" width="460" height="22" rx="11" fill="${ink}" opacity=".14"/><rect x="160" y="445" width="290" height="250" rx="30" fill="${soft}"/><rect x="480" y="445" width="560" height="110" rx="30" fill="${soft}"/><rect x="480" y="585" width="260" height="110" rx="30" fill="${accent}" opacity=".18"/><rect x="770" y="585" width="270" height="110" rx="30" fill="${ink}" opacity=".10"/></svg>`;
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
}

export function polishPremiumBlock(block){
  if(!block||!(block.premiumVariant||String(block.preset||'').startsWith('premium')))return block;
  block.premiumVariant=true;
  block.premiumV3=true;
  block.premiumIntent=INTENT_BY_TYPE[block.preset]||'premium';
  if(!block.contentWidth)block.contentWidth=WIDTH_BY_TYPE[block.preset]||'1180';
  ensureBuckets(block);
  block.style.base.overflow=block.style.base.overflow||'hidden';
  const all=nodes(block.root);let mediaIndex=0;
  for(const node of all){
    const s=ensureBuckets(node);
    if(node.type==='image'){
      node.props||={};
      if(!node.props.src)node.props.src=placeholder(mediaIndex++);
      if(node.props.lazy===undefined)node.props.lazy=!String(block.preset).startsWith('premiumHero');
      s.base.maxWidth=s.base.maxWidth||'100%';
      s.base.objectFit=s.base.objectFit||node.props.fit||'cover';
    }
    if(node.type==='button'){
      s.base.transition=s.base.transition||'transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease';
      s.hover.transform=s.hover.transform||'translateY(-1px)';
      s.focus.outline=s.focus.outline||'2px solid var(--site-primary,#6553e6)';
      s.focus.outlineOffset=s.focus.outlineOffset||'3px';
    }
    if(node.type==='heading'){
      s.base.textWrap=s.base.textWrap||'balance';
      s.mobile.overflowWrap=s.mobile.overflowWrap||'anywhere';
    }
    if(node.type==='container'){
      s.base.minWidth=s.base.minWidth||'0';
      s.mobile.minWidth=s.mobile.minWidth||'0';
    }
  }
  return block;
}

export function premiumBlockProfile(block){
  if(!block)return null;
  return {type:block.preset||'',intent:block.premiumIntent||INTENT_BY_TYPE[block.preset]||'',contentWidth:block.contentWidth||'',v3:!!block.premiumV3};
}
