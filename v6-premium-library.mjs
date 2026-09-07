import {block,container,makeText,makeHeading,makeButton,makeImage,makeIcon,makeLogo,makeSocial,makeForm,makeList} from './v5-core.mjs';

export const PREMIUM_READY_TYPES=['heroSaas','heroEditorial','featuresBento','featureSpotlight','logosPremium','testimonialsSpotlight','pricingPremium','ctaSplit','contactPremium','footerMega'];

export const PREMIUM_READY_META={
  heroSaas:{name:'Hero · SaaS',icon:'✦',family:'Hero',desc:'Product-led split hero with proof points and dual CTA.'},
  heroEditorial:{name:'Hero · Editorial',icon:'H1',family:'Hero',desc:'Large editorial headline, centered CTA and showcase media.'},
  featuresBento:{name:'Features · Bento',icon:'▦',family:'Features',desc:'Asymmetric bento grid for product benefits and capabilities.'},
  featureSpotlight:{name:'Feature · Spotlight',icon:'◧',family:'Features',desc:'Dark premium split section for a flagship feature or offer.'},
  logosPremium:{name:'Logos · Premium',icon:'◎',family:'Trust',desc:'Polished logo cloud with trust statement and responsive grid.'},
  testimonialsSpotlight:{name:'Testimonials · Spotlight',icon:'★',family:'Trust',desc:'One dominant customer story with supporting proof cards.'},
  pricingPremium:{name:'Pricing · Premium',icon:'₼',family:'Commerce',desc:'Three-tier pricing with feature lists and featured plan.'},
  ctaSplit:{name:'CTA · Split',icon:'→',family:'Conversion',desc:'High-contrast conversion block with primary and secondary actions.'},
  contactPremium:{name:'Contact · Premium',icon:'@',family:'Conversion',desc:'Premium contact split with real form element and trust details.'},
  footerMega:{name:'Footer · Mega',icon:'⌄',family:'Navigation',desc:'Multi-column footer with brand, links, contact and social proof.'}
};

const style=(n,base={},tablet={},mobile={})=>{Object.assign(n.style.base,base);Object.assign(n.style.tablet,tablet);Object.assign(n.style.mobile,mobile);return n};
const finish=(type,b)=>{b.preset=type;b.premiumVariant=true;return b};
const section=(name,root,base={},tablet={},mobile={})=>{const b=block(name,root);style(b,base,tablet,mobile);return b};
const kicker=(text,dark=false)=>style(makeText(text),{display:'inline-flex',width:'fit-content',padding:'7px 11px',borderRadius:'999px',fontSize:'11px',fontWeight:'800',letterSpacing:'.12em',textTransform:'uppercase',background:dark?'rgba(255,255,255,.09)':'#f0edff',color:dark?'#ddd8ff':'#5e4bd8',border:dark?'1px solid rgba(255,255,255,.12)':'1px solid #ddd6ff'});
const lead=text=>style(makeText(text),{fontSize:'18px',lineHeight:'1.65',color:'#667085',maxWidth:'680px'},{fontSize:'17px'},{fontSize:'16px'});
const darkLead=text=>style(makeText(text),{fontSize:'18px',lineHeight:'1.65',color:'#c3cad8',maxWidth:'660px'},{fontSize:'17px'},{fontSize:'16px'});
const btnRow=(primary='Start now',secondary='Learn more')=>{const a=makeButton(primary),b=makeButton(secondary);a.props.icon='→';b.props.variant='outline';return style(container([a,b],{direction:'row',gap:10,align:'center'}),{flexWrap:'wrap'},{},{gap:'8px'});};
const premiumCard=(children,accent=false)=>{const c=container(children,{gap:13});style(c,{padding:'24px',borderRadius:'22px',border:accent?'1px solid #8b7cff':'1px solid #e5e8f0',background:accent?'linear-gradient(180deg,#f4f1ff 0%,#ffffff 82%)':'linear-gradient(180deg,#ffffff,#fbfcff)',boxShadow:accent?'0 22px 60px rgba(112,92,255,.15)':'0 14px 42px rgba(15,23,42,.075)'},{padding:'21px'},{padding:'18px',borderRadius:'18px'});Object.assign(c.style.hover,{transform:'translateY(-3px)',boxShadow:'0 22px 56px rgba(15,23,42,.12)'});return c;};
const stat=(value,label)=>premiumCard([style(makeHeading(value,3),{fontSize:'26px',color:'#111827'}),style(makeText(label),{fontSize:'13px',color:'#667085',fontWeight:'650'})]);
const grid=(children,cols='repeat(3,minmax(0,1fr))',tablet='repeat(2,minmax(0,1fr))',mobile='1fr',gap=16)=>{const g=container(children,{gap});g.style.base.display='grid';g.style.base.gridTemplateColumns=cols;g.style.tablet.gridTemplateColumns=tablet;g.style.mobile.gridTemplateColumns=mobile;return g;};

export function makePremiumPreset(type){
  if(!PREMIUM_READY_TYPES.includes(type))return null;

  if(type==='heroSaas'){
    const title=style(makeHeading('Turn your next idea into a premium digital experience.',1),{maxWidth:'760px',letterSpacing:'-.045em',lineHeight:'1.01'});
    const copy=lead('A conversion-focused hero with clear hierarchy, product proof and room for a strong visual story.');
    const left=container([kicker('PREMIUM PRODUCT'),title,copy,btnRow('Start building','View capabilities'),style(makeText('Responsive by default · Export-ready · No vendor lock-in'),{fontSize:'13px',fontWeight:'700',color:'#7c8799'})],{gap:20});style(left,{justifyContent:'center'});
    const image=makeImage('','Product interface preview');style(image,{aspectRatio:'4 / 3',borderRadius:'18px',background:'#e9ecf3'});
    const stats=grid([stat('3×','faster launches'),stat('100%','responsive'),stat('1-click','export')],'repeat(3,minmax(0,1fr))','repeat(3,minmax(0,1fr))','1fr 1fr 1fr',10);
    const visual=container([image,stats],{gap:12});style(visual,{padding:'12px',borderRadius:'28px',background:'linear-gradient(145deg,#ece8ff,#fff3ea 58%,#edf7ff)',border:'1px solid rgba(112,92,255,.16)',boxShadow:'0 34px 90px rgba(49,46,129,.18)'},{padding:'10px'},{padding:'8px',borderRadius:'20px'});
    const root=container([left,visual],{gap:52});root.style.base.display='grid';root.style.base.gridTemplateColumns='minmax(0,1.03fr) minmax(0,.97fr)';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='30px';
    return finish(type,section('Hero · SaaS',root,{background:'radial-gradient(circle at 78% 8%,rgba(112,92,255,.14),transparent 28%),linear-gradient(135deg,#fbfbff 0%,#fffaf7 100%)',paddingTop:'92px',paddingBottom:'92px'},{paddingTop:'70px',paddingBottom:'70px'},{paddingTop:'48px',paddingBottom:'48px'}));
  }

  if(type==='heroEditorial'){
    const title=style(makeHeading('A bold first impression without visual noise.',1),{maxWidth:'980px',margin:'0 auto',textAlign:'center',letterSpacing:'-.05em',lineHeight:'.98'});
    const copy=style(lead('Editorial spacing, strong typography and a full-width showcase make this variant ideal for studios, portfolios and premium brands.'),{margin:'0 auto',textAlign:'center'});
    const actions=btnRow('Explore the work','About the studio');style(actions,{justifyContent:'center'});
    const media=makeImage('','Editorial showcase');style(media,{aspectRatio:'16 / 7',borderRadius:'26px',boxShadow:'0 28px 80px rgba(15,23,42,.16)',background:'#e9ecf3'},{aspectRatio:'16 / 8'},{aspectRatio:'4 / 3',borderRadius:'18px'});
    const root=container([style(kicker('EDITORIAL HERO'),{margin:'0 auto'}),title,copy,actions,style(container([media],{gap:0}),{marginTop:'18px'})],{gap:20});
    return finish(type,section('Hero · Editorial',root,{background:'linear-gradient(180deg,#ffffff 0%,#f7f8fc 100%)',paddingTop:'96px',paddingBottom:'72px'},{paddingTop:'72px'},{paddingTop:'48px',paddingBottom:'48px'}));
  }

  if(type==='featuresBento'){
    const large=premiumCard([kicker('01'),makeHeading('One system, fewer compromises',2),lead('Use a stronger visual hierarchy to explain the most important capability first.'),style(makeImage('','Feature preview'),{aspectRatio:'16 / 10',borderRadius:'16px',marginTop:'6px'})],true);large.style.base.gridColumn='span 2';large.style.mobile.gridColumn='span 1';
    const compact=(i,title,text)=>premiumCard([style(makeIcon(i),{width:'42px',height:'42px',borderRadius:'13px',background:'#111827',color:'#fff',fontWeight:'850'}),makeHeading(title,3),style(makeText(text),{color:'#667085',lineHeight:'1.55'})]);
    const a=compact('02','Responsive control','Desktop, tablet and mobile can carry intentional layouts without losing structure.');
    const b=compact('03','Reusable patterns','Save strong sections and reuse them without rebuilding every page.');
    const c=compact('04','Export confidence','Functional blocks keep the runtime they need after export.');c.style.base.gridColumn='span 2';c.style.mobile.gridColumn='span 1';
    const g=grid([large,a,b,c],'repeat(3,minmax(0,1fr))','repeat(2,minmax(0,1fr))','1fr',16);
    const root=container([kicker('BENTO SYSTEM'),makeHeading('Explain more with a cleaner visual rhythm',2),lead('A premium bento pattern for products, services and capability pages.'),g],{gap:20});
    return finish(type,section('Features · Bento',root,{background:'#f6f7fb'}));
  }

  if(type==='featureSpotlight'){
    const copy=container([kicker('FLAGSHIP FEATURE',true),style(makeHeading('Make the important part impossible to miss.',2),{color:'#fff',maxWidth:'600px'}),darkLead('A dark spotlight section creates contrast in long landing pages and gives a flagship feature a clear moment of focus.'),btnRow('See the workflow','Technical details')],{gap:18});
    const media=makeImage('','Spotlight feature');style(media,{aspectRatio:'4 / 3',borderRadius:'22px',border:'1px solid rgba(255,255,255,.12)',boxShadow:'0 30px 80px rgba(0,0,0,.34)',background:'#20283a'});
    const root=container([copy,media],{gap:48});root.style.base.display='grid';root.style.base.gridTemplateColumns='minmax(0,.92fr) minmax(0,1.08fr)';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='28px';
    return finish(type,section('Feature · Spotlight',root,{background:'radial-gradient(circle at 85% 0,rgba(112,92,255,.34),transparent 30%),linear-gradient(135deg,#0b1020,#15172a 65%,#111827)',color:'#fff',paddingTop:'84px',paddingBottom:'84px'},{paddingTop:'66px',paddingBottom:'66px'},{paddingTop:'46px',paddingBottom:'46px'}));
  }

  if(type==='logosPremium'){
    const logos=['Northstar','Aperture','Vertex','Monarch','Signal','Studio'].map(name=>style(makeLogo(name,''),{minHeight:'82px',justifyContent:'center',padding:'16px',border:'1px solid #e6e9f0',borderRadius:'18px',background:'#fff',color:'#6b7280',fontWeight:'800',letterSpacing:'-.02em',boxShadow:'0 10px 30px rgba(15,23,42,.045)'}));
    const root=container([style(makeText('TRUSTED BY TEAMS THAT CARE ABOUT THE DETAILS'),{textAlign:'center',fontSize:'11px',fontWeight:'800',letterSpacing:'.12em',color:'#98a2b3'}),grid(logos,'repeat(6,minmax(0,1fr))','repeat(3,minmax(0,1fr))','repeat(2,minmax(0,1fr))',12)],{gap:18});
    return finish(type,section('Logos · Premium',root,{background:'#fbfcfe',paddingTop:'54px',paddingBottom:'54px'}));
  }

  if(type==='testimonialsSpotlight'){
    const hero=premiumCard([style(makeText('★★★★★'),{color:'#f5a623',letterSpacing:'.08em'}),style(makeHeading('“The builder finally feels like a product we can confidently show to clients.”',2),{maxWidth:'760px'}),style(makeText('Aylin M. · Creative Director'),{fontWeight:'750',color:'#475467'})],true);hero.style.base.gridColumn='span 2';hero.style.mobile.gridColumn='span 1';
    const small=(name,role,text)=>premiumCard([style(makeText('★★★★★'),{color:'#f5a623'}),style(makeText(text),{color:'#475467',lineHeight:'1.65'}),makeHeading(name,3),style(makeText(role),{fontSize:'13px',color:'#98a2b3'})]);
    const g=grid([hero,small('Murad A.','Founder','The responsive behavior is predictable and the export is clean.'),small('Leyla R.','Marketing','We stopped fighting the editor and started focusing on the page itself.')],'repeat(2,minmax(0,1fr))','repeat(2,minmax(0,1fr))','1fr',16);
    return finish(type,section('Testimonials · Spotlight',container([kicker('CUSTOMER PROOF'),makeHeading('Trust should look as considered as the rest of the page',2),g],{gap:20}),{background:'#f7f8fc'}));
  }

  if(type==='pricingPremium'){
    const plan=(name,price,features,featured=false)=>{const action=makeButton(featured?'Choose Pro':'Choose plan');if(!featured)action.props.variant='outline';const list=makeList(features);style(list,{color:'#475467',lineHeight:'1.75'});return premiumCard([style(makeText(featured?'MOST POPULAR':'PLAN'),{fontSize:'11px',fontWeight:'850',letterSpacing:'.1em',color:featured?'#6652df':'#98a2b3'}),makeHeading(name,3),style(makeHeading(price,2),{fontSize:'38px'}),style(makeText('For teams that want a clear, scalable starting point.'),{color:'#667085'}),list,action],featured);};
    const g=grid([plan('Starter','49 ₼',['Core blocks','Responsive defaults','Static export']),plan('Pro','99 ₼',['Premium variants','Advanced functional blocks','Priority templates'],true),plan('Studio','179 ₼',['Everything in Pro','Reusable systems','Client-ready workflow'])]);
    return finish(type,section('Pricing · Premium',container([style(kicker('PRICING'),{margin:'0 auto'}),style(makeHeading('Simple plans with a premium presentation',2),{textAlign:'center'}),style(lead('Use the featured plan to create a clear decision path without turning the section into a wall of text.'),{margin:'0 auto',textAlign:'center'}),g],{gap:20}),{background:'#fff'}));
  }

  if(type==='ctaSplit'){
    const left=container([kicker('READY TO SHIP?',true),style(makeHeading('Build the page. Keep the quality.',2),{color:'#fff',maxWidth:'640px'}),darkLead('A high-contrast CTA for the moment where the visitor already understands the value.')],{gap:16});
    const actions=btnRow('Start the project','Talk to us');style(actions,{justifyContent:'flex-end'},{justifyContent:'flex-start'},{justifyContent:'flex-start'});
    const root=container([left,actions],{gap:32,align:'center'});root.style.base.display='grid';root.style.base.gridTemplateColumns='minmax(0,1.25fr) minmax(300px,.75fr)';root.style.tablet.gridTemplateColumns='1fr';root.style.mobile.gridTemplateColumns='1fr';
    return finish(type,section('CTA · Split',root,{background:'radial-gradient(circle at 12% 0,rgba(255,255,255,.14),transparent 28%),linear-gradient(135deg,#5f49e7,#7f56d9 58%,#c05aa9)',color:'#fff',paddingTop:'64px',paddingBottom:'64px',borderRadius:'0'},{paddingTop:'56px',paddingBottom:'56px'},{paddingTop:'44px',paddingBottom:'44px'}));
  }

  if(type==='contactPremium'){
    const details=container([kicker('CONTACT'),makeHeading('A better contact section starts with less friction.',2),lead('Give visitors one clear path to contact you and support it with the details they need to trust the next step.'),premiumCard([makeHeading('Baku, Azerbaijan',3),style(makeText('Mon–Fri · 09:00–18:00\nhello@example.com\n+994 00 000 00 00'),{whiteSpace:'pre-line',color:'#475467',lineHeight:'1.8'})])],{gap:18});
    const form=makeForm();style(form,{padding:'26px',border:'1px solid #e4e7ec',borderRadius:'24px',background:'#fff',boxShadow:'0 24px 70px rgba(15,23,42,.10)'},{padding:'22px'},{padding:'18px',borderRadius:'18px'});
    const root=container([details,container([form],{gap:0})],{gap:46});root.style.base.display='grid';root.style.base.gridTemplateColumns='minmax(0,.88fr) minmax(0,1.12fr)';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='28px';
    return finish(type,section('Contact · Premium',root,{background:'linear-gradient(180deg,#f7f8fc,#ffffff)'}));
  }

  if(type==='footerMega'){
    const brand=container([style(makeLogo('NOVA',''),{color:'#fff'}),style(makeText('Premium websites with cleaner structure, stronger hierarchy and export-ready behavior.'),{color:'#aab4c8',maxWidth:'320px',lineHeight:'1.65'}),style(makeSocial([{label:'LinkedIn',url:'https://linkedin.com',icon:'in'},{label:'Instagram',url:'https://instagram.com',icon:'IG'},{label:'Telegram',url:'https://t.me/username',icon:'TG'}]),{color:'#cbd5e1'})],{gap:14});
    const col=(title,items)=>container([style(makeText(title),{fontSize:'12px',fontWeight:'800',letterSpacing:'.08em',color:'#fff'}),...items.map(x=>style(makeText(x),{color:'#9eabc0',fontSize:'14px'}))],{gap:10});
    const cols=grid([brand,col('PRODUCT',['Features','Templates','Pricing','Export']),col('COMPANY',['About','Work','Contact','Privacy']),col('CONTACT',['hello@example.com','+994 00 000 00 00','Baku, Azerbaijan'])],'1.4fr 1fr 1fr 1fr','repeat(2,minmax(0,1fr))','1fr',24);
    const bottom=style(container([style(makeText('© 2026 NOVA. All rights reserved.'),{color:'#7f8aa0',fontSize:'13px'}),style(makeText('Built with Web Builder'),{color:'#7f8aa0',fontSize:'13px'})],{direction:'row',justify:'space-between',align:'center',gap:12}),{paddingTop:'20px',borderTop:'1px solid #263148'},{},{flexDirection:'column',alignItems:'flex-start'});
    return finish(type,section('Footer · Mega',container([cols,bottom],{gap:28}),{background:'linear-gradient(180deg,#101827,#08101d)',color:'#fff',paddingTop:'56px',paddingBottom:'32px'},{paddingTop:'48px'},{paddingTop:'42px',paddingBottom:'28px'}));
  }

  return null;
}

export function premiumLibraryCardMeta(type){return PREMIUM_READY_META[type]||null;}
