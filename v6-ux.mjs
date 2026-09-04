import {state} from './v5-runtime.mjs';
import {renderNavigator} from './v5-library.mjs';

const COMPACT_QUERY='(max-width:1100px)';
const compactMq=matchMedia(COMPACT_QUERY);
const PIN_KEYS={left:'wb:v6:leftPinned',right:'wb:v6:rightPinned'};

const labels={
  ru:{navigator:'Навигатор',pageTree:'Дерево страницы',pin:'Закрепить панель',unpin:'Открепить панель',close:'Закрыть панель'},
  az:{navigator:'Naviqator',pageTree:'Səhifə ağacı',pin:'Paneli bərkit',unpin:'Paneli ayır',close:'Paneli bağla'},
  en:{navigator:'Navigator',pageTree:'Page tree',pin:'Pin panel',unpin:'Unpin panel',close:'Close panel'}
};

function uiLang(){return state.project?.uiLang||document.documentElement.lang||'ru'}
function t(key){const lang=uiLang().slice(0,2);return labels[lang]?.[key]||labels.en[key]||key}
function readPinned(side){const v=localStorage.getItem(PIN_KEYS[side]);return v===null?true:v!=='0'}
function writePinned(side,value){localStorage.setItem(PIN_KEYS[side],value?'1':'0')}

function pinButton(side){
  const sidebar=document.querySelector(`#${side}Sidebar`);
  if(!sidebar)return null;
  let button=sidebar.querySelector(`[data-panel-pin="${side}"]`);
  if(button)return button;
  const head=sidebar.querySelector('.sidebar-head');
  if(!head)return null;
  let actions=head.querySelector('.sidebar-head-actions');
  if(!actions){
    actions=document.createElement('div');
    actions.className='sidebar-head-actions';
    const close=head.querySelector('.sidebar-close');
    if(close)actions.append(close);
    head.append(actions);
  }
  button=document.createElement('button');
  button.type='button';
  button.className='panel-pin';
  button.dataset.panelPin=side;
  button.innerHTML='<span class="pin-glyph" aria-hidden="true">◆</span>';
  actions.prepend(button);
  return button;
}

function applyPinState(){
  for(const side of ['left','right']){
    const pinned=readPinned(side);
    document.body.classList.toggle(`${side}-unpinned`,!pinned&&!compactMq.matches);
    const button=pinButton(side);
    if(button){
      button.setAttribute('aria-pressed',String(pinned));
      button.setAttribute('aria-label',pinned?t('unpin'):t('pin'));
      button.title=pinned?t('unpin'):t('pin');
    }
  }
}

function togglePin(side){
  const next=!readPinned(side);
  writePinned(side,next);
  applyPinState();
}

function ensureNavigatorMode(){
  const tabs=document.querySelector('.left-tabs');
  const scroll=document.querySelector('#leftSidebar .panel-scroll');
  const wrap=scroll?.querySelector('.navigator-wrap');
  if(!tabs||!scroll||!wrap)return;

  let tab=document.querySelector('#navigatorTab');
  if(!tab){
    tab=document.createElement('button');
    tab.id='navigatorTab';
    tab.type='button';
    tab.textContent=t('navigator');
    tabs.append(tab);
  }

  let panel=document.querySelector('#navigatorPanel');
  if(!panel){
    panel=document.createElement('section');
    panel.id='navigatorPanel';
    panel.className='hidden';
    scroll.append(panel);
    panel.append(wrap);
  }

  const title=wrap.querySelector('.navigator-title');
  if(title){
    const spans=title.querySelectorAll('span');
    if(spans[0])spans[0].textContent=t('navigator');
    if(spans[1])spans[1].textContent=t('pageTree');
  }

  if(!tab.dataset.bound){
    tab.dataset.bound='1';
    tab.addEventListener('click',()=>{
      state.activeLeft='navigator';
      try{renderNavigator()}catch{}
      if(typeof state.render==='function')state.render();
      queueMicrotask(syncNavigatorMode);
    });
  }
}

function syncNavigatorMode(){
  ensureNavigatorMode();
  const navActive=state.activeLeft==='navigator';
  const panel=document.querySelector('#navigatorPanel');
  const tab=document.querySelector('#navigatorTab');
  panel?.classList.toggle('hidden',!navActive);
  tab?.classList.toggle('active',navActive);

  if(navActive){
    for(const id of ['blocksPanel','elementsPanel','pagesPanel'])document.querySelector(`#${id}`)?.classList.add('hidden');
    for(const id of ['blocksTab','elementsTab','pagesTab'])document.querySelector(`#${id}`)?.classList.remove('active');
    const title=document.querySelector('#leftTitle');
    if(title)title.textContent=t('navigator');
  }
}

function localizeUx(){
  const tab=document.querySelector('#navigatorTab');
  if(tab)tab.textContent=t('navigator');
  const wrap=document.querySelector('#navigatorPanel .navigator-wrap');
  const title=wrap?.querySelector('.navigator-title');
  if(title){
    const spans=title.querySelectorAll('span');
    if(spans[0])spans[0].textContent=t('navigator');
    if(spans[1])spans[1].textContent=t('pageTree');
  }
  document.querySelectorAll('.sidebar-close').forEach(btn=>{btn.title=t('close')});
  applyPinState();
  syncNavigatorMode();
}

function bindUx(){
  ensureNavigatorMode();
  pinButton('left');
  pinButton('right');
  applyPinState();
  syncNavigatorMode();

  document.addEventListener('click',e=>{
    const pin=e.target.closest?.('[data-panel-pin]');
    if(pin){e.preventDefault();e.stopPropagation();togglePin(pin.dataset.panelPin);return}
    if(e.target.closest?.('#blocksTab,#elementsTab,#pagesTab'))queueMicrotask(syncNavigatorMode);
  },true);

  document.querySelector('#uiLanguage')?.addEventListener('change',()=>queueMicrotask(localizeUx));
  compactMq.addEventListener?.('change',()=>applyPinState());

  const left=document.querySelector('#leftSidebar');
  if(left)new MutationObserver(()=>queueMicrotask(syncNavigatorMode)).observe(left,{childList:true,subtree:true});
  const htmlObserver=new MutationObserver(()=>queueMicrotask(localizeUx));
  htmlObserver.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});

  queueMicrotask(localizeUx);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindUx,{once:true});
else bindUx();

export {readPinned,writePinned,applyPinState,syncNavigatorMode};
