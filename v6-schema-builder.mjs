import {$,state,currentPage,mutate,attr,esc} from './v5-runtime.mjs';
import {VISUAL_SCHEMA_TYPES,MAIN_ENTITY_TYPES,ensureVisualSchemaConfig,addVisualSchema,removeVisualSchema,setVisualSchemaField,validateVisualSchema} from './v6-schema-core.mjs';

const COMMON_FIELDS=[['name','Name','text'],['description','Description','textarea'],['url','URL','url'],['image','Image URL','url']];
const FIELDS={
  LocalBusiness:[...COMMON_FIELDS,['telephone','Phone','text'],['email','Email','email'],['address','Address','text'],['priceRange','Price range','text'],['openingHours','Opening hours','text']],
  Product:[...COMMON_FIELDS,['sku','SKU','text'],['brand','Brand','text'],['offers.price','Price','number'],['offers.priceCurrency','Currency','text'],['offers.availability','Availability URL','url']],
  Offer:[['name','Name','text'],['url','URL','url'],['price','Price','number'],['priceCurrency','Currency','text'],['availability','Availability URL','url'],['validThrough','Valid through','date']],
  Service:[...COMMON_FIELDS,['serviceType','Service type','text'],['areaServed','Area served','text'],['provider','Provider name','text']],
  Article:[...COMMON_FIELDS,['headline','Headline','text'],['datePublished','Published','date'],['dateModified','Modified','date'],['author','Author','text']],
  BlogPosting:[...COMMON_FIELDS,['headline','Headline','text'],['datePublished','Published','date'],['dateModified','Modified','date'],['author','Author','text']],
  Event:[...COMMON_FIELDS,['startDate','Start date','datetime-local'],['endDate','End date','datetime-local'],['location','Location','text'],['organizer','Organizer','text'],['offers.url','Ticket URL','url'],['offers.price','Ticket price','number'],['offers.priceCurrency','Currency','text']],
  Person:[...COMMON_FIELDS,['email','Email','email'],['telephone','Phone','text'],['jobTitle','Job title','text'],['sameAs','Profile URLs','textarea']],
  Organization:[...COMMON_FIELDS,['logo','Logo URL','url'],['email','Email','email'],['telephone','Phone','text'],['sameAs','Official URLs','textarea']],
  VideoObject:[['name','Name','text'],['description','Description','textarea'],['thumbnailUrl','Thumbnail URL','url'],['uploadDate','Upload date','date'],['contentUrl','Content URL','url'],['embedUrl','Embed URL','url'],['duration','Duration ISO 8601','text']],
  BreadcrumbList:[['items','Breadcrumbs','textarea']],
  FAQPage:[['items','FAQ items','textarea']]
};
const COPY={
  en:{title:'Visual Schema Builder',add:'Add schema',empty:'No page-level structured schema yet.',remove:'Remove',primary:'Main entity',valid:'Valid',invalid:'Needs attention',hint:'Build structured data visually. Custom JSON-LD remains available below for advanced use.',faq:'One question | answer per line',crumb:'One label | URL per line'},
  az:{title:'Visual Schema Builder',add:'Schema əlavə et',empty:'Bu səhifədə page-level structured schema yoxdur.',remove:'Sil',primary:'Əsas entity',valid:'Düzgün',invalid:'Yoxlama lazımdır',hint:'Structured data-nı vizual qur. Advanced istifadə üçün Custom JSON-LD aşağıda qalır.',faq:'Hər sətirdə sual | cavab',crumb:'Hər sətirdə ad | URL'},
  ru:{title:'Visual Schema Builder',add:'Добавить schema',empty:'Page-level structured schema пока нет.',remove:'Удалить',primary:'Главная entity',valid:'Valid',invalid:'Нужна проверка',hint:'Собирайте structured data визуально. Custom JSON-LD остаётся ниже для advanced режима.',faq:'Один вопрос | ответ на строку',crumb:'Один label | URL на строку'}
};
const tx=k=>COPY[state.project?.uiLang||'ru']?.[k]||COPY.en[k]||k;
const getPath=(obj,path)=>path.split('.').reduce((a,k)=>a?.[k],obj);

function fieldHtml(item,[path,label,type]){
  const v=getPath(item.data||{},path)??'',placeholder=path==='items'?(item.type==='FAQPage'?tx('faq'):tx('crumb')):'';
  if(type==='textarea')return`<label>${esc(label)}<textarea rows="2" data-schema-field="${attr(path)}" data-schema-id="${attr(item.id)}" placeholder="${attr(placeholder)}">${esc(v)}</textarea></label>`;
  return`<label>${esc(label)}<input type="${attr(type||'text')}" data-schema-field="${attr(path)}" data-schema-id="${attr(item.id)}" value="${attr(v)}"></label>`;
}
function cardHtml(item){
  const check=validateVisualSchema(item),fields=FIELDS[item.type]||COMMON_FIELDS,canPrimary=MAIN_ENTITY_TYPES.has(item.type);
  return`<div class="schema-card" data-schema-card="${attr(item.id)}"><div class="schema-card-head"><div><strong>${esc(item.type)}</strong><span class="schema-state ${check.valid?'ok':'bad'}">${check.valid?'● '+tx('valid'):'● '+tx('invalid')}</span></div><div>${canPrimary?`<label class="schema-primary"><input type="radio" name="schemaPrimary" data-schema-primary="${attr(item.id)}" ${item.primary?'checked':''}> ${tx('primary')}</label>`:''}<button type="button" data-schema-remove="${attr(item.id)}" title="${tx('remove')}">×</button></div></div>${check.issues.length?`<small class="schema-issues">${esc(check.issues.join(' · '))}</small>`:''}<div class="schema-fields">${fields.map(f=>fieldHtml(item,f)).join('')}</div></div>`;
}
function panelHtml(){const page=currentPage(),items=page?.seo?.visualSchemas||[];return`<fieldset id="v6SchemaBuilder"><legend>${tx('title')} · PRO</legend><div class="schema-hint">${tx('hint')}</div><div class="schema-add"><select data-schema-type>${VISUAL_SCHEMA_TYPES.map(x=>`<option value="${x}">${x}</option>`).join('')}</select><button type="button" data-schema-add>＋ ${tx('add')}</button></div><div class="schema-list">${items.length?items.map(cardHtml).join(''):`<small>${tx('empty')}</small>`}</div></fieldset>`}
export function enhanceSchemaBuilderUi(){if(!state.project)return;ensureVisualSchemaConfig(state.project);const panel=$('#seoInspector');if(panel&&!panel.classList.contains('hidden')&&!panel.querySelector('#v6SchemaBuilder'))panel.insertAdjacentHTML('afterbegin',panelHtml())}
function findItem(id){return currentPage()?.seo?.visualSchemas?.find(x=>x.id===id)}
function clickHandler(e){
  if(e.target.closest('[data-schema-add]')){const type=e.target.closest('#v6SchemaBuilder')?.querySelector('[data-schema-type]')?.value||'Product';mutate('Add visual schema',()=>addVisualSchema(currentPage(),type));return}
  const remove=e.target.closest('[data-schema-remove]');if(remove){mutate('Remove visual schema',()=>removeVisualSchema(currentPage(),remove.dataset.schemaRemove));return}
}
function changeHandler(e){
  const field=e.target.closest('[data-schema-field]');if(field){const item=findItem(field.dataset.schemaId);mutate('Update visual schema',()=>setVisualSchemaField(item,field.dataset.schemaField,field.value));return}
  const primary=e.target.closest('[data-schema-primary]');if(primary){mutate('Set main schema entity',()=>{for(const item of currentPage()?.seo?.visualSchemas||[])item.primary=MAIN_ENTITY_TYPES.has(item.type)&&item.id===primary.dataset.schemaPrimary});return}
}
function css(){if(document.getElementById('v6SchemaBuilderCss'))return;const s=document.createElement('style');s.id='v6SchemaBuilderCss';s.textContent=`#v6SchemaBuilder{border-color:rgba(63,184,131,.32)!important;background:linear-gradient(180deg,rgba(40,180,120,.06),rgba(255,255,255,.01))!important}.schema-hint{font-size:9.5px;line-height:1.45;color:#98a4b8;margin-bottom:9px}.schema-add{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;margin-bottom:9px}.schema-list{display:grid;gap:8px}.schema-card{padding:9px;border:1px solid rgba(128,138,160,.18);border-radius:11px;background:rgba(255,255,255,.025)}.schema-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}.schema-card-head>div{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.schema-card-head button{width:27px;min-width:27px;height:27px;padding:0}.schema-state{font-size:8.5px}.schema-state.ok{color:#43d89b}.schema-state.bad,.schema-issues{color:#ff9c88}.schema-primary{display:flex!important;flex-direction:row!important;align-items:center;gap:4px;font-size:8.5px!important}.schema-primary input{width:auto!important}.schema-issues{display:block;margin:6px 0}.schema-fields{display:grid;gap:6px;margin-top:7px}.schema-fields textarea{min-height:48px}@media(max-width:430px){.schema-add{grid-template-columns:1fr}.schema-card-head{flex-direction:column}.schema-card-head>div:last-child{width:100%;justify-content:space-between}}`;document.head.appendChild(s)}
function boot(){const panel=$('#rightSidebar');if(!panel||!state.project){setTimeout(boot,60);return}ensureVisualSchemaConfig(state.project);css();panel.addEventListener('click',clickHandler,true);panel.addEventListener('change',changeHandler,true);new MutationObserver(()=>queueMicrotask(enhanceSchemaBuilderUi)).observe(panel,{childList:true,subtree:true});enhanceSchemaBuilderUi()}
if(typeof document!=='undefined'){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()}
