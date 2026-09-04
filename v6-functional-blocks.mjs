import {block,container,makeHeading,makeText,makeButton,makeVideo,makeEmbed,makeSocial,makeMap,makeAccordion,makeTabs,makeForm,makeReviews} from './v5-core.mjs';
import {applyFloatingStyleModel} from './v6-functional-premium.mjs';

export const FUNCTIONAL_READY_TYPES=['form','videoSection','embedSection','socialSection','mapSection','reviewsSlider','tabsSection','accordionSection','floatingContact'];
export const FUNCTIONAL_ICONS={form:'✉',videoSection:'▶',embedSection:'<>',socialSection:'◎',mapSection:'⌖',reviewsSlider:'★',tabsSection:'⊞',accordionSection:'?',floatingContact:'↗'};

const style=(n,base={},tablet={},mobile={})=>{Object.assign(n.style.base,base);Object.assign(n.style.tablet,tablet);Object.assign(n.style.mobile,mobile);return n};
const finish=(type,b)=>{b.preset=type;return b};
const kicker=text=>style(makeText(text),{fontSize:'12px',fontWeight:'800',letterSpacing:'.12em',textTransform:'uppercase',color:'#705cff'});
const muted=text=>style(makeText(text),{color:'#667085',fontSize:'17px',maxWidth:'720px'},{fontSize:'16px'},{fontSize:'16px'});
const section=(name,root,bg='#ffffff')=>{const b=block(name,root);style(b,{background:bg},{},{paddingTop:'44px',paddingBottom:'44px'});return b};
const splitRoot=(left,right)=>{const root=container([left,right],{gap:40});root.style.base.display='grid';root.style.base.gridTemplateColumns='minmax(0,.9fr) minmax(0,1.1fr)';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='24px';return root};

export function makeFunctionalPreset(type){
  if(!FUNCTIONAL_READY_TYPES.includes(type))return null;
  if(type==='form'){
    const form=makeForm();style(form,{padding:'24px',border:'1px solid #e5e8f0',borderRadius:'22px',background:'#ffffff',boxShadow:'0 18px 50px rgba(15,23,42,.08)'},{padding:'22px'},{padding:'18px',borderRadius:'18px'});
    const left=container([kicker('CONTACT'),makeHeading('Напишите нам',2),muted('Настройте поля формы и выберите, куда отправлять сообщения: Formspree, Web3Forms, Getform, Basin или свой API.'),style(makeText('hello@example.com\n+994 00 000 00 00'),{whiteSpace:'pre-line',fontWeight:'650',color:'#334155'})],{gap:16});
    const b=section('Contact Form',splitRoot(left,container([form],{gap:0})),'linear-gradient(180deg,#f8f9fc,#ffffff)');return finish(type,b);
  }
  if(type==='videoSection'){
    const video=makeVideo('');style(video,{borderRadius:'22px',boxShadow:'0 22px 60px rgba(15,23,42,.14)',background:'#0f172a'});
    const b=section('Video',container([kicker('VIDEO'),makeHeading('Видео-блок',2),muted('YouTube, Vimeo-compatible embed URL or direct MP4. Настройте poster, autoplay, loop, controls и формат.'),video],{gap:18}),'#ffffff');return finish(type,b);
  }
  if(type==='embedSection'){
    const embed=makeEmbed('<iframe src="https://example.com" title="Embed" loading="lazy"></iframe>');style(embed,{border:'1px solid #e5e8f0',borderRadius:'20px',overflow:'hidden',background:'#f8fafc',minHeight:'220px'});
    const b=section('Embed',container([kicker('EMBED'),makeHeading('Встроенный контент',2),muted('Вставляйте Calendly, Typeform, Spotify, карты, видео и любой разрешённый iframe/embed code.'),embed],{gap:18}),'#f8f9fc');return finish(type,b);
  }
  if(type==='socialSection'){
    const social=makeSocial([{label:'Instagram',url:'https://instagram.com',icon:'IG'},{label:'YouTube',url:'https://youtube.com',icon:'YT'},{label:'LinkedIn',url:'https://linkedin.com',icon:'in'},{label:'Telegram',url:'https://t.me/username',icon:'TG'}]);
    style(social,{padding:'8px 0'});
    const b=section('Social Links',container([kicker('SOCIAL'),makeHeading('Мы в социальных сетях',2),muted('Добавьте нужные платформы, ссылки и выберите компактный или текстовый вид.'),social],{gap:18}),'#ffffff');return finish(type,b);
  }
  if(type==='mapSection'){
    const map=makeMap('');style(map,{minHeight:'380px',borderRadius:'22px',boxShadow:'0 18px 48px rgba(15,23,42,.10)'},{minHeight:'340px'},{minHeight:'280px',borderRadius:'18px'});
    const info=container([kicker('LOCATION'),makeHeading('Как нас найти',2),muted('Укажите адрес, часы работы и вставьте Google Maps embed URL.'),style(makeText('Baku, Azerbaijan\nMon–Fri · 09:00–18:00'),{whiteSpace:'pre-line',color:'#334155',fontWeight:'650'})],{gap:16});
    const b=section('Map + Contacts',splitRoot(info,container([map],{gap:0})),'#f8f9fc');return finish(type,b);
  }
  if(type==='reviewsSlider'){
    const reviews=makeReviews();
    const b=section('Reviews Slider',container([kicker('REVIEWS'),makeHeading('Отзывы клиентов',2),muted('Адаптивный слайдер отзывов со звёздами, ролями, стрелками и autoplay.'),reviews],{gap:18}),'#ffffff');return finish(type,b);
  }
  if(type==='tabsSection'){
    const tabs=makeTabs([{id:'tab-services',label:'Услуги',content:'Опишите основные услуги или категории.'},{id:'tab-process',label:'Процесс',content:'Покажите этапы работы.'},{id:'tab-support',label:'Поддержка',content:'Расскажите, как клиент получает помощь.'}]);style(tabs,{padding:'20px',border:'1px solid #e5e8f0',borderRadius:'18px',background:'#ffffff',boxShadow:'0 18px 44px rgba(15,23,42,.06)'},{padding:'18px'},{padding:'14px'});
    const b=section('Tabs',container([kicker('TABS'),makeHeading('Контент по вкладкам',2),tabs],{gap:18}),'#f8f9fc');return finish(type,b);
  }
  if(type==='accordionSection'){
    const acc=makeAccordion([{id:'faq-1',q:'Как это работает?',a:'Добавьте свой ответ в настройках элемента.'},{id:'faq-2',q:'Можно изменить вопросы?',a:'Да, вопросы и ответы полностью редактируются.'},{id:'faq-3',q:'Работает на телефоне?',a:'Да, блок адаптируется под мобильный экран.'}]);
    const b=section('Accordion',container([kicker('FAQ'),makeHeading('Частые вопросы',2),acc],{gap:18}),'#ffffff');return finish(type,b);
  }
  if(type==='floatingContact'){
    const social=makeSocial([{label:'WhatsApp',url:'https://wa.me/994000000000',icon:'WA',message:''},{label:'Telegram',url:'https://t.me/username',icon:'TG'}]);social.props.display='icon';social.props.style='floating';social.props.layout='column';social.props.floating={position:'right',size:56,offsetX:22,offsetY:22,tooltip:true,pulse:true};applyFloatingStyleModel(social);style(social,{display:'flex',flexDirection:'column',gap:'12px'},{},{'--social-size':'52px'});
    const root=container([social],{gap:0});style(root,{minHeight:'0'});const b=section('Floating WhatsApp / Telegram',root,'transparent');style(b,{padding:'0',background:'transparent',minHeight:'0'},{padding:'0'},{padding:'0'});return finish(type,b);
  }
  return null;
}
