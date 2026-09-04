import {state,mutate,clearSelection} from './v5-runtime.mjs';
import {addPage,addPageTranslation,ensureSiteLanguageConfig,siteLanguages,defaultSiteLanguage,switchProjectLanguage,linkedPage,pagesForLanguage,addSiteLanguage,removeSiteLanguage,setDefaultSiteLanguage,normalizeLanguageCode,languageLabel,uniqueSlug,setHome} from './v5-model.mjs';

const COPY={
  ru:{siteLang:'Язык сайта',languages:'Языки сайта',default:'Основной',pages:'страниц',add:'Добавить язык',translations:'Связанные переводы',open:'Открыть',create:'Создать',missing:'нет версии',code:'Код',name:'Название',remove:'Удалить',newPage:'Новая страница',pageName:'Название страницы',deleteLang:'Удалить язык и все его страницы?',hint:'Это язык содержимого сайта. Язык интерфейса Web Builder меняется отдельно сверху.'},
  az:{siteLang:'Sayt dili',languages:'Sayt dilləri',default:'Əsas',pages:'səhifə',add:'Dil əlavə et',translations:'Bağlı tərcümələr',open:'Aç',create:'Yarat',missing:'versiya yoxdur',code:'Kod',name:'Ad',remove:'Sil',newPage:'Yeni səhifə',pageName:'Səhifə adı',deleteLang:'Dili və onun bütün səhifələrini sil?',hint:'Bu sayt məzmununun dilidir. Web Builder interfeys dili yuxarıda ayrıca dəyişir.'},
  en:{siteLang:'Site language',languages:'Site languages',default:'Default',pages:'pages',add:'Add language',translations:'Linked translations',open:'Open',create:'Create',missing:'missing',code:'Code',name:'Name',remove:'Remove',newPage:'New page',pageName:'Page name',deleteLang:'Remove this language and all of its pages?',hint:'This controls website content language. The Web Builder interface language is separate.'}
};
let scheduled=false,observer=null;
const $=s=>document.querySelector(s);
function t(k){const lang=(state.project?.uiLang||'en').slice(0,2);return COPY[lang]?.[k]||COPY.en[k]||k}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function projectReady(){return !!state.project}

function ensureStyle(){if($('#v6SiteLanguageStyle'))return;const s=document.createElement('style');s.id='v6SiteLanguageStyle';s.textContent=`
.site-language-bar{margin:0 0 10px;padding:9px;border:1px solid #2d3b58;border-radius:13px;background:linear-gradient(180deg,#151f35,#0c1424);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.site-language-bar .sl-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.site-language-bar .sl-head strong{font-size:10px;color:#b7c2dc;text-transform:uppercase;letter-spacing:.05em}.site-language-bar .sl-head small{color:#8170ff;font-size:9px;font-weight:800}
.site-language-bar select{width:100%;height:38px;border:1px solid #394865;border-radius:10px;background:#09111f;color:#fff;padding:0 10px;font-weight:800}
.site-language-fieldset{border-color:#3b4770!important;background:linear-gradient(180deg,rgba(38,33,84,.38),rgba(12,19,35,.8))!important}.site-language-fieldset legend{color:#c2b8ff!important}
.site-lang-help{display:block;margin:4px 0 10px;color:#8494b7;font-size:9px;line-height:1.45}.site-lang-list{display:grid;gap:7px}.site-lang-row{display:grid;grid-template-columns:28px 54px minmax(0,1fr) auto;gap:6px;align-items:center;padding:7px;border:1px solid #2e3b59;border-radius:10px;background:#0a1323}.site-lang-row input[type=text]{height:34px!important;min-width:0}.site-lang-row .lang-code{text-transform:uppercase;text-align:center;color:#a99cff!important;font-weight:900}.site-lang-row .lang-count{font-size:9px;color:#7887a6;white-space:nowrap}.site-lang-row button{height:32px;min-width:32px;padding:0 8px;border-radius:8px}.site-lang-add{width:100%;margin-top:9px;min-height:38px;border:1px dashed #665ad0!important;background:#17163a!important;color:#d5ceff!important}
.translation-grid{display:grid;gap:7px}.translation-row{display:grid;grid-template-columns:52px minmax(0,1fr) auto;align-items:center;gap:7px;padding:8px;border:1px solid #2c3954;border-radius:10px;background:#0b1424}.translation-row b{font-size:10px;color:#b6aaff;text-transform:uppercase}.translation-row span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;color:#b9c4dc}.translation-row button{height:30px;padding:0 9px;border-radius:8px;font-size:9px}.translation-row.current{border-color:#665ad0;background:#17163a}.translation-missing{color:#73819e!important;font-style:italic}
@media(max-width:760px){.site-language-bar{margin-bottom:8px;padding:8px}.site-language-bar select{height:40px}.site-lang-row{grid-template-columns:26px 48px minmax(0,1fr) auto;gap:5px;padding:6px}.site-lang-row .lang-count{display:none}.translation-row{grid-template-columns:46px minmax(0,1fr) auto}}
`;document.head.append(s)}

function activeLang(){ensureSiteLanguageConfig(state.project);return state.project.activeSiteLang||defaultSiteLanguage(state.project)}
function renderLanguageBar(){const scroll=$('#leftSidebar .panel-scroll');if(!scroll||!projectReady())return;let bar=$('#siteLanguageBar');if(!bar){bar=document.createElement('div');bar.id='siteLanguageBar';bar.className='site-language-bar';scroll.prepend(bar)}const langs=siteLanguages(state.project),active=activeLang();bar.innerHTML=`<div class="sl-head"><strong>${esc(t('siteLang'))}</strong><small>${esc(active.toUpperCase())}</small></div><select data-site-language-switch aria-label="${esc(t('siteLang'))}">${langs.map(x=>`<option value="${esc(x.code)}" ${x.code===active?'selected':''}>${esc(x.label)} · ${esc(x.code.toUpperCase())}</option>`).join('')}</select>`}

function filterPageRows(){if(!projectReady())return;const lang=activeLang();document.querySelectorAll('#pageList [data-page-id]').forEach(row=>{const p=state.project.pages.find(x=>x.id===row.dataset.pageId);row.style.display=p?.lang===lang?'':'none';if(p&&p.lang===lang){const small=row.querySelector('small');if(small)small.textContent=p.home?(p.pathPrefix?`${p.pathPrefix}/index.html`:'index.html'):(p.pathPrefix?`${p.pathPrefix}/${p.slug}.html`:`${p.slug}.html`)}})}

function translationMarkup(page){const langs=siteLanguages(state.project);return`<fieldset class="site-language-fieldset" data-linked-translations><legend>${esc(t('translations'))}</legend><div class="translation-grid">${langs.map(lang=>{const variant=linkedPage(state.project,page,lang.code),current=variant?.id===page.id;return`<div class="translation-row ${current?'current':''}"><b>${esc(lang.code)}</b>${variant?`<span>${esc(variant.name)}</span><button type="button" data-open-translation="${esc(variant.id)}" ${current?'disabled':''}>${current?'✓':esc(t('open'))}</button>`:`<span class="translation-missing">${esc(t('missing'))}</span><button type="button" data-create-translation="${esc(lang.code)}">＋ ${esc(t('create'))}</button>`}</div>`}).join('')}</div></fieldset>`}

function enhancePageInspector(){const root=$('#pageInspector');if(!root||root.classList.contains('hidden')||!projectReady())return;const page=state.project.pages.find(x=>x.id===state.project.currentPageId);if(!page)return;const select=root.querySelector('[data-page="lang"]');if(select){const html=siteLanguages(state.project).map(x=>`<option value="${esc(x.code)}" ${x.code===page.lang?'selected':''}>${esc(x.label)} · ${esc(x.code.toUpperCase())}</option>`).join('');if(select.innerHTML!==html)select.innerHTML=html}root.querySelector('[data-linked-translations]')?.remove();const head=root.querySelector('.inspector-head');if(head)head.insertAdjacentHTML('afterend',translationMarkup(page))}

function languagesFieldset(){const langs=siteLanguages(state.project);return`<fieldset class="site-language-fieldset" data-site-languages-config><legend>${esc(t('languages'))}</legend><small class="site-lang-help">${esc(t('hint'))}</small><div class="site-lang-list">${langs.map(lang=>{const count=pagesForLanguage(state.project,lang.code).length;return`<div class="site-lang-row"><input type="radio" name="site-default-lang" data-site-lang-default="${esc(lang.code)}" ${lang.default?'checked':''} title="${esc(t('default'))}"><input class="lang-code" type="text" value="${esc(lang.code)}" readonly><input type="text" data-site-lang-label="${esc(lang.code)}" value="${esc(lang.label)}" aria-label="${esc(t('name'))}"><span class="lang-count">${count} ${esc(t('pages'))}</span><button type="button" data-site-lang-remove="${esc(lang.code)}" ${langs.length<=1?'disabled':''} title="${esc(t('remove'))}">×</button></div>`}).join('')}</div><button type="button" class="site-lang-add" data-site-lang-add>＋ ${esc(t('add'))}</button></fieldset>`}

function enhanceSiteInspector(){const root=$('#siteInspector');if(!root||root.classList.contains('hidden')||!projectReady())return;root.querySelector('[data-site-languages-config]')?.remove();const head=root.querySelector('.inspector-head');if(head)head.insertAdjacentHTML('afterend',languagesFieldset())}

function enhance(){if(!projectReady())return;ensureSiteLanguageConfig(state.project);ensureStyle();observer?.disconnect();renderLanguageBar();filterPageRows();enhancePageInspector();enhanceSiteInspector();observe()}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(()=>{scheduled=false;enhance()},0)}
function observe(){if(!observer)observer=new MutationObserver(schedule);for(const root of[$('#leftSidebar'),$('#rightSidebar')])if(root)observer.observe(root,{childList:true,subtree:true})}

function switchLang(code){mutate('Switch site language',()=>{switchProjectLanguage(state.project,code,state.project.currentPageId);clearSelection()})}
function createPageForActiveLanguage(){const name=prompt(t('pageName'),t('newPage'));if(!name)return;mutate('Create page',()=>{const p=addPage(state.project,name,activeLang());state.project.currentPageId=p.id;state.project.activeSiteLang=p.lang;clearSelection();state.activeRight='page'})}
function openTranslation(id){const p=state.project.pages.find(x=>x.id===id);if(!p)return;mutate('Open translation',()=>{state.project.currentPageId=p.id;state.project.activeSiteLang=p.lang;clearSelection();state.activeRight='page'})}
function createTranslation(code){const source=state.project.pages.find(x=>x.id===state.project.currentPageId);if(!source)return;mutate('Create translation',()=>{const p=addPageTranslation(state.project,source,code);if(p){state.project.currentPageId=p.id;state.project.activeSiteLang=p.lang;clearSelection();state.activeRight='page'}})}

function bind(){
  document.addEventListener('change',e=>{
    const sw=e.target.closest?.('[data-site-language-switch]');if(sw){e.stopImmediatePropagation();switchLang(sw.value);return}
    const label=e.target.closest?.('[data-site-lang-label]');if(label){e.stopImmediatePropagation();mutate('Rename site language',()=>{const row=state.project.siteLanguages.find(x=>x.code===label.dataset.siteLangLabel);if(row)row.label=label.value.trim()||languageLabel(row.code)});return}
    const def=e.target.closest?.('[data-site-lang-default]');if(def){e.stopImmediatePropagation();mutate('Default site language',()=>setDefaultSiteLanguage(state.project,def.dataset.siteLangDefault));return}
    const pageLang=e.target.closest?.('[data-page="lang"]');if(pageLang){e.stopImmediatePropagation();const page=state.project.pages.find(x=>x.id===state.project.currentPageId),code=normalizeLanguageCode(pageLang.value);if(!page||!code)return;const exists=linkedPage(state.project,page,code);if(exists&&exists.id!==page.id){openTranslation(exists.id);return}mutate('Page language',()=>{page.lang=code;state.project.activeSiteLang=code;if(!page.home)page.slug=uniqueSlug(state.project,page.slug||page.name,page.id,code);ensureSiteLanguageConfig(state.project);if(page.home)setHome(state.project,page.id)});return}
  },true);

  document.addEventListener('click',e=>{
    const add=e.target.closest?.('[data-site-lang-add]');if(add){e.preventDefault();e.stopImmediatePropagation();const code=normalizeLanguageCode(prompt(`${t('code')} (en, de, tr, fr, pt-br...)`,'')||'');if(!code)return;const name=prompt(t('name'),languageLabel(code))||languageLabel(code);mutate('Add site language',()=>{const row=addSiteLanguage(state.project,code,name);if(row)state.project.activeSiteLang=row.code});return}
    const remove=e.target.closest?.('[data-site-lang-remove]');if(remove){e.preventDefault();e.stopImmediatePropagation();const code=remove.dataset.siteLangRemove,count=pagesForLanguage(state.project,code).length;if(count&&!confirm(`${t('deleteLang')} (${count})`))return;mutate('Remove site language',()=>removeSiteLanguage(state.project,code,{deletePages:true}));return}
    const open=e.target.closest?.('[data-open-translation]');if(open){e.preventDefault();e.stopImmediatePropagation();openTranslation(open.dataset.openTranslation);return}
    const create=e.target.closest?.('[data-create-translation]');if(create){e.preventDefault();e.stopImmediatePropagation();createTranslation(create.dataset.createTranslation);return}
    if(e.target.closest?.('#addPageInline')){e.preventDefault();e.stopImmediatePropagation();createPageForActiveLanguage();return}
    const row=e.target.closest?.('#pageList [data-page-id]');if(row){const p=state.project?.pages?.find(x=>x.id===row.dataset.pageId);if(p)state.project.activeSiteLang=p.lang}
  },true);
  $('#uiLanguage')?.addEventListener('change',schedule);
  window.addEventListener('pageshow',schedule);
}

function boot(){if(!projectReady()){setTimeout(boot,40);return}ensureSiteLanguageConfig(state.project);bind();enhance()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();

export {renderLanguageBar,enhance as renderSiteLanguageUi};
