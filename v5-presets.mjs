import {block,container,makeNav,makeText,makeHeading,makeButton,makeImage,makeIcon,makeSocial,makeLogo,makeAccordion,makeGallery,makeImageTextGrid} from './v5-core.mjs';

const style=(n,base={},tablet={},mobile={})=>{Object.assign(n.style.base,base);Object.assign(n.style.tablet,tablet);Object.assign(n.style.mobile,mobile);return n};
const finish=(type,b)=>{b.preset=type;return b};
const kicker=(text)=>style(makeText(text),{fontSize:'12px',fontWeight:'850',letterSpacing:'.12em',textTransform:'uppercase',color:'#705cff'});
const muted=(text)=>style(makeText(text),{color:'#667085',fontSize:'17px',maxWidth:'680px'},{fontSize:'16px'},{fontSize:'16px'});
const cardify=(c,featured=false)=>{style(c,{padding:'22px',border:featured?'1px solid #8876ff':'1px solid #e5e8f0',borderRadius:'20px',background:featured?'linear-gradient(180deg,#f6f2ff 0%,#ffffff 100%)':'linear-gradient(180deg,#ffffff 0%,#fbfcff 100%)',boxShadow:featured?'0 18px 48px rgba(112,92,255,.14)':'0 12px 34px rgba(15,23,42,.07)'},{padding:'20px'},{padding:'18px',borderRadius:'16px'});Object.assign(c.style.hover,{transform:'translateY(-3px)',boxShadow:'0 20px 44px rgba(15,23,42,.11)'});return c};
const iconTile=(value)=>style(makeIcon(value),{width:'42px',height:'42px',borderRadius:'13px',background:'linear-gradient(135deg,#705cff,#9d67ff)',color:'#fff',fontWeight:'900',boxShadow:'0 8px 20px rgba(112,92,255,.22)'});

export function preset(type){
  const b=(name,root)=>block(name,root);
  switch(type){
  case'navbar':{
    const nav=makeNav();
    style(nav,{padding:'2px 0'});
    const x=b('Menu',container([nav],{gap:0}));
    style(x,{background:'#ffffff',paddingTop:'14px',paddingBottom:'14px',borderBottom:'1px solid #eceef4',boxShadow:'0 8px 26px rgba(15,23,42,.035)'},{paddingTop:'12px',paddingBottom:'12px'},{paddingTop:'10px',paddingBottom:'10px',paddingLeft:'14px',paddingRight:'14px'});
    return finish(type,x);
  }
  case'hero':{
    const k=kicker('NEW GENERATION'),h=style(makeHeading('Создавай смело. Запускай быстро.',1),{maxWidth:'650px'}),copy=muted('Профессиональный сайт без сложного кода — собери страницу из готовых блоков.'),btn=makeButton('Начать проект');btn.props.icon='→';
    style(btn,{alignSelf:'flex-start',marginTop:'4px'});
    const left=container([k,h,copy,btn],{gap:20});style(left,{justifyContent:'center'});
    const img=makeImage('','Hero image');style(img,{borderRadius:'22px',aspectRatio:'4 / 3'});
    const right=container([img],{gap:0});style(right,{padding:'10px',border:'1px solid rgba(112,92,255,.18)',borderRadius:'28px',background:'linear-gradient(135deg,#f0edff,#fff4ec)',boxShadow:'0 28px 70px rgba(68,52,170,.16)'},{padding:'8px'},{padding:'7px',borderRadius:'20px'});
    const root=container([left,right],{direction:'row',gap:48});root.style.base.display='grid';root.style.base.gridTemplateColumns='1.08fr .92fr';root.style.tablet.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='28px';
    const x=b('Hero',root);style(x,{background:'radial-gradient(circle at 78% 12%,rgba(112,92,255,.13),transparent 30%),linear-gradient(135deg,#fbfbff 0%,#fff7f2 100%)',paddingTop:'88px',paddingBottom:'88px'},{paddingTop:'68px',paddingBottom:'68px'},{paddingTop:'48px',paddingBottom:'48px'});return finish(type,x);
  }
  case'features':{
    const titles=['Быстрый запуск','Адаптивный дизайн','Полный контроль'],descs=['Соберите сильную страницу за несколько минут.','Контент аккуратно перестраивается под любой экран.','Редактируйте структуру, стиль и экспорт без ограничений.'];
    const cards=[1,2,3].map(i=>{const c=container([iconTile(`0${i}`),makeHeading(titles[i-1],3),muted(descs[i-1])],{gap:12});return cardify(c)});
    const grid=container(cards,{gap:16});grid.style.base.display='grid';grid.style.base.gridTemplateColumns='repeat(3,minmax(0,1fr))';grid.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.mobile.gridTemplateColumns='1fr';
    const x=b('Features',container([kicker('ПОЧЕМУ МЫ'),makeHeading('Всё необходимое для сильного старта',2),grid],{gap:22}));style(x,{background:'#f8f9fc'});return finish(type,x);
  }
  case'text':{
    const root=container([kicker('НАША ИСТОРИЯ'),makeHeading('Простая идея, сильный результат',2),muted('Нажмите на любой текст и начните редактирование. Все изменения сохраняются в вашем браузере.')],{gap:16});style(root,{maxWidth:'780px',margin:'0 auto',alignItems:'center',textAlign:'center'});
    const x=b('Text',root);style(x,{background:'#ffffff'});return finish(type,x);
  }
  case'split':{
    const image=makeImage('','Section image');style(image,{borderRadius:'24px',aspectRatio:'4 / 3'});
    const imageWrap=container([image],{gap:0});style(imageWrap,{padding:'8px',borderRadius:'28px',background:'linear-gradient(135deg,#ece8ff,#fff0e7)',boxShadow:'0 24px 60px rgba(15,23,42,.11)'});
    const btn=makeButton('Подробнее');btn.props.icon='→';
    const text=container([kicker('О ПРОЕКТЕ'),makeHeading('Дизайн, который работает',2),muted('Расскажите о продукте понятным языком и покажите его главное преимущество.'),btn],{gap:17});style(text,{justifyContent:'center'});
    const root=container([imageWrap,text],{gap:42});root.style.base.display='grid';root.style.base.gridTemplateColumns='1fr 1fr';root.style.mobile.gridTemplateColumns='1fr';root.style.mobile.gap='28px';
    const x=b('Text + Image',root);style(x,{background:'linear-gradient(180deg,#ffffff,#fafbff)'});return finish(type,x);
  }
  case'imageText':{
    const grid=makeImageTextGrid(6);const x=b('Image + Text',container([kicker('КОЛЛЕКЦИЯ'),makeHeading('Изображения с текстом',2),muted('Гибкая сетка для каталога, команды, услуг или портфолио.'),grid],{gap:20}));style(x,{background:'#f8f9fc'});return finish(type,x);
  }
  case'gallery':{
    const gal=makeGallery(6);gal.props.gap=18;gal.props.ratio='4/3';
    const x=b('Gallery',container([kicker('ГАЛЕРЕЯ'),makeHeading('Наши работы',2),muted('Покажите продукт или портфолио в аккуратной адаптивной сетке.'),gal],{gap:18}));style(x,{background:'#ffffff'});return finish(type,x);
  }
  case'cards':{
    const cards=[1,2,3].map(i=>{const img=makeImage('',`Card ${i}`);style(img,{borderRadius:'14px',aspectRatio:'4 / 3'});const btn=makeButton('Подробнее');btn.props.variant='text';btn.props.icon='→';const c=container([img,makeHeading(`Заголовок ${i}`,3),muted('Краткое описание элемента с понятным следующим действием.'),btn],{gap:12});return cardify(c)});
    const grid=container(cards,{gap:16});grid.style.base.display='grid';grid.style.base.gridTemplateColumns='repeat(3,minmax(0,1fr))';grid.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.mobile.gridTemplateColumns='1fr';
    const x=b('Cards',container([kicker('КАРТОЧКИ'),makeHeading('Контент, который легко сканировать',2),grid],{gap:20}));style(x,{background:'#f8f9fc'});return finish(type,x);
  }
  case'quote':{
    const root=container([style(makeText('✦'),{fontSize:'26px',color:'#b7aaff'}),makeHeading('«Хороший сайт не просто выглядит красиво — он ясно ведёт человека к нужному действию».',2),style(makeText('— ВАША КОМАНДА'),{fontSize:'12px',fontWeight:'850',letterSpacing:'.1em',color:'#b9c2d6'})],{gap:18});style(root,{padding:'38px',border:'1px solid rgba(255,255,255,.10)',borderRadius:'26px',background:'radial-gradient(circle at 0 0,rgba(126,98,255,.28),transparent 34%),linear-gradient(135deg,#17142b,#0d1322)',boxShadow:'0 26px 70px rgba(10,15,30,.22)'},{padding:'32px'},{padding:'24px',borderRadius:'20px'});
    const x=b('Quote',root);style(x,{background:'#f7f8fc',color:'#ffffff'});return finish(type,x);
  }
  case'cta':{
    const btn=makeButton('Начать');style(btn,{background:'#ffffff',color:'#5142d7',boxShadow:'0 12px 28px rgba(21,19,66,.22)'});
    const root=container([style(makeText('ГОТОВЫ?'),{fontSize:'12px',fontWeight:'850',letterSpacing:'.12em',color:'#ddd7ff'}),makeHeading('Соберите страницу и запустите её сегодня',2),style(makeText('Все основные настройки уже внутри конструктора.'),{color:'#ece9ff'}),btn],{gap:17,align:'center'});style(root,{maxWidth:'760px',margin:'0 auto',textAlign:'center'});
    const x=b('CTA',root);style(x,{background:'radial-gradient(circle at 15% 20%,rgba(255,255,255,.17),transparent 22%),linear-gradient(135deg,#6754ee,#8b5cf6 58%,#df68b5)',color:'#fff',paddingTop:'78px',paddingBottom:'78px'},{paddingTop:'64px',paddingBottom:'64px'},{paddingTop:'48px',paddingBottom:'48px'});return finish(type,x);
  }
  case'contact':{
    const socials=makeSocial();style(socials,{paddingTop:'4px'});
    const root=container([kicker('КОНТАКТЫ'),makeHeading('Свяжитесь с нами',2),muted('hello@example.com · +994 00 000 00 00'),socials],{gap:16});style(root,{padding:'30px',border:'1px solid #e4e7ec',borderRadius:'24px',background:'linear-gradient(135deg,#ffffff,#f8f6ff)',boxShadow:'0 18px 48px rgba(15,23,42,.07)'},{padding:'26px'},{padding:'22px',borderRadius:'18px'});
    const x=b('Contact',root);style(x,{background:'#ffffff'});return finish(type,x);
  }
  case'footer':{
    const logo=makeLogo('NOVA'),social=makeSocial();style(logo,{color:'#fff'});style(social,{color:'#c7d0e2'});
    const root=container([logo,style(makeText('© 2026. Все права защищены.'),{color:'#9ea9bf'}),social],{direction:'row',justify:'space-between',align:'center',gap:16});root.style.mobile.flexDirection='column';root.style.mobile.alignItems='flex-start';
    const x=b('Footer',root);style(x,{background:'linear-gradient(180deg,#111827,#090f1a)',color:'#fff',paddingTop:'34px',paddingBottom:'34px',borderTop:'1px solid #25304a'},{paddingTop:'30px',paddingBottom:'30px'},{paddingTop:'28px',paddingBottom:'28px'});return finish(type,x);
  }
  case'faq':{
    const acc=makeAccordion();const x=b('FAQ',container([kicker('FAQ'),makeHeading('Частые вопросы',2),muted('Короткие ответы на вопросы, которые обычно возникают перед решением.'),acc],{gap:18}));style(x,{background:'#f8f9fc'});return finish(type,x);
  }
  case'stats':{
    const values=[['98%','метрика'],['24/7','поддержка'],['3×','рост']];const cards=values.map(([v,l],i)=>{const c=container([style(makeHeading(v,2),{color:i===1?'#705cff':'#111827'}),style(makeText(l),{color:'#667085',fontWeight:'650'})],{gap:6});return cardify(c,i===1)});
    const grid=container(cards,{gap:14});grid.style.base.display='grid';grid.style.base.gridTemplateColumns='repeat(3,minmax(0,1fr))';grid.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.mobile.gridTemplateColumns='1fr';
    const x=b('Stats',container([kicker('ЦИФРЫ'),makeHeading('Результаты, которые видно',2),grid],{gap:18}));style(x,{background:'#ffffff'});return finish(type,x);
  }
  case'testimonials':{
    const cards=[1,2,3].map(i=>{const c=container([style(makeText('★★★★★'),{color:'#f5a623',letterSpacing:'.08em'}),style(makeText(`Отзыв клиента ${i}. Здесь можно оставить короткое и убедительное подтверждение качества.`),{color:'#4b5565'}),makeHeading(`Клиент ${i}`,3)],{gap:10});return cardify(c)});
    const grid=container(cards,{gap:14});grid.style.base.display='grid';grid.style.base.gridTemplateColumns='repeat(3,minmax(0,1fr))';grid.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.mobile.gridTemplateColumns='1fr';
    const x=b('Testimonials',container([kicker('ОТЗЫВЫ'),makeHeading('Что говорят клиенты',2),grid],{gap:18}));style(x,{background:'#f8f9fc'});return finish(type,x);
  }
  case'pricing':{
    const cards=[['Start','49'],['Pro','99'],['Plan 3','147']].map(([n,p],i)=>{const btn=makeButton(i===1?'Выбрать Pro':'Выбрать');if(i!==1)btn.props.variant='outline';const c=container([style(makeText(i===1?'ПОПУЛЯРНЫЙ':'ТАРИФ'),{fontSize:'11px',fontWeight:'850',letterSpacing:'.1em',color:i===1?'#705cff':'#98a2b3'}),makeHeading(n,3),makeHeading(`${p} ₼`,2),muted('Краткое описание тарифа и его ключевого преимущества.'),btn],{gap:14});return cardify(c,i===1)});
    const grid=container(cards,{gap:16});grid.style.base.display='grid';grid.style.base.gridTemplateColumns='repeat(3,minmax(0,1fr))';grid.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.mobile.gridTemplateColumns='1fr';
    const x=b('Pricing',container([kicker('ТАРИФЫ'),makeHeading('Простой выбор без перегруза',2),grid],{gap:20}));style(x,{background:'#ffffff'});return finish(type,x);
  }
  case'logos':{
    const items=['LOGO 1','LOGO 2','LOGO 3','LOGO 4'].map(x=>style(makeLogo(x,''),{minHeight:'74px',justifyContent:'center',padding:'14px',border:'1px solid #e5e8f0',borderRadius:'16px',background:'#ffffff',color:'#667085',boxShadow:'0 8px 24px rgba(15,23,42,.05)'}));const grid=container(items,{gap:14,align:'center'});grid.style.base.display='grid';grid.style.base.gridTemplateColumns='repeat(4,minmax(0,1fr))';grid.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';grid.style.mobile.gridTemplateColumns='repeat(2,minmax(0,1fr))';const x=b('Logos',grid);style(x,{background:'#f8f9fc'});return finish(type,x);
  }
  case'layout1':return finish(type,b('Container',container([],{})));
  case'layout2':{const r=container([container(),container()],{gap:20});r.style.base.display='grid';r.style.base.gridTemplateColumns='1fr 1fr';r.style.mobile.gridTemplateColumns='1fr';return finish(type,b('2 Columns',r))}
  case'layout3':{const r=container([container(),container(),container()],{gap:20});r.style.base.display='grid';r.style.base.gridTemplateColumns='repeat(3,minmax(0,1fr))';r.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';r.style.mobile.gridTemplateColumns='1fr';return finish(type,b('3 Columns',r))}
  case'layout4':{const r=container([container(),container(),container(),container()],{gap:20});r.style.base.display='grid';r.style.base.gridTemplateColumns='repeat(4,minmax(0,1fr))';r.style.tablet.gridTemplateColumns='repeat(2,minmax(0,1fr))';r.style.mobile.gridTemplateColumns='1fr';return finish(type,b('4 Columns',r))}
  default:return finish(type,b('Section',container()))
  }
}
