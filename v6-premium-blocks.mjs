import {block,container,makeHeading,makeText,makeButton,makeImage,makeIcon,makeLogo,makeCounter,makeAccordion,makeVideo,makeGallery,makeForm,makeReviews} from './v5-core.mjs';

export const PREMIUM_READY_TYPES=[
  'premiumHeroSaas','premiumHeroShowcase','premiumBento','premiumMediaSplit',
  'premiumMediaMosaic','premiumLogoCloud','premiumStatsBand','premiumTestimonialSpotlight',
  'premiumPricing','premiumFaqSplit','premiumContactConversion','premiumCtaBanner'
];

export const PREMIUM_BLOCK_META={
  premiumHeroSaas:{name:'Hero · SaaS',icon:'✦',family:'hero',badge:'PRO',description:'Conversion hero with proof, dual CTA and product preview.'},
  premiumHeroShowcase:{name:'Hero · Showcase',icon:'◫',family:'hero',badge:'PRO',description:'Editorial hero with oversized typography and media composition.'},
  premiumBento:{name:'Features · Bento',icon:'▦',family:'features',badge:'PRO',description:'Modern asymmetric bento grid for product capabilities.'},
  premiumMediaSplit:{name:'Media · Video Split',icon:'▶',family:'media',badge:'PRO',description:'Premium text + responsive video layout with supporting benefits.'},
  premiumMediaMosaic:{name:'Media · Mosaic',icon:'▧',family:'media',badge:'PRO',description:'Editorial image mosaic with lightbox-ready gallery content.'},
  premiumLogoCloud:{name:'Trust · Logo Cloud',icon:'LOGO',family:'trust',badge:'PRO',description:'Clean social-proof strip for partners, clients and press.'},
  premiumStatsBand:{name:'Stats · Impact',icon:'123',family:'trust',badge:'PRO',description:'High-contrast KPI band with four responsive metrics.'},
  premiumTestimonialSpotlight:{name:'Reviews · Spotlight',icon:'★',family:'social-proof',badge:'PRO',description:'Premium review slider framed as a customer story.'},
  premiumPricing:{name:'Pricing · Pro',icon:'₼',family:'commerce',badge:'PRO',description:'Three-tier pricing with featured plan and strong CTA hierarchy.'},
  premiumFaqSplit:{name:'FAQ · Split',icon:'?',family:'content',badge:'PRO',description:'Two-column FAQ composition with editable accordion.'},
  premiumContactConversion:{name:'Contact · Conversion',icon:'✉',family:'conversion',badge:'PRO',description:'Sales-ready contact section with trust copy and real form.'},
  premiumCtaBanner:{name:'CTA · Gradient',icon:'→',family:'conversion',badge:'PRO',description:'High-impact closing CTA with dual actions and visual depth.'}
};

const style=(n,base={},tablet={},mobile={})=>{Object.assign(n.style.base,base);Object.assign(n.style.tablet,tablet);Object.assign(n.style.mobile,mobile);return n};
const finish=(type,b)=>{b.preset=type;b.premiumVariant=true;return b};
const muted=(text)=>style(makeText(text),{color:'#667085',fontSize:'17px',lineHeight:'1.65',maxWidth:'680px'},{fontSize:'16px'},{fontSize:'16px'});
const eyebrow=(text,dark=false)=>style(makeText(text),{fontSize:'11px',fontWeight:'850',letterSpacing:'.14em',textTransform:'uppercase',color:dark?'#c7beff':'#6553e6'});
const pill=(text)=>style(makeText(text),{display:'inline-flex',alignSelf:'flex-start',width:'auto',padding:'8px 11px',border:'1px solid rgba(112,92,255,.18)',borderRadius:'999px',background:'rgba(112,92,255,.08)',color:'#5947d7',fontSize:'12px',fontWeight:'760'});
const iconTile=(value)=>style(makeIcon(value),{width:'46px',height:'46px',borderRadius:'15px',background:'linear-gradient(135deg,#6d5dfc,#9b6bff)',color:'#fff',fontWeight:'900',boxShadow:'0 12px 26px rgba(103,83,230,.24)'});
const card=(children,featured=false)=>{const c=container(children,{gap:14});style(c,{padding:'24px',border:featured?'1px solid rgba(112,92,255,.36)':'1px solid #e5e9f1',borderRadius:'22px',background:featured?'linear-gradient(180deg,#f5f1ff 0%,#ffffff 86%)':'rgba(255,255,255,.92)',boxShadow:featured?'0 22px 56px rgba(82,64,190,.15)':'0 14px 42px rgba(15,23,42,.07)',overflow:'hidden'},{padding:'22px'},{padding:'18px',borderRadius:'18px'});Object.assign(c.style.hover,{transform:'translateY(-3px)',boxShadow:'0 24px 58px rgba(15,23,42,.12)'});return c};
const grid=(children,cols=3,tablet=2,mobile=1,gap=18)=>{const g=container(children,{gap});g.style.base.display='grid';g.style.base.gridTemplateColumns=`repeat(${cols},minmax(0,1fr))`;g.style.tablet.gridTemplateColumns=`repeat(${tablet},minmax(0,1fr))`;g.style.mobile.gridTemplateColumns=`repeat(${mobile},minmax(0,1fr))`;return g};
const dualButtons=(primary='Start now',secondary='See demo')=>{const a=makeButton(primary),b=makeButton(secondary);a.props.icon='→';b.props.variant='outline';const row=container([a,b],{direction:'row',gap:10,wrap:'wrap'});style(row,{alignItems:'center'});return row};
const section=(name,root,bg='#ffffff')=>{const b=block(name,root);style(b,{background:bg,paddingTop:'88px',paddingBottom:'88px'},{paddingTop:'68px',paddingBottom:'68px'},{paddingTop:'48px',paddingBottom:'48px'});return b};

function heroSaas(){
  const copy=container([
    pill('Built for modern teams'),
    style(makeHeading('Turn a strong idea into a premium digital experience.',1),{maxWidth:'760px',fontSize:'64px',lineHeight:'1.02',letterSpacing:'-.045em'},{fontSize:'52px'},{fontSize:'40px'}),
    muted('Use a polished conversion-first layout with clear hierarchy, social proof and responsive defaults already in place.'),
    dualButtons('Start building','Watch preview'),
    style(makeText('No-code editing · Responsive by default · Export-ready'),{fontSize:'13px',fontWeight:'650',color:'#7a8496'})
  ],{gap:20});style(copy,{justifyContent:'center'});
  const image=makeImage('','Product dashboard preview');style(image,{aspectRatio:'16 / 11',borderRadius:'20px'});
  const preview=container([style(makeText('LIVE PRODUCT PREVIEW'),{fontSize:'10px',fontWeight:'850',letterSpacing:'.12em',color:'#7a6bea'}),image],{gap:12});style(preview,{padding:'14px',border:'1px solid rgba(112,92,255,.20)',borderRadius:'28px',background:'linear-gradient(145deg,rgba(255,255,255,.98),rgba(244,241,255,.94))',boxShadow:'0 34px 90px rgba(49,39,120,.18)',transform:'rotate(1deg)'},{transform:'none'},{padding:'9px',borderRadius:'20px'});
  const root=container([copy,preview],{gap:54});root.style.base.display='grid';root.style.base.gridTemplateColumns='minmax(0,1.02fr) minmax(0,.98fr)';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='34px';
  const b=section('Premium Hero · SaaS',root,'radial-gradient(circle at 88% 8%,rgba(112,92,255,.18),transparent 34%),radial-gradient(circle at 12% 86%,rgba(255,165,108,.13),transparent 28%),linear-gradient(135deg,#fbfbff 0%,#fffaf7 100%)');style(b,{paddingTop:'104px',paddingBottom:'104px'},{paddingTop:'78px',paddingBottom:'78px'},{paddingTop:'52px',paddingBottom:'52px'});return b;
}

function heroShowcase(){
  const top=container([
    eyebrow('Creative systems · 2026'),
    style(makeHeading('A bold editorial hero with space to breathe.',1),{maxWidth:'900px',fontSize:'72px',lineHeight:'.98',letterSpacing:'-.055em',color:'#f8fafc'},{fontSize:'58px'},{fontSize:'42px'}),
    style(makeText('Use it for agencies, portfolios, premium services and modern brand launches.'),{maxWidth:'620px',fontSize:'18px',lineHeight:'1.6',color:'#b9c2d3'}),
    dualButtons('Explore work','About us')
  ],{gap:22});
  const a=makeImage('','Showcase image one'),b=makeImage('','Showcase image two');style(a,{aspectRatio:'4 / 5',borderRadius:'24px'});style(b,{aspectRatio:'16 / 10',borderRadius:'24px'});
  const media=container([a,b],{gap:16});media.style.base.display='grid';media.style.base.gridTemplateColumns='.78fr 1.22fr';media.style.mobile.gridTemplateColumns='1fr';style(media,{alignItems:'end'});
  const root=container([top,media],{gap:48});const x=section('Premium Hero · Showcase',root,'radial-gradient(circle at 20% 0%,rgba(120,92,255,.22),transparent 30%),linear-gradient(145deg,#0b1020,#151a2d 60%,#0d1222)');style(x,{color:'#fff',paddingTop:'96px',paddingBottom:'74px'},{paddingTop:'76px'},{paddingTop:'50px',paddingBottom:'48px'});return x;
}

function bento(){
  const lead=card([iconTile('01'),makeHeading('One visual system',3),muted('Keep spacing, hierarchy and interaction patterns consistent across every section.')],true);style(lead,{gridColumn:'span 2',minHeight:'250px'},{gridColumn:'span 1'},{gridColumn:'span 1'});
  const speed=card([iconTile('02'),makeHeading('Fast to configure',3),muted('Responsive defaults reduce repetitive setup without locking you into a rigid template.')]);
  const media=card([iconTile('03'),makeHeading('Media first',3),muted('Modern image, gallery and video compositions stay responsive by default.')]);
  const systems=card([iconTile('04'),makeHeading('Built to scale',3),muted('Start from a ready composition, then customize every nested element.')],true);style(systems,{gridColumn:'span 2'},{gridColumn:'span 1'},{gridColumn:'span 1'});
  const g=grid([lead,speed,media,systems],3,2,1,16);
  const root=container([eyebrow('BENTO SYSTEM'),makeHeading('Structure complex value propositions without visual noise.',2),muted('A flexible asymmetric section inspired by current product and SaaS design patterns.'),g],{gap:20});
  return section('Premium Features · Bento',root,'linear-gradient(180deg,#f8f9fd,#ffffff)');
}

function mediaSplit(){
  const video=makeVideo('');style(video,{borderRadius:'24px',background:'#111827',boxShadow:'0 28px 72px rgba(15,23,42,.20)'});
  const frame=container([video],{gap:0});style(frame,{padding:'10px',border:'1px solid rgba(148,163,184,.26)',borderRadius:'30px',background:'linear-gradient(145deg,#eef0ff,#ffffff)',boxShadow:'0 28px 74px rgba(46,39,105,.14)'},{padding:'8px'},{padding:'6px',borderRadius:'21px'});
  const benefits=['Responsive aspect ratios','YouTube, Vimeo or direct MP4','Poster, autoplay, loop and controls'];
  const list=container(benefits.map((x,i)=>{const r=container([style(makeText('✓'),{width:'28px',height:'28px',display:'grid',placeItems:'center',borderRadius:'50%',background:'#ece9ff',color:'#5a49d6',fontWeight:'900'}),style(makeText(x),{fontWeight:'700',color:'#273043'})],{direction:'row',gap:10,align:'center'});return r}),{gap:12});
  const copy=container([eyebrow('MEDIA STORY'),makeHeading('Put product motion next to a clear business message.',2),muted('This block combines an editable video element with a compact benefit stack and two conversion actions.'),list,dualButtons('Play the story','Learn more')],{gap:18});style(copy,{justifyContent:'center'});
  const root=container([copy,frame],{gap:48});root.style.base.display='grid';root.style.base.gridTemplateColumns='.9fr 1.1fr';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='28px';
  return section('Premium Media · Video Split',root,'#ffffff');
}

function mediaMosaic(){
  const gallery=makeGallery(5);gallery.props.columns={base:3,tablet:2,mobile:1};gallery.props.gap=14;gallery.props.ratio='4/3';gallery.props.lightbox=true;style(gallery,{borderRadius:'24px'});
  const root=container([eyebrow('SELECTED WORK'),makeHeading('A responsive visual story, not a plain image grid.',2),muted('Ideal for portfolios, real estate, hospitality, products and editorial storytelling. Lightbox is enabled by default.'),gallery],{gap:18});
  return section('Premium Media · Mosaic',root,'linear-gradient(180deg,#ffffff,#f7f8fc)');
}

function logoCloud(){
  const logos=['NORTH','ARC','NOVA','MOTION','KIN','SCOPE'].map(name=>{const l=makeLogo(name);style(l,{justifyContent:'center',minHeight:'64px',padding:'14px 18px',border:'1px solid #e8ebf2',borderRadius:'16px',background:'#fff',color:'#697386',fontSize:'15px',boxShadow:'0 8px 24px rgba(15,23,42,.035)'});return l});
  const g=grid(logos,6,3,2,10);const root=container([style(makeText('Trusted by ambitious teams'),{textAlign:'center',fontSize:'13px',fontWeight:'760',color:'#7a8496'}),g],{gap:16});
  const b=section('Premium Trust · Logo Cloud',root,'#ffffff');style(b,{paddingTop:'48px',paddingBottom:'48px'},{paddingTop:'42px',paddingBottom:'42px'},{paddingTop:'34px',paddingBottom:'34px'});return b;
}

function statsBand(){
  const values=[['42%','faster launch'],['3.2×','more iteration'],['99.9%','export fidelity'],['24/7','responsive UI']];
  const cards=values.map(([v,l])=>{const c=makeCounter(v,'');c.props.value=v;c.props.label=l;style(c,{padding:'22px',borderLeft:'1px solid rgba(255,255,255,.12)',color:'#fff'});return c});
  const g=grid(cards,4,2,1,0);const root=container([eyebrow('IMPACT',true),makeHeading('Numbers deserve stronger hierarchy.',2),g],{gap:20});style(root,{color:'#fff'});
  const b=section('Premium Stats · Impact',root,'radial-gradient(circle at 85% 0%,rgba(118,93,255,.36),transparent 35%),linear-gradient(135deg,#101524,#17142b)');style(b,{color:'#fff',paddingTop:'68px',paddingBottom:'68px'},{paddingTop:'58px',paddingBottom:'58px'},{paddingTop:'44px',paddingBottom:'44px'});return b;
}

function testimonialSpotlight(){
  const reviews=makeReviews();reviews.props.autoplay=false;reviews.props.showArrows=true;reviews.props.showRating=true;style(reviews,{padding:'8px'});
  const aside=card([style(makeText('CUSTOMER STORY'),{fontSize:'11px',fontWeight:'850',letterSpacing:'.12em',color:'#6655df'}),makeHeading('Social proof that feels like part of the design.',2),muted('Use real names, roles and quotes. The slider remains functional after export.')],true);
  const root=container([aside,reviews],{gap:28});root.style.base.display='grid';root.style.base.gridTemplateColumns='.72fr 1.28fr';root.style.tablet.gridTemplateColumns='1fr';root.style.mobile.gridTemplateColumns='1fr';
  return section('Premium Reviews · Spotlight',root,'linear-gradient(180deg,#f8f7ff,#ffffff)');
}

function pricing(){
  const plans=[
    {name:'Launch',price:'49',desc:'For focused landing pages.',features:['Core blocks','Responsive controls','Static export']},
    {name:'Scale',price:'99',desc:'For commercial sites and teams.',features:['Premium variants','Advanced media','Forms & interactions'],featured:true},
    {name:'Studio',price:'149',desc:'For high-volume design work.',features:['Reusable systems','Multilingual pages','Priority workflows']}
  ];
  const cards=plans.map(p=>{const button=makeButton(p.featured?'Choose Scale':'Choose plan');if(!p.featured)button.props.variant='outline';const features=container(p.features.map(x=>style(makeText(`✓ ${x}`),{color:'#4b5565',fontSize:'14px',fontWeight:'620'})),{gap:9});const c=card([style(makeText(p.name.toUpperCase()),{fontSize:'11px',fontWeight:'850',letterSpacing:'.12em',color:p.featured?'#604edd':'#7a8496'}),style(makeHeading(`$${p.price}`,2),{fontSize:'46px',letterSpacing:'-.04em'}),muted(p.desc),features,button],p.featured);if(p.featured)style(c,{transform:'translateY(-10px)'},{transform:'none'},{transform:'none'});return c});
  const g=grid(cards,3,3,1,16);const root=container([eyebrow('PRICING'),makeHeading('A commercial pricing block with a clear featured plan.',2),muted('Every card remains fully editable: typography, copy, buttons, spacing, borders and responsive layout.'),g],{gap:20});
  return section('Premium Pricing · Pro',root,'#ffffff');
}

function faqSplit(){
  const acc=makeAccordion([{id:'premium-faq-1',q:'Can I customize every element?',a:'Yes. Select any nested element and adjust its content, layout and responsive styles.'},{id:'premium-faq-2',q:'Does the exported site keep interactions?',a:'Yes. Supported runtime behavior is bundled into the exported HTML.'},{id:'premium-faq-3',q:'Can I start from a premium block and redesign it?',a:'Yes. Premium blocks are starting compositions, not locked templates.'},{id:'premium-faq-4',q:'Will older projects be restyled automatically?',a:'No. Existing saved styling remains untouched unless you edit it.'}]);
  const copy=container([eyebrow('FAQ'),makeHeading('Answer friction before it becomes a sales objection.',2),muted('Keep the left side strategic and the right side scannable. Questions and answers are structured and reorderable.'),makeButton('Talk to sales')],{gap:18});style(copy,{justifyContent:'center'});
  const right=card([acc]);const root=container([copy,right],{gap:44});root.style.base.display='grid';root.style.base.gridTemplateColumns='.8fr 1.2fr';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='26px';
  return section('Premium FAQ · Split',root,'linear-gradient(180deg,#f8f9fc,#ffffff)');
}

function contactConversion(){
  const form=makeForm();style(form,{padding:'26px',border:'1px solid #e4e8f0',borderRadius:'24px',background:'#ffffff',boxShadow:'0 26px 68px rgba(15,23,42,.11)'},{padding:'22px'},{padding:'18px',borderRadius:'18px'});
  const proof=container([style(makeText('✓ Typical response under one business day'),{fontSize:'13px',fontWeight:'700',color:'#4b5565'}),style(makeText('✓ Structured form fields are fully editable'),{fontSize:'13px',fontWeight:'700',color:'#4b5565'}),style(makeText('✓ Form destination is checked by Site Audit'),{fontSize:'13px',fontWeight:'700',color:'#4b5565'})],{gap:9});
  const copy=container([eyebrow('START A CONVERSATION'),makeHeading('Make the contact section feel like part of the product.',2),muted('A strong conversion section combines context, trust and a form that actually has a configurable destination.'),proof,style(makeText('hello@example.com · +994 00 000 00 00'),{fontWeight:'750',color:'#273043'})],{gap:18});style(copy,{justifyContent:'center'});
  const root=container([copy,form],{gap:48});root.style.base.display='grid';root.style.base.gridTemplateColumns='.86fr 1.14fr';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='26px';
  return section('Premium Contact · Conversion',root,'radial-gradient(circle at 0 100%,rgba(112,92,255,.10),transparent 28%),linear-gradient(180deg,#ffffff,#f8f9fc)');
}

function ctaBanner(){
  const copy=container([eyebrow('READY TO BUILD?',true),style(makeHeading('Finish with a clear next move.',2),{color:'#fff',fontSize:'48px',letterSpacing:'-.04em'},{fontSize:'42px'},{fontSize:'34px'}),style(makeText('Use one decisive CTA and one low-friction secondary action.'),{color:'#dedcf2',fontSize:'17px',maxWidth:'620px'}),dualButtons('Start project','Book a demo')],{gap:17});
  const visual=container([style(makeText('PREMIUM'),{fontSize:'11px',fontWeight:'900',letterSpacing:'.16em',color:'#d8d1ff'}),style(makeHeading('12',2),{fontSize:'96px',lineHeight:'.85',color:'#fff',letterSpacing:'-.07em'}),style(makeText('new high-quality section variants'),{fontSize:'14px',fontWeight:'700',color:'#c8c4e8'})],{gap:10});style(visual,{padding:'28px',border:'1px solid rgba(255,255,255,.13)',borderRadius:'24px',background:'rgba(255,255,255,.055)',backdropFilter:'blur(10px)'},{padding:'24px'},{padding:'20px'});
  const root=container([copy,visual],{gap:34});root.style.base.display='grid';root.style.base.gridTemplateColumns='1.2fr .8fr';root.style.mobile.gridTemplateColumns='1fr';
  const b=section('Premium CTA · Gradient',root,'radial-gradient(circle at 90% 0%,rgba(224,100,184,.35),transparent 35%),radial-gradient(circle at 0 100%,rgba(112,92,255,.46),transparent 40%),linear-gradient(135deg,#17142b,#29214d)');style(b,{color:'#fff',paddingTop:'70px',paddingBottom:'70px'},{paddingTop:'60px',paddingBottom:'60px'},{paddingTop:'44px',paddingBottom:'44px'});return b;
}

export function makePremiumPreset(type){
  if(!PREMIUM_READY_TYPES.includes(type))return null;
  const factories={
    premiumHeroSaas:heroSaas,premiumHeroShowcase:heroShowcase,premiumBento:bento,
    premiumMediaSplit:mediaSplit,premiumMediaMosaic:mediaMosaic,premiumLogoCloud:logoCloud,
    premiumStatsBand:statsBand,premiumTestimonialSpotlight:testimonialSpotlight,
    premiumPricing:pricing,premiumFaqSplit:faqSplit,premiumContactConversion:contactConversion,
    premiumCtaBanner:ctaBanner
  };
  const b=factories[type]?.();
  return b?finish(type,b):null;
}
