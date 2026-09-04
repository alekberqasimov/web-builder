import {uid,clone,slugify} from './v5-core.mjs';

const COMMON_LABELS={ru:'Русский',az:'Azərbaycan',en:'English',tr:'Türkçe',de:'Deutsch',fr:'Français',es:'Español',it:'Italiano',pt:'Português',uk:'Українська',ka:'ქართული',ar:'العربية',fa:'فارسی',he:'עברית',zh:'中文',ja:'日本語',ko:'한국어'};

export function normalizeLanguageCode(value=''){
  return String(value).trim().toLowerCase().replace(/_/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-{2,}/g,'-').replace(/^-|-$/g,'').slice(0,20);
}

export function languageLabel(code=''){
  const c=normalizeLanguageCode(code);
  return COMMON_LABELS[c]||COMMON_LABELS[c.split('-')[0]]||c.toUpperCase()||'LANG';
}

export function defaultSiteLanguages(){return[{code:'ru',label:'Русский',default:true},{code:'az',label:'Azərbaycan',default:false},{code:'en',label:'English',default:false}]}
export function siteLanguages(project){const list=Array.isArray(project?.siteLanguages)?project.siteLanguages:[];return list.filter(x=>x&&normalizeLanguageCode(x.code)).map(x=>({code:normalizeLanguageCode(x.code),label:String(x.label||languageLabel(x.code)),default:!!x.default}))}
export function defaultSiteLanguage(project){const list=siteLanguages(project);return(list.find(x=>x.default)||list[0]||{code:'ru'}).code}

function syncPagePathPrefixes(project){const def=defaultSiteLanguage(project);for(const p of project.pages||[]){const code=normalizeLanguageCode(p.lang||def)||def;p.pathPrefix=code===def?'':code}}

export function ensureSiteLanguageConfig(project){
  if(!project||typeof project!=='object')return project;
  let list=Array.isArray(project.siteLanguages)?project.siteLanguages:[];
  if(!list.length){const seen=[];for(const p of project.pages||[]){const c=normalizeLanguageCode(p.lang||'');if(c&&!seen.includes(c))seen.push(c)}list=(seen.length?seen:['ru','az','en']).map((code,i)=>({code,label:languageLabel(code),default:i===0}))}
  const used=new Set();list=list.map(x=>{const code=normalizeLanguageCode(x?.code);if(!code||used.has(code))return null;used.add(code);return{code,label:String(x?.label||languageLabel(code)),default:!!x?.default}}).filter(Boolean);
  if(!list.length)list=defaultSiteLanguages();if(!list.some(x=>x.default))list[0].default=true;let foundDefault=false;for(const x of list){if(x.default&&!foundDefault)foundDefault=true;else if(x.default)x.default=false}
  project.siteLanguages=list;const fallback=defaultSiteLanguage(project);for(const p of project.pages||[]){p.lang=normalizeLanguageCode(p.lang||fallback)||fallback;p.groupId=p.groupId||uid('pagegroup')}
  syncPagePathPrefixes(project);const active=normalizeLanguageCode(project.activeSiteLang||'');project.activeSiteLang=list.some(x=>x.code===active)?active:fallback;return project;
}

export function pagesForLanguage(project,lang){const code=normalizeLanguageCode(lang||project?.activeSiteLang||defaultSiteLanguage(project));return(project?.pages||[]).filter(p=>normalizeLanguageCode(p.lang)===code)}
export function linkedPage(project,pageOrId,lang){const page=typeof pageOrId==='string'?(project?.pages||[]).find(p=>p.id===pageOrId):pageOrId;if(!page)return null;const code=normalizeLanguageCode(lang);return(project?.pages||[]).find(p=>p.groupId===page.groupId&&normalizeLanguageCode(p.lang)===code)||null}
export function homePageForLanguage(project,lang){const list=pagesForLanguage(project,lang);return list.find(p=>p.home)||list[0]||null}
export function resolvePageForLanguage(project,targetPage,currentLang){if(!targetPage)return null;return linkedPage(project,targetPage,currentLang)||targetPage}

export function switchProjectLanguage(project,lang,currentPageId=''){ensureSiteLanguageConfig(project);const code=normalizeLanguageCode(lang);if(!project.siteLanguages.some(x=>x.code===code))return null;const current=(project.pages||[]).find(p=>p.id===(currentPageId||project.currentPageId));const next=linkedPage(project,current,code)||homePageForLanguage(project,code);project.activeSiteLang=code;if(next)project.currentPageId=next.id;return next}
export function addSiteLanguage(project,code,label=''){ensureSiteLanguageConfig(project);const c=normalizeLanguageCode(code);if(!c||project.siteLanguages.some(x=>x.code===c))return null;const row={code:c,label:String(label||languageLabel(c)),default:false};project.siteLanguages.push(row);syncPagePathPrefixes(project);return row}
export function removeSiteLanguage(project,code,{deletePages=false}={}){ensureSiteLanguageConfig(project);const c=normalizeLanguageCode(code);if(project.siteLanguages.length<=1)return false;const row=project.siteLanguages.find(x=>x.code===c);if(!row)return false;if((project.pages||[]).some(p=>p.lang===c)&&!deletePages)return false;if(deletePages)project.pages=project.pages.filter(p=>p.lang!==c);project.siteLanguages=project.siteLanguages.filter(x=>x.code!==c);if(row.default&&project.siteLanguages[0])project.siteLanguages[0].default=true;if(project.activeSiteLang===c)project.activeSiteLang=defaultSiteLanguage(project);syncPagePathPrefixes(project);const activePages=pagesForLanguage(project,project.activeSiteLang);if(!project.pages.some(p=>p.id===project.currentPageId)&&activePages[0])project.currentPageId=activePages[0].id;return true}
export function setDefaultSiteLanguage(project,code){ensureSiteLanguageConfig(project);const c=normalizeLanguageCode(code);if(!project.siteLanguages.some(x=>x.code===c))return false;project.siteLanguages.forEach(x=>x.default=x.code===c);syncPagePathPrefixes(project);return true}
export function clonePageVariant(source,lang){const page=clone(source);page.id=uid('page');page.lang=normalizeLanguageCode(lang);page.home=!!source.home;page.groupId=source.groupId||uid('pagegroup');page.slug=page.home?'':slugify(source.slug||source.name)||'page';return page}
export function sitePagePath(project,page){const file=page.home?'index.html':`${page.slug||slugify(page.name)||'page'}.html`;const code=normalizeLanguageCode(page.lang||defaultSiteLanguage(project));return code===defaultSiteLanguage(project)?file:`${code}/${file}`}
export function relativePageHref(project,fromPage,toPage){if(!toPage)return'#';const from=sitePagePath(project,fromPage),to=sitePagePath(project,toPage);const fromParts=from.split('/');fromParts.pop();const toParts=to.split('/');while(fromParts.length&&toParts.length&&fromParts[0]===toParts[0]){fromParts.shift();toParts.shift()}return`${'../'.repeat(fromParts.length)}${toParts.join('/')||'index.html'}`}
