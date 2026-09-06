const icon=(name)=>({
  search:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  undo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 8 5 12l4 4"/><path d="M5 12h8a6 6 0 0 1 6 6"/></svg>',
  redo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 8 4 4-4 4"/><path d="M19 12h-8a6 6 0 0 0-6 6"/></svg>',
  plus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  eye:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  download:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v10"/><path d="m8 10 4 4 4-4"/><path d="M5 19h14"/></svg>',
  layers:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4-8 4 8 4 8-4-8-4Z"/><path d="m4 12 8 4 8-4M4 16l8 4 8-4"/></svg>',
  settings:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.5 1A7 7 0 0 0 14.3 5L14 2h-4l-.3 3a7 7 0 0 0-2.1 1.8l-2.5-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.5-1A7 7 0 0 0 9.7 19l.3 3h4l.3-3a7 7 0 0 0 2.1-1.8l2.5 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z"/></svg>',
  grid:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
  page:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5"/></svg>',
  navigator:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h13M7 12h13M7 19h13"/><circle cx="4" cy="5" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="19" r="1"/></svg>',
  monitor:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M9 21h6M12 17v4"/></svg>',
  tablet:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/></svg>',
  mobile:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="2.5" width="8" height="19" rx="2"/><path d="M11 18.5h2"/></svg>',
  hash:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3 7 21M17 3l-2 18M4 9h16M3 15h16"/></svg>'
}[name]||'');

const COPY={
  ru:{command:'Команды',placeholder:'Найти действие…',empty:'Ничего не найдено',navigate:'↑↓ выбрать',run:'Enter выполнить',close:'Esc закрыть',page:'Текущая страница',saved:'Сохранено локально',saving:'Сохранение…',blocks:'Блоки',elements:'Элементы',pages:'Страницы',navigator:'Навигатор',preview:'Предпросмотр',download:'Скачать сайт',theme:'Сменить тему',desktop:'Desktop',tablet:'Tablet',mobile:'Mobile',newProject:'Новый проект',settings:'Настройки'},
  az:{command:'Əmrlər',placeholder:'Əməliyyat axtar…',empty:'Nəticə yoxdur',navigate:'↑↓ seç',run:'Enter icra et',close:'Esc bağla',page:'Cari səhifə',saved:'Lokal yadda saxlanıb',saving:'Yadda saxlanır…',blocks:'Bloklar',elements:'Elementlər',pages:'Səhifələr',navigator:'Naviqator',preview:'Ön baxış',download:'Saytı yüklə',theme:'Mövzunu dəyiş',desktop:'Desktop',tablet:'Tablet',mobile:'Mobile',newProject:'Yeni layihə',settings:'Parametrlər'},
  en:{command:'Commands',placeholder:'Search an action…',empty:'No matching actions',navigate:'↑↓ navigate',run:'Enter run',close:'Esc close',page:'Current page',saved:'Saved locally',saving:'Saving…',blocks:'Blocks',elements:'Elements',pages:'Pages',navigator:'Navigator',preview:'Preview',download:'Download site',theme:'Switch theme',desktop:'Desktop',tablet:'Tablet',mobile:'Mobile',newProject:'New project',settings:'Settings'}
};

const lang=()=>String(document.querySelector('#uiLanguage')?.value||document.documentElement.lang||'en').slice(0,2);
const t=(key)=>COPY[lang()]?.[key]||COPY.en[key]||key;
const click=(sel)=>document.querySelector(sel)?.click();
const openLeft=()=>{if(document.body.classList.contains('left-collapsed'))click('#leftToggle')};
const openRight=()=>{if(document.body.classList.contains('right-collapsed'))click('#rightToggle')};

function ensureUiGuards(){
  let style=document.querySelector('#premiumEditorUiGuards');
  if(!style){
    style=document.createElement('style');style.id='premiumEditorUiGuards';
    style.textContent='@media(max-width:430px){html[data-editor-premium="2"] body .sidebar{width:88vw!important;max-width:88vw!important}}html[data-builder-theme="light"][data-editor-premium="2"] .tabs button{color:#47556c!important}html[data-builder-theme="light"][data-editor-premium="2"] .tabs button.active{color:#33266d!important}';
    document.head.append(style);
  }
}

function replaceButtonIcon(selector,name){
  const el=document.querySelector(selector);if(!el||el.dataset.premiumIcon==='1')return;
  el.dataset.premiumIcon='1';
  const legacy=el.id==='leftToggle'?'☰':el.id==='rightToggle'?'⚙':'';
  const hidden=legacy?`<span aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap">${legacy}</span>`:'';
  el.innerHTML=hidden+icon(name);
}

function enhanceIcons(){
  replaceButtonIcon('#undoBtn','undo');replaceButtonIcon('#redoBtn','redo');replaceButtonIcon('#newBtn','plus');replaceButtonIcon('#previewBtn','eye');replaceButtonIcon('#downloadBtn','download');replaceButtonIcon('#leftToggle','layers');replaceButtonIcon('#rightToggle','settings');replaceButtonIcon('#guidesBtn','hash');
  const devices={desktop:'monitor',tablet:'tablet',mobile:'mobile'};
  for(const [device,name] of Object.entries(devices))replaceButtonIcon(`[data-device="${device}"]`,name);
}

function ensureContext(){
  const brand=document.querySelector('.brand'),top=document.querySelector('.topbar');if(!brand||!top)return;
  let ctx=document.querySelector('#editorContext');
  if(!ctx){
    ctx=document.createElement('div');ctx.id='editorContext';ctx.className='editor-context';ctx.setAttribute('aria-live','polite');
    ctx.innerHTML='<span class="editor-context-dot" aria-hidden="true"></span><span class="editor-context-copy"><span class="editor-context-page"></span><span class="editor-context-status"></span></span>';
    brand.after(ctx);
  }
  const sync=()=>{
    const page=(document.querySelector('#pageLabel')?.textContent||t('page')).trim();
    const status=(document.querySelector('#saveStatus')?.textContent||t('saved')).trim();
    ctx.querySelector('.editor-context-page').textContent=page;
    ctx.querySelector('.editor-context-status').textContent=status;
    ctx.classList.toggle('is-saving',/saving|сохран|saxlan/i.test(status)&&!/saved|сохранено|saxlanıb/i.test(status));
    ctx.classList.toggle('is-error',/error|ошиб|xəta/i.test(status));
  };
  sync();
  if(!ctx.dataset.bound){
    ctx.dataset.bound='1';
    const obs=new MutationObserver(sync);const page=document.querySelector('#pageLabel'),save=document.querySelector('#saveStatus');
    if(page)obs.observe(page,{childList:true,subtree:true,characterData:true});if(save)obs.observe(save,{childList:true,subtree:true,characterData:true});
  }
}

function actions(){
  return [
    {id:'blocks',title:t('blocks'),desc:'Premium library',icon:'layers',run:()=>{openLeft();click('#blocksTab')}},
    {id:'elements',title:t('elements'),desc:'Headings, media, controls',icon:'grid',run:()=>{openLeft();click('#elementsTab')}},
    {id:'pages',title:t('pages'),desc:'Page manager',icon:'page',run:()=>{openLeft();click('#pagesTab')}},
    {id:'navigator',title:t('navigator'),desc:'Page tree',icon:'navigator',run:()=>{openLeft();click('#navigatorTab')}},
    {id:'settings',title:t('settings'),desc:'Inspector',icon:'settings',run:()=>openRight()},
    {id:'preview',title:t('preview'),desc:'Open website preview',icon:'eye',run:()=>click('#previewBtn')},
    {id:'download',title:t('download'),desc:'Export production ZIP',icon:'download',run:()=>click('#downloadBtn')},
    {id:'theme',title:t('theme'),desc:'Dark / light',icon:'settings',run:()=>click('#themeToggle')},
    {id:'desktop',title:t('desktop'),desc:'Canvas device',icon:'monitor',run:()=>click('[data-device="desktop"]')},
    {id:'tablet',title:t('tablet'),desc:'Canvas device',icon:'tablet',run:()=>click('[data-device="tablet"]')},
    {id:'mobile',title:t('mobile'),desc:'Canvas device',icon:'mobile',run:()=>click('[data-device="mobile"]')},
    {id:'new',title:t('newProject'),desc:'Create a blank project',icon:'plus',run:()=>click('#newBtn')}
  ];
}

function ensureCommandPalette(){
  let dlg=document.querySelector('#commandPalette');
  if(!dlg){
    dlg=document.createElement('dialog');dlg.id='commandPalette';dlg.className='command-palette';
    dlg.innerHTML=`<div class="command-shell"><div class="command-search-wrap">${icon('search')}<input id="commandSearch" autocomplete="off" spellcheck="false"></div><div class="command-results" id="commandResults"></div><div class="command-footer"><span class="command-kbd"><kbd>↑</kbd><kbd>↓</kbd> <span data-command-copy="navigate"></span></span><span class="command-kbd"><kbd>Enter</kbd> <span data-command-copy="run"></span></span><span class="command-kbd"><kbd>Esc</kbd> <span data-command-copy="close"></span></span></div></div>`;
    document.body.append(dlg);
  }
  let btn=document.querySelector('#commandBtn');
  if(!btn){
    btn=document.createElement('button');btn.id='commandBtn';btn.type='button';btn.className='icon-action command-button';btn.setAttribute('aria-haspopup','dialog');
    btn.innerHTML=icon('search');
    document.querySelector('#previewBtn')?.before(btn);
  }
  const localize=()=>{
    btn.title=t('command');btn.setAttribute('aria-label',t('command'));
    const input=dlg.querySelector('#commandSearch');if(input)input.placeholder=t('placeholder');
    dlg.querySelectorAll('[data-command-copy]').forEach(el=>el.textContent=t(el.dataset.commandCopy));
  };
  localize();
  if(dlg.dataset.bound==='1')return dlg;
  dlg.dataset.bound='1';
  const input=dlg.querySelector('#commandSearch'),results=dlg.querySelector('#commandResults');let active=0,filtered=[];
  const render=()=>{
    const q=String(input.value||'').trim().toLowerCase();
    filtered=actions().filter(a=>`${a.title} ${a.desc} ${a.id}`.toLowerCase().includes(q));
    active=Math.min(active,Math.max(0,filtered.length-1));
    results.innerHTML=filtered.length?filtered.map((a,i)=>`<button class="command-item${i===active?' is-active':''}" type="button" data-command-id="${a.id}"><span class="command-item-icon">${icon(a.icon)}</span><span class="command-item-copy"><span class="command-item-title">${a.title}</span><span class="command-item-desc">${a.desc}</span></span><span class="command-item-key">${i===active?'↵':''}</span></button>`).join(''):`<div class="command-empty">${t('empty')}</div>`;
  };
  const run=(id)=>{const action=actions().find(a=>a.id===id);if(!action)return;dlg.close();action.run()};
  const open=()=>{localize();input.value='';active=0;render();if(!dlg.open)dlg.showModal();requestAnimationFrame(()=>input.focus())};
  btn.addEventListener('click',open);
  input.addEventListener('input',()=>{active=0;render()});
  results.addEventListener('mousemove',e=>{const row=e.target.closest?.('[data-command-id]');if(!row)return;const idx=filtered.findIndex(a=>a.id===row.dataset.commandId);if(idx>=0&&idx!==active){active=idx;render()}});
  results.addEventListener('click',e=>{const row=e.target.closest?.('[data-command-id]');if(row)run(row.dataset.commandId)});
  dlg.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();if(filtered.length){active=(active+1)%filtered.length;render()}}
    else if(e.key==='ArrowUp'){e.preventDefault();if(filtered.length){active=(active-1+filtered.length)%filtered.length;render()}}
    else if(e.key==='Enter'&&filtered[active]){e.preventDefault();run(filtered[active].id)}
  });
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}
  });
  document.querySelector('#uiLanguage')?.addEventListener('change',()=>setTimeout(()=>{localize();if(dlg.open)render()},0));
  return dlg;
}

function boot(){
  document.documentElement.dataset.editorPremium='2';
  ensureUiGuards();enhanceIcons();ensureContext();ensureCommandPalette();
  window.addEventListener('pageshow',()=>setTimeout(()=>{ensureUiGuards();enhanceIcons();ensureContext();ensureCommandPalette()},0));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
