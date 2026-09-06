import {PREMIUM_BLOCK_META} from './v6-premium-blocks.mjs';
const names={
  premiumHeroSaas:['Первый экран · продукт','İlk ekran · məhsul','Hero · Product'],premiumHeroShowcase:['Первый экран · студия','İlk ekran · studiya','Hero · Studio'],
  premiumBento:['Возможности · Bento','İmkanlar · Bento','Features · Bento'],premiumMediaSplit:['История · видео','Hekayə · video','Story · Video'],premiumMediaMosaic:['Портфолио · мозаика','Portfolio · mozaika','Portfolio · Mosaic'],
  premiumLogoCloud:['Клиенты · логотипы','Müştərilər · loqolar','Clients · Logos'],premiumStatsBand:['Результаты · цифры','Nəticələr · rəqəmlər','Results · Metrics'],premiumTestimonialSpotlight:['Отзывы · история','Rəylər · hekayə','Reviews · Story'],
  premiumPricing:['Тарифы · сравнение','Tariflər · müqayisə','Pricing · Compare'],premiumFaqSplit:['Вопросы · ответы','Suallar · cavablar','Questions · Answers'],premiumContactConversion:['Контакты · заявка','Əlaqə · müraciət','Contact · Enquiry'],premiumCtaBanner:['Призыв · действие','Çağırış · fəaliyyət','Call to action'],
  navbar:['Меню','Menyu','Navigation'],footer:['Подвал','Alt bölmə','Footer'],imageText:['Карточки · фото и текст','Kartlar · şəkil və mətn','Cards · Image + Text'],gallery:['Галерея','Qalereya','Gallery'],text:['Редакционный текст','Redaksiya mətni','Editorial text'],
  form:['Форма заявки','Müraciət forması','Enquiry form'],videoSection:['Видео','Video','Video'],embedSection:['Встроенный контент','Daxili məzmun','Embed'],socialSection:['Социальные сети','Sosial şəbəkələr','Social links'],mapSection:['Карта и адрес','Xəritə və ünvan','Map & address'],reviewsSlider:['Слайдер отзывов','Rəy slayderi','Reviews slider'],tabsSection:['Вкладки','Tablar','Tabs'],accordionSection:['Аккордеон','Akkordeon','Accordion'],floatingContact:['WhatsApp / Telegram','WhatsApp / Telegram','WhatsApp / Telegram'],
  layout1:['Одна колонка','Bir sütun','One column'],layout2:['Две колонки','İki sütun','Two columns'],layout3:['Три колонки','Üç sütun','Three columns'],layout4:['Четыре колонки','Dörd sütun','Four columns']
};
const descriptions={
 hero:['Крупный заголовок, медиа и две кнопки.','Böyük başlıq, media və iki düymə.','Large headline, media and two actions.'],features:['Асимметричная сетка преимуществ.','Üstünlüklərin asimmetrik şəbəkəsi.','Asymmetric feature composition.'],media:['Адаптивная композиция для медиа.','Media üçün adaptiv kompozisiya.','Responsive media composition.'],trust:['Компактные доказательства доверия.','Etibar üçün yığcam məlumatlar.','Compact evidence and social proof.'],'social-proof':['История клиента с отзывами.','Müştəri hekayəsi və rəyləri.','A customer story with reviews.'],commerce:['Три тарифа с выделенным предложением.','Seçilmiş təkliflə üç tarif.','Three plans with a featured offer.'],content:['Вопросы рядом с кратким вступлением.','Qısa giriş və suallar.','Questions beside a short introduction.'],conversion:['Контекст и понятное следующее действие.','Kontekst və aydın növbəti addım.','Context and a clear next action.']
};
const idx=lang=>lang==='ru'?0:lang==='az'?1:2;
export function catalogCopy(lang){const i=idx(lang);return{empty:['Ничего не найдено. Измените запрос или фильтр.','Nəticə yoxdur. Axtarışı və ya filtri dəyişin.','No matches. Try another search or filter.'][i],favorite:['В избранное','Seçilmişlərə əlavə et','Add to favorites'][i],unfavorite:['Убрать из избранного','Seçilmişlərdən çıxar','Remove from favorites'][i]}}
export function catalogMeta(type,lang='en'){
 const meta=PREMIUM_BLOCK_META[type],labels=names[type]||[type,type,type],family=meta?.family||({navbar:'navigation',footer:'footer',imageText:'cards',gallery:'media',text:'content'}[type]||'utility');
 return{name:labels[idx(lang)],description:meta?descriptions[family]?.[idx(lang)]||meta.description:'',family,premium:!!meta,keywords:[...labels,meta?.name||'',meta?.description||'',family].join(' ')};
}
const elements={heading:['Заголовок','Başlıq'],text:['Текст','Mətn'],image:['Изображение','Şəkil'],button:['Кнопка','Düymə'],divider:['Разделитель','Ayırıcı'],spacer:['Отступ','Boşluq'],icon:['Иконка','İkon'],list:['Список','Siyahı'],video:['Видео','Video'],embed:['Встраивание','Daxil etmə'],social:['Соцсети','Sosial şəbəkələr'],logo:['Логотип','Loqo'],table:['Таблица','Cədvəl'],map:['Карта','Xəritə'],counter:['Счётчик','Sayğac'],accordion:['Аккордеон','Akkordeon'],tabs:['Вкладки','Tablar'],form:['Форма','Forma'],reviews:['Отзывы','Rəylər'],html:['HTML','HTML'],container:['Контейнер','Konteyner']};
export const elementTitle=(type,lang)=>elements[type]?.[idx(lang)]||type[0].toUpperCase()+type.slice(1);
// Small schematic compositions: no iframe, network request or executable content per card.
export function catalogThumbnail(type,family='utility'){
 const r=(x,y,w,h,fill='#dce2ed',rx=3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
 const ink='#26354c',accent='#7162dd',soft='#e8e4fa';let body='';
 if(family==='hero')body=r(10,15,28,3,accent)+r(10,26,64,6,ink)+r(10,37,52,6,ink)+r(10,51,61,3)+r(10,58,49,3)+r(10,70,30,10,accent)+r(45,70,28,10)+r(90,15,60,67,soft)+r(98,28,44,29,'#c7bfea')+r(98,64,27,4,'#9c90ce');
 else if(family==='features')body=r(10,12,95,5,ink)+r(10,28,91,26,soft)+r(108,28,42,26)+r(10,61,42,26)+r(59,61,91,26,soft);
 else if(family==='commerce')body=r(34,12,90,5,ink)+[10,59,108].map((x,i)=>r(x,30,42,56,i===1?soft:'#e9edf3')+r(x+7,39,22,4,ink)+r(x+7,50,27,8,i===1?accent:ink)+r(x+7,72,28,7,accent)).join('');
 else if(family==='navigation'||family==='footer')body=r(10,20,28,7,ink)+r(75,22,17,3)+r(99,22,17,3)+r(125,19,26,10,accent)+(family==='footer'?r(10,43,72,3)+r(10,51,54,3)+r(10,75,140,1):r(10,43,140,42,soft));
 else if(family==='content')body=r(10,17,49,6,ink)+r(10,29,42,3)+[15,38,61].map(y=>r(78,y,72,17)+r(84,y+7,47,3,ink)).join('');
 else if(family==='trust')body=r(40,15,80,4,ink)+[10,47,84,121].map(x=>r(x,39,29,14,soft)+r(x,64,29,3)).join('');
 else if(family==='conversion')body=r(10,18,62,6,ink)+r(10,30,52,6,ink)+r(10,47,56,3)+r(10,66,40,11,accent)+r(88,16,62,64,soft)+[27,42,57].map(y=>r(96,y,46,7,'#fff')).join('');
 else body=r(10,12,79,5,ink)+[10,59,108].map(x=>r(x,29,42,34,soft)+r(x,70,36,3)+r(x,77,25,3)).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 96" aria-hidden="true" focusable="false">${r(0,0,160,96,'#f8f9fc',6)}${body}</svg>`;
}
