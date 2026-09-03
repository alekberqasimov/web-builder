const DB_NAME = 'web-builder-db';
const DB_STORE = 'projects';
const DB_KEY = 'current-project-v2';
const LEGACY_KEY = 'web-builder-project-v1';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const clone = value => JSON.parse(JSON.stringify(value));
const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const i18n = {
  ru:{newProject:'Новый проект',preview:'Предпросмотр',downloadSite:'Скачать сайт',blocks:'Блоки',pages:'Страницы',findBlock:'Найти блок',all:'Все',main:'Основные',content:'Контент',dragHint:'Перетащи блок на холст или нажми на него.',addPage:'＋ Создать страницу',pagesHint:'Главная отмечена звездой. Меню автоматически получает ссылки на все страницы.',menu:'☰ Меню',saved:'Сохранено локально',saving:'Сохранение…',settings:'Настройки ⚙',inspector:'Инспектор',block:'Блок',page:'Страница',selectBlock:'Выбери блок на холсте, чтобы изменить его оформление.',blockType:'Тип блока',background:'Фон',textColor:'Цвет текста',padding:'Внутренний отступ',contentWidth:'Ширина контента',narrow:'Узкая',standard:'Стандартная',wide:'Широкая',alignment:'Выравнивание',left:'Слева',center:'По центру',right:'Справа',image:'Изображение',imageInBlock:'Изображение в блоке',uploadImage:'Загрузить изображение',altText:'Описание ALT',imageFit:'Заполнение',removeImage:'Удалить изображение',duplicate:'Копировать',delete:'Удалить',pageName:'Название страницы',pageSlug:'Адрес страницы',pageLanguage:'Язык страницы',setHome:'Сделать главной',duplicatePage:'Дублировать страницу',deletePage:'Удалить страницу',hideSearch:'Скрыть от поисковых систем',siteUrl:'Адрес опубликованного сайта',siteName:'Название сайта',project:'Проект',saveProject:'Сохранить проект',openProject:'Открыть проект',newPage:'Новая страница',cancel:'Отмена',create:'Создать',move:'Переместить',up:'Выше',down:'Ниже',empty:'Сначала добавьте блок',zipReady:'ZIP готов',projectOpened:'Проект открыт',badProject:'Неверный файл проекта',pageExists:'Такой адрес страницы уже существует',lastPage:'Нельзя удалить единственную страницу',imageTooLarge:'Изображение больше 8 MB',blocksNames:{navbar:'Меню',hero:'Главный экран',features:'Преимущества',text:'Текст',split:'Текст + фото',gallery:'Галерея',quote:'Цитата',cta:'Призыв',contact:'Контакты',footer:'Подвал'}},
  az:{newProject:'Yeni layihə',preview:'Ön baxış',downloadSite:'Saytı yüklə',blocks:'Bloklar',pages:'Səhifələr',findBlock:'Blok axtar',all:'Hamısı',main:'Əsas',content:'Məzmun',dragHint:'Bloku iş sahəsinə daşı və ya üzərinə kliklə.',addPage:'＋ Səhifə yarat',pagesHint:'Əsas səhifə ulduzla işarələnir. Menyu bütün səhifələrə keçid yaradır.',menu:'☰ Menyu',saved:'Lokal saxlanılıb',saving:'Saxlanılır…',settings:'Tənzimləmələr ⚙',inspector:'İnspektor',block:'Blok',page:'Səhifə',selectBlock:'Dizaynı dəyişmək üçün blok seç.',blockType:'Blok növü',background:'Fon',textColor:'Mətn rəngi',padding:'Daxili boşluq',contentWidth:'Məzmun eni',narrow:'Dar',standard:'Standart',wide:'Geniş',alignment:'Düzülüş',left:'Sol',center:'Mərkəz',right:'Sağ',image:'Şəkil',imageInBlock:'Blokdakı şəkil',uploadImage:'Şəkil yüklə',altText:'ALT təsviri',imageFit:'Doldurma',removeImage:'Şəkli sil',duplicate:'Kopyala',delete:'Sil',pageName:'Səhifə adı',pageSlug:'Səhifə ünvanı',pageLanguage:'Səhifə dili',setHome:'Əsas səhifə et',duplicatePage:'Səhifəni kopyala',deletePage:'Səhifəni sil',hideSearch:'Axtarış sistemlərindən gizlət',siteUrl:'Dərc edilmiş saytın ünvanı',siteName:'Saytın adı',project:'Layihə',saveProject:'Layihəni saxla',openProject:'Layihəni aç',newPage:'Yeni səhifə',cancel:'Ləğv et',create:'Yarat',move:'Daşı',up:'Yuxarı',down:'Aşağı',empty:'Əvvəlcə blok əlavə et',zipReady:'ZIP hazırdır',projectOpened:'Layihə açıldı',badProject:'Yanlış layihə faylı',pageExists:'Bu səhifə ünvanı artıq mövcuddur',lastPage:'Yeganə səhifəni silmək olmaz',imageTooLarge:'Şəkil 8 MB-dan böyükdür',blocksNames:{navbar:'Menyu',hero:'Baş ekran',features:'Üstünlüklər',text:'Mətn',split:'Mətn + şəkil',gallery:'Qalereya',quote:'Sitat',cta:'Çağırış',contact:'Əlaqə',footer:'Alt hissə'}},
  en:{newProject:'New project',preview:'Preview',downloadSite:'Download site',blocks:'Blocks',pages:'Pages',findBlock:'Find a block',all:'All',main:'Main',content:'Content',dragHint:'Drag a block onto the canvas or click it.',addPage:'＋ Create page',pagesHint:'The homepage has a star. Navigation automatically links to every page.',menu:'☰ Menu',saved:'Saved locally',saving:'Saving…',settings:'Settings ⚙',inspector:'Inspector',block:'Block',page:'Page',selectBlock:'Select a canvas block to change its design.',blockType:'Block type',background:'Background',textColor:'Text color',padding:'Inner spacing',contentWidth:'Content width',narrow:'Narrow',standard:'Standard',wide:'Wide',alignment:'Alignment',left:'Left',center:'Center',right:'Right',image:'Image',imageInBlock:'Image in block',uploadImage:'Upload image',altText:'ALT description',imageFit:'Image fit',removeImage:'Remove image',duplicate:'Duplicate',delete:'Delete',pageName:'Page name',pageSlug:'Page address',pageLanguage:'Page language',setHome:'Set as homepage',duplicatePage:'Duplicate page',deletePage:'Delete page',hideSearch:'Hide from search engines',siteUrl:'Published site URL',siteName:'Site name',project:'Project',saveProject:'Save project',openProject:'Open project',newPage:'New page',cancel:'Cancel',create:'Create',move:'Move',up:'Move up',down:'Move down',empty:'Add a block first',zipReady:'ZIP is ready',projectOpened:'Project opened',badProject:'Invalid project file',pageExists:'This page address already exists',lastPage:'The only page cannot be deleted',imageTooLarge:'Image is larger than 8 MB',blocksNames:{navbar:'Navigation',hero:'Hero',features:'Features',text:'Text',split:'Text + image',gallery:'Gallery',quote:'Quote',cta:'Call to action',contact:'Contact',footer:'Footer'}}
};

const placeholderSvg = label => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="650"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#705cff"/><stop offset=".55" stop-color="#df66b4"/><stop offset="1" stop-color="#ffba67"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="720" cy="80" r="170" fill="none" stroke="#fff" opacity=".28"/><circle cx="190" cy="520" r="110" fill="#fff" opacity=".12"/><text x="50%" y="52%" text-anchor="middle" font-family="Arial" font-size="32" fill="white">${label}</text></svg>`)}`;

const templates = {
  navbar:{icon:'☰',category:'main',html:`<div class="nav-row"><div class="logo-text" contenteditable="true">NOVA</div><nav class="nav-links auto-page-nav"></nav><a class="web-btn" href="#" contenteditable="true">Начать</a></div>`,style:{bg:'#ffffff',color:'#111827',padding:24,width:1120,align:'left'}},
  hero:{icon:'✦',category:'main',html:`<div class="hero-grid"><div><div class="kicker" contenteditable="true">НОВОЕ ПОКОЛЕНИЕ САЙТОВ</div><h1 contenteditable="true">Создавай смело. Запускай быстро.</h1><p contenteditable="true">Профессиональный сайт без сложного кода — собери страницу из готовых блоков.</p><a class="web-btn" href="#" contenteditable="true">Начать проект</a></div><img class="editable-image" src="${placeholderSvg('YOUR IMAGE')}" alt="Главное изображение" data-default="true"></div>`,style:{bg:'#f7f6ff',color:'#17142b',padding:86,width:1120,align:'left'}},
  features:{icon:'▦',category:'content',html:`<div class="kicker" contenteditable="true">ПОЧЕМУ МЫ</div><h2 contenteditable="true">Всё необходимое для сильного старта</h2><div class="feature-grid"><div class="feature-card"><div class="feature-icon">01</div><h3 contenteditable="true">Быстрый запуск</h3><p contenteditable="true">Соберите страницу за несколько минут.</p></div><div class="feature-card"><div class="feature-icon">02</div><h3 contenteditable="true">Адаптивный дизайн</h3><p contenteditable="true">Отличный вид на любом устройстве.</p></div><div class="feature-card"><div class="feature-icon">03</div><h3 contenteditable="true">Полный контроль</h3><p contenteditable="true">Скачайте код и разместите где угодно.</p></div></div>`,style:{bg:'#ffffff',color:'#111827',padding:76,width:1120,align:'left'}},
  text:{icon:'¶',category:'content',html:`<div class="kicker" contenteditable="true">НАША ИСТОРИЯ</div><h2 contenteditable="true">Простая идея, сильный результат</h2><p contenteditable="true">Нажмите на любой текст и начните редактирование. Все изменения сохраняются в вашем браузере.</p>`,style:{bg:'#f2f4f8',color:'#172033',padding:72,width:880,align:'left'}},
  split:{icon:'◧',category:'content',html:`<div class="split-grid"><img class="editable-image" src="${placeholderSvg('YOUR IMAGE')}" alt="Изображение секции" data-default="true"><div><div class="kicker" contenteditable="true">О ПРОЕКТЕ</div><h2 contenteditable="true">Дизайн, который работает</h2><p contenteditable="true">Расскажите о продукте понятным языком и покажите его главное преимущество.</p><a class="web-btn" href="#" contenteditable="true">Подробнее</a></div></div>`,style:{bg:'#ffffff',color:'#111827',padding:78,width:1120,align:'left'}},
  gallery:{icon:'▦',category:'content',html:`<div class="kicker" contenteditable="true">ГАЛЕРЕЯ</div><h2 contenteditable="true">Наши работы</h2><div class="gallery-grid"><img class="editable-image" src="${placeholderSvg('IMAGE 1')}" alt="Галерея 1" data-default="true"><img class="editable-image" src="${placeholderSvg('IMAGE 2')}" alt="Галерея 2" data-default="true"><img class="editable-image" src="${placeholderSvg('IMAGE 3')}" alt="Галерея 3" data-default="true"></div>`,style:{bg:'#ffffff',color:'#111827',padding:74,width:1120,align:'left'}},
  quote:{icon:'“',category:'content',html:`<p class="quote" contenteditable="true">«Хороший сайт не просто выглядит красиво — он ясно ведёт человека к нужному действию».</p><div class="kicker" contenteditable="true">— ВАША КОМАНДА</div>`,style:{bg:'#18152c',color:'#ffffff',padding:86,width:880,align:'center'}},
  cta:{icon:'→',category:'main',html:`<div class="kicker" contenteditable="true">ГОТОВЫ НАЧАТЬ?</div><h2 contenteditable="true">Превратите идею в работающий сайт</h2><p contenteditable="true">Создайте страницу, скачайте её и загрузите на любой хостинг.</p><a class="web-btn" href="#" contenteditable="true">Создать сейчас</a>`,style:{bg:'#705cff',color:'#ffffff',padding:78,width:880,align:'center'}},
  contact:{icon:'✉',category:'main',html:`<div class="contact-grid"><div><div class="kicker" contenteditable="true">СВЯЗАТЬСЯ</div><h2 contenteditable="true">Давайте обсудим проект</h2><p contenteditable="true">Оставьте сообщение — мы ответим в ближайшее время.</p></div><form class="contact-form"><input placeholder="Ваше имя"><input type="email" placeholder="Email"><textarea placeholder="Сообщение"></textarea><button class="web-btn" type="button">Отправить</button></form></div>`,style:{bg:'#f5f6fa',color:'#111827',padding:76,width:1120,align:'left'}},
  footer:{icon:'▬',category:'main',html:`<div class="footer-row"><div><div class="logo-text" contenteditable="true">NOVA</div><small contenteditable="true">© 2026. Все права защищены.</small></div><nav class="nav-links auto-page-nav"></nav></div>`,style:{bg:'#0d1020',color:'#ffffff',padding:46,width:1120,align:'left'}}
};

const SITE_CSS = `*{box-sizing:border-box}html,body{margin:0;font-family:Inter,Arial,sans-serif;color:#111827}section{position:relative}.section-content{max-width:1120px;margin:auto;padding:64px 28px;min-height:80px}.section-content h1{font-size:clamp(42px,6vw,76px);letter-spacing:-.05em;line-height:1.02;margin:0 0 20px}.section-content h2{font-size:clamp(29px,4vw,46px);letter-spacing:-.035em;line-height:1.1;margin:0 0 18px}.section-content p{font-size:18px;line-height:1.65;margin:0 0 22px;opacity:.78}.kicker{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.14em;opacity:.7}.web-btn{display:inline-block;padding:13px 20px;border-radius:9px;text-decoration:none;color:#fff;background:#705cff;font-weight:800;border:0}.hero-grid,.feature-grid,.contact-grid{display:grid;gap:30px;align-items:center}.hero-grid{grid-template-columns:1.15fr .85fr}.feature-grid{grid-template-columns:repeat(3,1fr);align-items:stretch}.feature-card{padding:28px;border:1px solid #dfe3ec;border-radius:16px;background:#fff;color:#111827}.feature-icon{width:42px;height:42px;border-radius:11px;display:grid;place-items:center;background:#eeeaff;color:#6652d9;font-weight:900;margin-bottom:17px}.feature-card h3{margin:0 0 10px;font-size:20px}.feature-card p{font-size:15px;margin:0}.split-grid{display:grid;grid-template-columns:1fr 1fr;gap:45px;align-items:center}.editable-image{display:block;width:100%;height:100%;min-height:300px;object-fit:cover;border-radius:20px;background:#dfe4ee}.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.gallery-grid .editable-image{min-height:230px}.quote{font-size:clamp(25px,3vw,40px)!important;line-height:1.35!important}.contact-grid{grid-template-columns:.8fr 1.2fr}.contact-form{display:grid;gap:11px}.contact-form input,.contact-form textarea{width:100%;padding:14px;border:1px solid #d9deea;border-radius:9px;background:#fff;color:#111}.contact-form textarea{min-height:110px}.nav-row,.footer-row{display:flex;align-items:center;justify-content:space-between;gap:20px}.nav-links{display:flex;gap:20px;font-size:14px;flex-wrap:wrap}.nav-links a{color:inherit;text-decoration:none}.logo-text{font-size:20px;font-weight:900}@media(max-width:760px){.section-content{padding-left:22px!important;padding-right:22px!important}.hero-grid,.feature-grid,.split-grid,.contact-grid,.gallery-grid{grid-template-columns:1fr}.nav-row,.footer-row{align-items:flex-start}.nav-links{gap:10px}.editable-image{min-height:220px}.section-content h1{font-size:40px}}`;

const state = {project:null, selected:null, selectedImage:0, history:[], future:[], draggedSection:null, uiLang:'ru'};
const canvas = $('#canvas');
const frame = $('#canvasFrame');
const toast = $('#toast');

function makeSection(type){const t=templates[type];return{id:uid('section'),type,html:t.html,style:clone(t.style)}}
function defaultPage(name='Главная',lang='ru',home=true){return{id:uid('page'),name,slug:home?'':uniqueSlug(slugify(name)||'page'),lang,home,seo:{title:name,description:'',keywords:'',ogTitle:'',ogDescription:'',ogImage:'',noindex:false},sections:['navbar','hero','features','cta','footer'].map(makeSection)}}
function defaultProject(){return{version:2,name:'My Website',siteUrl:'',pages:[defaultPage()]}}
function currentPage(){return state.project.pages.find(page=>page.id===state.project.currentPageId)||state.project.pages[0]}
function currentSections(){return currentPage().sections}
function findSection(id){return currentSections().find(section=>section.id===id)}
function tr(key){return i18n[state.uiLang]?.[key]||i18n.ru[key]||key}

function openDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open(DB_NAME,1);request.onupgradeneeded=()=>request.result.createObjectStore(DB_STORE);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function dbGet(){try{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly'),request=tx.objectStore(DB_STORE).get(DB_KEY);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}catch{return null}}
async function dbPut(value){try{const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(value,DB_KEY);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}catch(error){console.warn('IndexedDB save failed',error)}}

let commitTimer;
function commit(){
  $('#saveStatus').textContent=tr('saving');
  clearTimeout(commitTimer);
  commitTimer=setTimeout(async()=>{await dbPut(state.project);localStorage.setItem('web-builder-ui-language',state.uiLang);$('#saveStatus').textContent=tr('saved')},220);
}
function snapshot(){state.history.push(JSON.stringify(state.project));if(state.history.length>25)state.history.shift();state.future=[];updateHistoryButtons()}
function mutate(fn){snapshot();fn();commit();renderAll()}

function applyI18n(){
  document.documentElement.lang=state.uiLang;$('#uiLanguage').value=state.uiLang;
  $$('[data-i18n]').forEach(el=>{const value=tr(el.dataset.i18n);if(value)el.textContent=value});
  $$('[data-i18n-placeholder]').forEach(el=>el.placeholder=tr(el.dataset.i18nPlaceholder));
  renderLibrary();renderPages();updateInspector();
}
function blockName(type){return i18n[state.uiLang].blocksNames[type]||type}
function renderLibrary(){
  const q=$('#blockSearch').value.toLowerCase(),cat=$('#categoryTabs .active')?.dataset.category||'all';
  $('#blockList').innerHTML=Object.entries(templates).filter(([key,t])=>(cat==='all'||t.category===cat)&&blockName(key).toLowerCase().includes(q)).map(([key,t])=>`<button class="block-card" draggable="true" data-template="${key}"><span class="block-icon">${t.icon}</span><strong>${escapeHtml(blockName(key))}</strong><small>${escapeHtml(tr('move'))}</small></button>`).join('');
  $$('.block-card').forEach(el=>{el.onclick=()=>addSection(el.dataset.template);el.ondragstart=e=>{e.dataTransfer.setData('template',el.dataset.template);e.dataTransfer.effectAllowed='copy'}});
}
function renderPages(){
  const active=currentPage();
  $('#pageList').innerHTML=state.project.pages.map(page=>`<div class="page-item ${page.id===active.id?'active':''}" data-page-id="${page.id}"><div><strong>${page.home?'<span class="page-badge">★</span> ':''}${escapeHtml(page.name)}</strong><small>/${page.home?'':escapeHtml(page.slug+'.html')} · ${page.lang.toUpperCase()}</small></div><div class="page-actions"><button data-page-action="duplicate" title="${escapeHtml(tr('duplicate'))}">⧉</button>${state.project.pages.length>1?`<button data-page-action="delete" title="${escapeHtml(tr('delete'))}">×</button>`:''}</div></div>`).join('');
  $$('.page-item').forEach(el=>{el.onclick=e=>{const action=e.target.closest('[data-page-action]')?.dataset.pageAction;if(action==='duplicate')return duplicatePage(el.dataset.pageId);if(action==='delete')return deletePage(el.dataset.pageId);switchPage(el.dataset.pageId)}});
  $('#currentPageLabel').textContent=`${active.name} · ${active.lang.toUpperCase()}`;
}
function renderCanvas(){
  const sections=currentSections();canvas.classList.toggle('empty',!sections.length);
  canvas.innerHTML=sections.map(section=>`<section class="site-section ${section.id===state.selected?'selected':''}" data-id="${section.id}" draggable="true" style="background:${section.style.bg};color:${section.style.color};text-align:${section.style.align}"><div class="section-toolbar" contenteditable="false"><button class="section-drag" title="${escapeHtml(tr('move'))}">↕</button><button data-act="up" title="${escapeHtml(tr('up'))}">↑</button><button data-act="down" title="${escapeHtml(tr('down'))}">↓</button><button data-act="duplicate" title="${escapeHtml(tr('duplicate'))}">⧉</button><button data-act="delete" title="${escapeHtml(tr('delete'))}">×</button></div><div class="section-content" style="padding-top:${section.style.padding}px;padding-bottom:${section.style.padding}px;max-width:${section.style.width}px">${section.html}</div></section>`).join('');
  hydrateAutoNavigation(canvas,true);bindCanvas();updateInspector();updateHistoryButtons();
}
function renderAll(){renderPages();renderCanvas();updatePageInspector();updateSeoInspector()}

function hydrateAutoNavigation(root,editor=false){
  root.querySelectorAll('.auto-page-nav').forEach(nav=>{nav.innerHTML=state.project.pages.map(page=>`<a href="${editor?'#':pageFile(page)}" ${editor?`data-page-id="${page.id}"`:''}>${escapeHtml(page.name)}</a>`).join('')});
}
function bindCanvas(){
  $$('.site-section').forEach(el=>{
    el.onclick=e=>{
      const action=e.target.closest('[data-act]')?.dataset.act;
      if(action==='delete')return deleteSection(el.dataset.id);
      if(action==='duplicate')return duplicateSection(el.dataset.id);
      if(action==='up')return moveSection(el.dataset.id,-1);
      if(action==='down')return moveSection(el.dataset.id,1);
      state.selected=el.dataset.id;
      if(e.target.matches('.editable-image'))state.selectedImage=[...el.querySelectorAll('.editable-image')].indexOf(e.target);
      renderSelectionOnly();
    };
    el.ondragstart=e=>{if(e.target.closest('[contenteditable=true]')||e.pointerType==='touch'){e.preventDefault();return}state.draggedSection=el.dataset.id;e.dataTransfer.setData('section',el.dataset.id);setTimeout(()=>el.classList.add('dragging'))};
    el.ondragend=()=>{state.draggedSection=null;el.classList.remove('dragging');removeMarkers()};
    bindTouchDrag(el);
  });
  $$('[contenteditable=true]').forEach(el=>{el.onfocus=()=>{state.selected=el.closest('.site-section').dataset.id;renderSelectionOnly()};el.oninput=debounce(()=>syncSectionHtml(el.closest('.site-section')),180);el.ondragstart=e=>e.stopPropagation()});
  $$('.auto-page-nav a').forEach(link=>link.onclick=e=>{e.preventDefault();e.stopPropagation();switchPage(link.dataset.pageId)});
  $$('.web-btn[href="#"]').forEach(link=>link.onclick=e=>e.preventDefault());
}
function syncSectionHtml(sectionEl){const section=findSection(sectionEl.dataset.id),copy=sectionEl.querySelector('.section-content').cloneNode(true);copy.querySelectorAll('.auto-page-nav').forEach(nav=>nav.innerHTML='');section.html=copy.innerHTML;commit()}
function renderSelectionOnly(){$$('.site-section').forEach(el=>el.classList.toggle('selected',el.dataset.id===state.selected));updateInspector();if(innerWidth<760)$$('.sidebar').forEach(sidebar=>sidebar.classList.remove('open'))}

function bindTouchDrag(sectionEl){
  const handle=sectionEl.querySelector('.section-drag');let dragging=false,startOrder='';
  handle.onpointerdown=e=>{if(e.pointerType==='mouse')return;e.preventDefault();dragging=true;startOrder=currentSections().map(s=>s.id).join(',');sectionEl.classList.add('touch-dragging');handle.setPointerCapture(e.pointerId)};
  handle.onpointermove=e=>{if(!dragging)return;e.preventDefault();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('.site-section');if(!target||target===sectionEl)return;const rect=target.getBoundingClientRect();target.parentNode.insertBefore(sectionEl,e.clientY<rect.top+rect.height/2?target:target.nextSibling)};
  const finish=e=>{if(!dragging)return;dragging=false;sectionEl.classList.remove('touch-dragging');const order=$$('.site-section').map(el=>el.dataset.id);if(order.join(',')!==startOrder){snapshot();const byId=new Map(currentSections().map(s=>[s.id,s]));currentPage().sections=order.map(id=>byId.get(id));commit();renderCanvas()}try{handle.releasePointerCapture(e.pointerId)}catch{}};
  handle.onpointerup=finish;handle.onpointercancel=finish;
}

function addSection(type,index=currentSections().length){snapshot();const item=makeSection(type);currentSections().splice(index,0,item);state.selected=item.id;state.selectedImage=0;commit();renderAll();setTimeout(()=>document.querySelector(`[data-id="${item.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),30)}
function deleteSection(id){mutate(()=>{const sections=currentSections(),index=sections.findIndex(s=>s.id===id);sections.splice(index,1);state.selected=sections[Math.max(0,index-1)]?.id||null})}
function duplicateSection(id){mutate(()=>{const sections=currentSections(),index=sections.findIndex(s=>s.id===id),copy=clone(sections[index]);copy.id=uid('section');sections.splice(index+1,0,copy);state.selected=copy.id})}
function moveSection(id,direction){const sections=currentSections(),index=sections.findIndex(s=>s.id===id),next=index+direction;if(next<0||next>=sections.length)return;mutate(()=>{[sections[index],sections[next]]=[sections[next],sections[index]];state.selected=id})}

function switchPage(id){if(!state.project.pages.some(page=>page.id===id))return;state.project.currentPageId=id;state.selected=null;state.selectedImage=0;commit();renderAll();if(innerWidth<760)$$('.sidebar').forEach(x=>x.classList.remove('open'))}
function createPage(name,lang){const slug=uniqueSlug(slugify(name)||`page-${state.project.pages.length+1}`),page=defaultPage(name,lang,false);page.slug=slug;state.project.pages.push(page);state.project.currentPageId=page.id;state.selected=null}
function duplicatePage(id){mutate(()=>{const source=state.project.pages.find(page=>page.id===id),copy=clone(source);copy.id=uid('page');copy.name=`${source.name} Copy`;copy.slug=uniqueSlug(`${source.slug||'home'}-copy`);copy.home=false;copy.sections.forEach(section=>section.id=uid('section'));state.project.pages.push(copy);state.project.currentPageId=copy.id;state.selected=null})}
function deletePage(id){if(state.project.pages.length===1)return notify(tr('lastPage'));mutate(()=>{const index=state.project.pages.findIndex(page=>page.id===id),wasHome=state.project.pages[index].home;state.project.pages.splice(index,1);if(wasHome)state.project.pages[0].home=true;state.project.currentPageId=state.project.pages[Math.max(0,index-1)].id;state.selected=null})}
function setHome(id){
  const oldHome=state.project.pages.find(page=>page.home);
  if(oldHome&&oldHome.id!==id)oldHome.slug=uniqueSlug(slugify(oldHome.name)||'home',oldHome.id);
  state.project.pages.forEach(page=>page.home=page.id===id);
  const newHome=state.project.pages.find(page=>page.id===id);
  if(newHome)newHome.slug='';
  commit();renderAll();
}
function uniqueSlug(value,currentId=null){let base=slugify(value)||'page',candidate=base,n=2;while(state.project?.pages?.some(page=>page.id!==currentId&&page.slug===candidate)){candidate=`${base}-${n++}`}return candidate}
function slugify(value){const map={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sh','ы':'y','э':'e','ю':'yu','я':'ya','ə':'e','ı':'i','ö':'o','ü':'u','ğ':'g','ş':'s','ç':'c'};return value.toLowerCase().split('').map(c=>map[c]??c).join('').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)}

function updateInspector(){
  const section=findSection(state.selected),has=!!section;$('#emptyInspector').classList.toggle('hidden',has);$('#inspector').classList.toggle('hidden',!has);if(!section)return;
  $('#sectionType').value=blockName(section.type);$('#backgroundColor').value=toHex(section.style.bg);$('#backgroundText').value=section.style.bg;$('#textColor').value=toHex(section.style.color);$('#textColorText').value=section.style.color;$('#paddingRange').value=section.style.padding;$('#paddingValue').value=`${section.style.padding} px`;$('#contentWidth').value=String(section.style.width);$('#textAlign').value=section.style.align;updateImageInspector(section);
}
function updateImageInspector(section){
  const box=document.createElement('div');box.innerHTML=section.html;const images=[...box.querySelectorAll('.editable-image')];$('#imageControls').classList.toggle('hidden',!images.length);if(!images.length)return;
  state.selectedImage=Math.min(state.selectedImage,images.length-1);$('#imageTarget').innerHTML=images.map((img,i)=>`<option value="${i}">${tr('image')} ${i+1}</option>`).join('');$('#imageTarget').value=String(state.selectedImage);const image=images[state.selectedImage];$('#imageAlt').value=image.alt||'';$('#imageFit').value=image.style.objectFit||'cover';
}
function updatePageInspector(){const page=currentPage();$('#pageName').value=page.name;$('#pageSlug').value=page.home?'':page.slug;$('#pageSlug').disabled=page.home;$('#pageLanguage').value=page.lang;$('#pageHome').checked=page.home;$('#deletePageBtn').disabled=state.project.pages.length===1}
function updateSeoInspector(){const page=currentPage(),seo=page.seo;$('#seoTitle').value=seo.title||'';$('#seoDescription').value=seo.description||'';$('#seoKeywords').value=seo.keywords||'';$('#ogTitle').value=seo.ogTitle||'';$('#ogDescription').value=seo.ogDescription||'';$('#ogImage').value=seo.ogImage||'';$('#seoNoindex').checked=!!seo.noindex;$('#siteUrl').value=state.project.siteUrl||'';$('#siteName').value=state.project.name||'';updateSeoCounts()}
function updateStyle(key,value){const section=findSection(state.selected);if(!section)return;section.style[key]=value;const el=document.querySelector(`[data-id="${section.id}"]`);if(key==='bg')el.style.background=value;if(key==='color')el.style.color=value;if(key==='align')el.style.textAlign=value;if(key==='padding'){const content=el.querySelector('.section-content');content.style.paddingTop=content.style.paddingBottom=`${value}px`}if(key==='width')el.querySelector('.section-content').style.maxWidth=`${value}px`;commit()}
function toHex(value){return /^#[0-9a-f]{6}$/i.test(value)?value:'#ffffff'}

function mutateImage(mutator){const section=findSection(state.selected);if(!section)return;const box=document.createElement('div');box.innerHTML=section.html;const images=box.querySelectorAll('.editable-image'),image=images[state.selectedImage];if(!image)return;snapshot();mutator(image);section.html=box.innerHTML;commit();renderCanvas()}
function uploadImage(file){if(!file)return;if(file.size>8*1024*1024)return notify(tr('imageTooLarge'));const reader=new FileReader();reader.onload=()=>mutateImage(image=>{image.src=reader.result;image.removeAttribute('data-default')});reader.readAsDataURL(file)}
function resetImage(){mutateImage(image=>{image.src=placeholderSvg('YOUR IMAGE');image.dataset.default='true'})}

function setInspectorTab(name){$$('#inspectorTabs button').forEach(button=>button.classList.toggle('active',button.dataset.inspector===name));$('#blockInspectorPanel').classList.toggle('hidden',name!=='block');$('#pageInspectorPanel').classList.toggle('hidden',name!=='page');$('#seoInspectorPanel').classList.toggle('hidden',name!=='seo')}
function setMajorPanel(name){$$('#majorTabs button').forEach(button=>button.classList.toggle('active',button.dataset.panel===name));$('#blocksPanel').classList.toggle('hidden',name!=='blocks');$('#pagesPanel').classList.toggle('hidden',name!=='pages');$('#leftPanelTitle').textContent=tr(name)}
function updateHistoryButtons(){$('#undoBtn').disabled=!state.history.length;$('#redoBtn').disabled=!state.future.length}
function undo(){if(!state.history.length)return;state.future.push(JSON.stringify(state.project));state.project=JSON.parse(state.history.pop());state.selected=null;commit();renderAll()}
function redo(){if(!state.future.length)return;state.history.push(JSON.stringify(state.project));state.project=JSON.parse(state.future.pop());state.selected=null;commit();renderAll()}

function removeMarkers(){$$('.drop-marker').forEach(marker=>marker.remove())}
function dropIndexFromY(y){const elements=$$('.site-section:not(.dragging)');for(let i=0;i<elements.length;i++){const rect=elements[i].getBoundingClientRect();if(y<rect.top+rect.height/2)return currentSections().findIndex(s=>s.id===elements[i].dataset.id)}return currentSections().length}
canvas.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect=state.draggedSection?'move':'copy';removeMarkers();const index=dropIndexFromY(e.clientY),marker=document.createElement('div');marker.className='drop-marker';const sections=$$('.site-section:not(.dragging)');sections[index]?canvas.insertBefore(marker,sections[index]):canvas.appendChild(marker)};
canvas.ondragleave=e=>{if(!canvas.contains(e.relatedTarget))removeMarkers()};
canvas.ondrop=e=>{e.preventDefault();removeMarkers();let index=dropIndexFromY(e.clientY);const type=e.dataTransfer.getData('template'),id=e.dataTransfer.getData('section');if(type)return addSection(type,index);if(id){const sections=currentSections(),old=sections.findIndex(s=>s.id===id);if(old<0)return;snapshot();const [item]=sections.splice(old,1);if(old<index)index--;sections.splice(Math.max(0,index),0,item);state.selected=id;commit();renderCanvas()}};

function cleanSectionHtml(section){
  const box=document.createElement('div');box.innerHTML=section.html;box.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));box.querySelectorAll('[data-default=true]').forEach(el=>el.removeAttribute('data-default'));hydrateAutoNavigation(box,false);box.querySelectorAll('form').forEach(form=>form.setAttribute('action','#'));return box.innerHTML;
}
function pageFile(page){return page.home?'index.html':`${page.slug}.html`}
function absolutePageUrl(page){const base=(state.project.siteUrl||'').replace(/\/$/,'');return base?`${base}/${pageFile(page)}`:''}
function exportedDocument(page){
  const seo=page.seo,url=absolutePageUrl(page),sections=page.sections.map(section=>`<section style="background:${escapeAttr(section.style.bg)};color:${escapeAttr(section.style.color)};text-align:${escapeAttr(section.style.align)}"><div class="section-content" style="padding-top:${section.style.padding}px;padding-bottom:${section.style.padding}px;max-width:${section.style.width}px">${cleanSectionHtml(section)}</div></section>`).join('\n');
  return `<!doctype html><html lang="${escapeAttr(page.lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(seo.title||page.name)}</title>${seo.description?`<meta name="description" content="${escapeAttr(seo.description)}">`:''}${seo.keywords?`<meta name="keywords" content="${escapeAttr(seo.keywords)}">`:''}<meta name="robots" content="${seo.noindex?'noindex,nofollow':'index,follow'}"><meta property="og:type" content="website"><meta property="og:title" content="${escapeAttr(seo.ogTitle||seo.title||page.name)}"><meta property="og:description" content="${escapeAttr(seo.ogDescription||seo.description||'')}">${seo.ogImage?`<meta property="og:image" content="${escapeAttr(seo.ogImage)}">`:''}${url?`<link rel="canonical" href="${escapeAttr(url)}"><meta property="og:url" content="${escapeAttr(url)}">`:''}<style>${SITE_CSS}</style></head><body>${sections}<script>document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>e.preventDefault()));<\/script></body></html>`;
}
function preview(){const page=currentPage();if(!page.sections.length)return notify(tr('empty'));const popup=open('','_blank');if(!popup)return notify('Allow pop-ups');popup.document.open();popup.document.write(exportedDocument(page));popup.document.close()}
async function downloadSite(){
  if(!state.project.pages.some(page=>page.sections.length))return notify(tr('empty'));if(!window.JSZip){downloadBlob(new Blob([exportedDocument(currentPage())],{type:'text/html'}),pageFile(currentPage()));return}
  const zip=new JSZip();state.project.pages.forEach(page=>zip.file(pageFile(page),exportedDocument(page)));zip.file('robots.txt',robotsText());zip.file('sitemap.xml',sitemapXml());zip.file('README.txt','Upload all files from this folder to your server or hosting. Open index.html to view the homepage.');const blob=await zip.generateAsync({type:'blob'});downloadBlob(blob,`${slugify(state.project.name)||'website'}.zip`);notify(tr('zipReady'));
}
function robotsText(){const sitemap=state.project.siteUrl?`\nSitemap: ${state.project.siteUrl.replace(/\/$/,'')}/sitemap.xml`:'';return`User-agent: *\n${state.project.pages.every(p=>p.seo.noindex)?'Disallow: /':'Allow: /'}${sitemap}\n`}
function sitemapXml(){const pages=state.project.pages.filter(page=>!page.seo.noindex),base=(state.project.siteUrl||'https://example.com').replace(/\/$/,'');return`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(page=>`  <url><loc>${escapeHtml(`${base}/${pageFile(page)}`)}</loc></url>`).join('\n')}\n</urlset>`}
function exportProject(){downloadBlob(new Blob([JSON.stringify(state.project,null,2)],{type:'application/json'}),`${slugify(state.project.name)||'web-builder'}-project.json`)}
function downloadBlob(blob,name){const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000)}

function bindUi(){
  $('#blockSearch').oninput=renderLibrary;$('#categoryTabs').onclick=e=>{const button=e.target.closest('button');if(!button)return;$$('#categoryTabs button').forEach(item=>item.classList.toggle('active',item===button));renderLibrary()};
  $('#majorTabs').onclick=e=>{const button=e.target.closest('button');if(button)setMajorPanel(button.dataset.panel)};$('#inspectorTabs').onclick=e=>{const button=e.target.closest('button');if(button)setInspectorTab(button.dataset.inspector)};
  $$('[data-device]').forEach(button=>button.onclick=()=>{$$('[data-device]').forEach(item=>item.classList.toggle('active',item===button));frame.className=`canvas-frame ${button.dataset.device}`});
  $('#uiLanguage').onchange=e=>{state.uiLang=e.target.value;applyI18n();commit()};$('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;$('#previewBtn').onclick=preview;$('#downloadBtn').onclick=downloadSite;
  $('#newBtn').onclick=()=>{if(confirm('Create a new project?')){snapshot();state.project=defaultProject();state.project.currentPageId=state.project.pages[0].id;state.selected=null;commit();renderAll()}};
  $('#duplicateBtn').onclick=()=>duplicateSection(state.selected);$('#deleteBtn').onclick=()=>deleteSection(state.selected);$('#exportProjectBtn').onclick=exportProject;
  $('#addPageBtn').onclick=()=>{$('#newPageName').value=state.uiLang==='az'?'Yeni səhifə':state.uiLang==='en'?'New page':'Новая страница';$('#newPageLanguage').value=state.uiLang;$('#pageDialog').showModal()};
  $('#pageDialogForm').onsubmit=e=>{e.preventDefault();if(e.submitter?.value==='cancel'){ $('#pageDialog').close();return }snapshot();createPage($('#newPageName').value.trim()||tr('newPage'),$('#newPageLanguage').value);commit();renderAll();$('#pageDialog').close()};
  $('#duplicatePageBtn').onclick=()=>duplicatePage(currentPage().id);$('#deletePageBtn').onclick=()=>deletePage(currentPage().id);$('#pageHome').onchange=e=>{if(e.target.checked)setHome(currentPage().id)};
  $('#pageName').onchange=e=>{const page=currentPage();snapshot();page.name=e.target.value.trim()||'Page';if(!page.home)page.slug=uniqueSlug(page.slug||page.name,page.id);page.seo.title=page.seo.title||page.name;commit();renderAll()};
  $('#pageSlug').onchange=e=>{const page=currentPage(),slug=uniqueSlug(e.target.value,page.id);snapshot();page.slug=slug;e.target.value=slug;commit();renderPages()};$('#pageLanguage').onchange=e=>{snapshot();currentPage().lang=e.target.value;commit();renderPages()};
  [['backgroundColor','bg'],['backgroundText','bg'],['textColor','color'],['textColorText','color'],['textAlign','align'],['contentWidth','width']].forEach(([id,key])=>$('#'+id).oninput=e=>{updateStyle(key,key==='width'?Number(e.target.value):e.target.value);if(id==='backgroundColor')$('#backgroundText').value=e.target.value;if(id==='textColor')$('#textColorText').value=e.target.value});
  $('#paddingRange').oninput=e=>{$('#paddingValue').value=`${e.target.value} px`;updateStyle('padding',Number(e.target.value))};$('#imageTarget').onchange=e=>{state.selectedImage=Number(e.target.value);updateInspector()};$('#imageInput').onchange=e=>{uploadImage(e.target.files[0]);e.target.value=''};$('#imageAlt').onchange=e=>mutateImage(image=>image.alt=e.target.value);$('#imageFit').onchange=e=>mutateImage(image=>image.style.objectFit=e.target.value);$('#removeImageBtn').onclick=resetImage;
  const seoMap={seoTitle:'title',seoDescription:'description',seoKeywords:'keywords',ogTitle:'ogTitle',ogDescription:'ogDescription',ogImage:'ogImage'};Object.entries(seoMap).forEach(([id,key])=>$('#'+id).oninput=e=>{currentPage().seo[key]=e.target.value;updateSeoCounts();commit()});$('#seoNoindex').onchange=e=>{currentPage().seo.noindex=e.target.checked;commit()};$('#siteUrl').oninput=e=>{state.project.siteUrl=e.target.value;commit()};$('#siteName').oninput=e=>{state.project.name=e.target.value;commit()};
  $('#importProjectInput').onchange=async e=>{try{const project=JSON.parse(await e.target.files[0].text());if(project.version!==2||!Array.isArray(project.pages)||!project.pages.length)throw Error();snapshot();state.project=project;state.project.currentPageId=project.currentPageId||project.pages[0].id;state.selected=null;commit();renderAll();notify(tr('projectOpened'))}catch{notify(tr('badProject'))}e.target.value=''};
  $$('[data-open-panel]').forEach(button=>button.onclick=()=>document.querySelector(`.${button.dataset.openPanel}-sidebar`).classList.add('open'));$$('[data-close-panel]').forEach(button=>button.onclick=()=>button.closest('.sidebar').classList.remove('open'));
  document.onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}if(e.key==='Delete'&&state.selected&&!document.activeElement.matches('input,textarea,[contenteditable=true]'))deleteSection(state.selected)};
}
function updateSeoCounts(){$('#seoTitleCount').textContent=`${$('#seoTitle').value.length}/70`;$('#seoDescriptionCount').textContent=`${$('#seoDescription').value.length}/170`}
function debounce(fn,ms){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),ms)}}
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2200)}
function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}
function escapeAttr(value=''){return escapeHtml(value)}

async function boot(){
  state.uiLang=localStorage.getItem('web-builder-ui-language')||'ru';state.project=await dbGet();
  if(!state.project){try{const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY));if(Array.isArray(legacy)){state.project=defaultProject();state.project.pages[0].sections=legacy}}catch{}}
  if(!state.project)state.project=defaultProject();state.project.currentPageId=state.project.currentPageId||state.project.pages[0].id;
  bindUi();applyI18n();renderAll();commit();
}
boot();
