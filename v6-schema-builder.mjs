import {$,state,currentPage,mutate,attr,esc} from './v5-runtime.mjs';
import {schemaPayload,buildSeoHead,ensureSeoConfig,normalizeSiteUrl,publicPageUrl} from './v6-seo.mjs';

export const VISUAL_SCHEMA_TYPES=['LocalBusiness','Product','Offer','Service','Article','BlogPosting','Event','Person','Organization','VideoObject','BreadcrumbList','FAQPage'];
const TYPE_SET=new Set(VISUAL_SCHEMA_TYPES);
const MAIN_ENTITY_TYPES=new Set(['LocalBusiness','Product','Service','Article','BlogPosting','Event','Person','Organization','VideoObject']);
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
  en:{title:'Visual Schema Builder',add:'Add schema',empty:'No page-level structured schema yet.',type:'Type',remove:'Remove',primary:'Main entity',valid:'Valid',invalid:'Needs attention',hint:'Build structured data visually. Custom JSON-LD remains available below for advanced use.',faq:'One question | answer per line',crumb:'One label | URL per line'},
  az:{title:'Visual Schema Builder',add:'Schema əlavə et',empty:'Bu səhifədə page-level structured schema yoxdur.',type:'Tip',remove:'Sil',primary:'Əsas entity',valid:'Düzgün',invalid:'Yoxlama lazımdır',hint:'Structured data-nı vizual qur. Advanced istifadə üçün Custom JSON-LD aşağıda qalır.',faq:'Hər sətirdə sual | cavab',crumb:'Hər sətirdə ad | URL'},
  ru:{title:'Visual Schema Builder',add:'Добавить schema',empty:'Page-level structured schema пока нет.',type:'Тип',remove:'Удалить',primary:'Главная entity',valid:'Valid',invalid:'Нужна проверка',hint:'Собирайте structured data визуально. Custom JSON-LD остаётся ниже для advanced режима.',faq:'Один вопрос | ответ на строку',crumb:'Один label | URL на строку'}
};
const tx=k=>COPY[state.project?.uiLang||'ru']?.[k]||COPY.en[k]||k;

export function ensureVisualSchemaConfig(project){
  ensureSeoConfig(project);
  for(const page of project?.pages||[])if(!Array.isArray(page.seo.visualSchemas))page.seo.visualSchemas=[];
  return project;
}
const uid=()=>`vs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
export function createVisualSchema(type='Product'){
  const t=TYPE_SET.has(type)?type:'Product';
  return {id:uid(),type:t,primary:false,data:{}};
}
export function addVisualSchema(page,type){
  if(!page)return null;page.seo??={};page.seo.visualSchemas=Array.isArray(page.seo.visualSchemas)?page.seo.visualSchemas:[];
  const row=createVisualSchema(type);page.seo.visualSchemas.push(row);return row;
}
export function removeVisualSchema(page,id){if(!page?.seo?.visualSchemas)return false;const before=page.seo.visualSchemas.length;page.seo.visualSchemas=page.seo.visualSchemas.filter(x=>x.id!==id);return before!==page.seo.visualSchemas.length}
function setPath(obj,path,value){const parts=path.split('.');let cur=obj;for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]]||(cur[parts[i]]={});if(value===''||value===null||value===undefined)delete cur[parts.at(-1)];else cur[parts.at(-1)]=value}
function getPath(obj,path){return path.split('.').reduce((a,k)=>a?.[k],obj)}
export function setVisualSchemaField(item,path,value){if(!item)return false;item.data??={};setPath(item.data,path,value);return true}
function cleanObject(value){
  if(Array.isArray(value)){const arr=value.map(cleanObject).filter(v=>v!==undefined&&v!==null&&v!=='');return arr.length?arr:undefined}
  if(value&&typeof value==='object'){const out={};for(const[k,v]of Object.entries(value)){const c=cleanObject(v);if(c!==undefined&&c!==null&&c!=='')out[k]=c}return Object.keys(out).length?out:undefined}
  if(typeof value==='string'){const s=value.trim();return s||undefined}
  return value;
}
function httpUrl(v){try{const u=new URL(String(v||''));return /^https?:$/.test(u.protocol)?u.href:''}catch{return''}}
function lines(v=''){return String(v||'').split(/\n+/).map(x=>x.trim()).filter(Boolean)}
function normalizeSpecial(type,data){
  const d=structuredClone(data||{});
  if(type==='Product'&&d.brand&&typeof d.brand==='string')d.brand={'@type':'Brand',name:d.brand};
  if((type==='Article'||type==='BlogPosting')&&d.author&&typeof d.author==='string')d.author={'@type':'Person',name:d.author};
  if(type==='Service'&&d.provider&&typeof d.provider==='string')d.provider={'@type':'Organization',name:d.provider};
  if(type==='Event'){
    if(d.location&&typeof d.location==='string')d.location={'@type':'Place',name:d.location};
    if(d.organizer&&typeof d.organizer==='string')d.organizer={'@type':'Organization',name:d.organizer};
    if(d.offers)d.offers={'@type':'Offer',...d.offers};
  }
  if(type==='Product'&&d.offers)d.offers={'@type':'Offer',...d.offers};
  if(type==='Person'||type==='Organization')if(typeof d.sameAs==='string')d.sameAs=lines(d.sameAs).map(httpUrl).filter(Boolean);
  if(type==='BreadcrumbList'){
    const rows=lines(d.items).map((line,i)=>{const [name,...rest]=line.split('|');const url=httpUrl(rest.join('|').trim());return name?.trim()&&url?{'@type':'ListItem',position:i+1,name:name.trim(),item:url}:null}).filter(Boolean);
    delete d.items;d.itemListElement=rows;
  }
  if(type==='FAQPage'){
    const rows=lines(d.items).map(line=>{const [q,...rest]=line.split('|');const a=rest.join('|').trim();return q?.trim()&&a?{'@type':'Question',name:q.trim(),acceptedAnswer:{'@type':'Answer',text:a}}:null}).filter(Boolean);
    delete d.items;d.mainEntity=rows;
  }
  return d;
}
export function validateVisualSchema(item){
  const issues=[];if(!item||!TYPE_SET.has(item.type))return{valid:false,issues:['Unsupported schema type']};
  const d=item.data||{},type=item.type;
  if(type==='FAQPage'&&!lines(d.items).some(x=>x.includes('|')))issues.push('Add at least one question | answer line.');
  else if(type==='BreadcrumbList'&&!lines(d.items).some(x=>x.includes('|')))issues.push('Add at least one label | URL line.');
  else if(['Article','BlogPosting'].includes(type)&&!String(d.headline||d.name||'').trim())issues.push('Headline or name is required.');
  else if(type==='VideoObject'&&!String(d.name||'').trim())issues.push('Name is required.');
  else if(type==='Event'&&!String(d.name||'').trim())issues.push('Name is required.');
  else if(!['Offer'].includes(type)&&!String(d.name||d.headline||'').trim())issues.push('Name is required.');
  if(type==='Offer'&&!String(d.price||'').trim())issues.push('Price is required.');
  for(const key of ['url','image','logo','thumbnailUrl','contentUrl','embedUrl']){const v=d[key];if(v&&!httpUrl(v))issues.push(`${key} must be an absolute http(s) URL.`)}
  return{valid:issues.length===0,issues};
}
function siteEntityId(project,type){const base=normalizeSiteUrl(project?.siteUrl);if(!base)return'';return type==='Person'?`${base}/#person`:type==='Organization'?`${base}/#organization`:''}
export function visualSchemaNodes(project,page){
  ensureVisualSchemaConfig(project);const canonical=publicPageUrl(project,page),webpageId=canonical?`${canonical}#webpage`:'',rows=[];
  for(const item of page?.seo?.visualSchemas||[]){
    if(!validateVisualSchema(item).valid)continue;
    const data=normalizeSpecial(item.type,item.data),siteId=siteEntityId(project,item.type),id=siteId||`${canonical||'urn:web-builder'}#schema-${String(item.id||uid()).replace(/[^a-zA-Z0-9_-]/g,'')}`;
    let node=cleanObject({'@type':item.type,'@id':id,...data});if(!node)continue;
    if(webpageId&&!['Organization','Person','BreadcrumbList','FAQPage'].includes(item.type))node.isPartOf={'@id':webpageId};
    rows.push({...item,node});
  }
  return rows;
}
function mergeNode(base,node){for(const[k,v]of Object.entries(node)){if(k==='@id'||k==='@type')continue;if(base[k]===undefined||base[k]===''||(Array.isArray(base[k])&&base[k].length===0))base[k]=v}return base}
export function augmentedSchemaPayload(project,page,options={}){
  ensureVisualSchemaConfig(project);const base=schemaPayload(project,page,options);if(!base)return null;
  const graph=Array.isArray(base['@graph'])?base['@graph'].map(x=>structuredClone(x)):[],seen=new Map(graph.filter(x=>x?.['@id']).map(x=>[x['@id'],x]));
  const rows=visualSchemaNodes(project,page),added=[];
  for(const row of rows){const id=row.node['@id'];if(seen.has(id)){mergeNode(seen.get(id),row.node);added.push(seen.get(id))}else{graph.push(row.node);seen.set(id,row.node);added.push(row.node)}}
  const wpId=publicPageUrl(project,page)?`${publicPageUrl(project,page)}#webpage`:'';const wp=seen.get(wpId);if(wp){const primary=rows.find(x=>x.primary&&MAIN_ENTITY_TYPES.has(x.type))||rows.find(x=>MAIN_ENTITY_TYPES.has(x.type));if(primary)wp.mainEntity={'@id':primary.node['@id']};const breadcrumb=rows.find(x=>x.type==='BreadcrumbList');if(breadcrumb)wp.breadcrumb={'@id':breadcrumb.node['@id']}}
  return{'@context':'https://schema.org','@graph':graph};
}
export function buildSchemaAwareSeoHead(project,page,options={}){
  const head=buildSeoHead(project,page,options),payload=augmentedSchemaPayload(project,page,options);if(!payload)return head;
  const script=`<script type="application/ld+json">${JSON.stringify(payload).replace(/<\//g,'<\\/')}</script>`;
  const re=/<script type="application\/ld\+json">[\s\S]*?<\/script>/;
  return re.test(head)?head.replace(re,script):head+script;
}

function fieldHtml(item,[path,label,type]){const v=getPath(item.data||{},path)??'',placeholder=path==='items'?(item.type==='FAQPage'?tx('faq'):tx('crumb')):'';if(type==='textarea')return`<label>${esc(label)}<textarea rows="2" data-schema-field="${attr(path)}" data-schema-id="${attr(item.id)}" placeholder="${attr(placeholder)}">${esc(v)}</textarea></label>`;return`<label>${esc(label)}<input type="${attr(type||'text')}" data-schema-field="${attr(path)}" data-schema-id="${attr(item.id)}" value="${attr(v)}"></label>`}
function cardHtml(item){const check=validateVisualSchema(item),fields=FIELDS[item.type]||COMMON_FIELDS;return`<div class="schema-card" data-schema-card="${attr(item.id)}"><div class="schema-card-head"><div><strong>${esc(item.type)}</strong><span class="schema-state ${check.valid?'ok':'bad'}">${check.valid?'● '+tx('valid'):'● '+tx('invalid')}</span></div><div><label class="schema-primary"><input type="radio" name="schemaPrimary" data-schema-primary="${attr(item.id)}" ${item.primary?'checked':''}> ${tx('primary')}</label><button type="button" data-schema-remove="${attr(item.id)}" title="${tx('remove')}">×</button></div></div>${check.issues.length?`<small class="schema-issues">${esc(check.issues.join(' · '))}</small>`:''}<div class="schema-fields">${fields.map(f=>fieldHtml(item,f)).join('')}</div></div>`}
function panelHtml(){const page=currentPage(),items=page?.seo?.visualSchemas||[];return`<fieldset id="v6SchemaBuilder"><legend>${tx('title')} · PRO</legend><div class="schema-hint">${tx('hint')}</div><div class="schema-add"><select data-schema-type>${VISUAL_SCHEMA_TYPES.map(x=>`<option value="${x}">${x}</option>`).join('')}</select><button type="button" data-schema-add>＋ ${tx('add')}</button></div><div class="schema-list">${items.length?items.map(cardHtml).join(''):`<small>${tx('empty')}</small>`}</div></fieldset>`}
export function enhanceSchemaBuilderUi(){if(!state.project)return;ensureVisualSchemaConfig(state.project);const panel=$('#seoInspector');if(panel&&!panel.classList.contains('hidden')&&!panel.querySelector('#v6SchemaBuilder'))panel.insertAdjacentHTML('afterbegin',panelHtml())}
function findItem(id){return currentPage()?.seo?.visualSchemas?.find(x=>x.id===id)}
function clickHandler(e){
  if(e.target.closest('[data-schema-add]')){const type=e.target.closest('#v6SchemaBuilder')?.querySelector('[data-schema-type]')?.value||'Product';mutate('Add visual schema',()=>addVisualSchema(currentPage(),type));return}
  const remove=e.target.closest('[data-schema-remove]');if(remove){mutate('Remove visual schema',()=>removeVisualSchema(currentPage(),remove.dataset.schemaRemove));return}
}
function changeHandler(e){
  const field=e.target.closest('[data-schema-field]');if(field){const item=findItem(field.dataset.schemaId);mutate('Update visual schema',()=>setVisualSchemaField(item,field.dataset.schemaField,field.value));return}
  const primary=e.target.closest('[data-schema-primary]');if(primary){mutate('Set main schema entity',()=>{for(const item of currentPage()?.seo?.visualSchemas||[])item.primary=item.id===primary.dataset.schemaPrimary});return}
}
function css(){if(document.getElementById('v6SchemaBuilderCss'))return;const s=document.createElement('style');s.id='v6SchemaBuilderCss';s.textContent=`#v6SchemaBuilder{border-color:rgba(63,184,131,.32)!important;background:linear-gradient(180deg,rgba(40,180,120,.06),rgba(255,255,255,.01))!important}.schema-hint{font-size:9.5px;line-height:1.45;color:#98a4b8;margin-bottom:9px}.schema-add{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;margin-bottom:9px}.schema-list{display:grid;gap:8px}.schema-card{padding:9px;border:1px solid rgba(128,138,160,.18);border-radius:11px;background:rgba(255,255,255,.025)}.schema-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}.schema-card-head>div{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.schema-card-head button{width:27px;min-width:27px;height:27px;padding:0}.schema-state{font-size:8.5px}.schema-state.ok{color:#43d89b}.schema-state.bad,.schema-issues{color:#ff9c88}.schema-primary{display:flex!important;flex-direction:row!important;align-items:center;gap:4px;font-size:8.5px!important}.schema-primary input{width:auto!important}.schema-issues{display:block;margin:6px 0}.schema-fields{display:grid;gap:6px;margin-top:7px}.schema-fields textarea{min-height:48px}@media(max-width:430px){.schema-add{grid-template-columns:1fr}.schema-card-head{flex-direction:column}.schema-card-head>div:last-child{width:100%;justify-content:space-between}}`;document.head.appendChild(s)}
function boot(){const panel=$('#rightSidebar');if(!panel||!state.project){setTimeout(boot,60);return}ensureVisualSchemaConfig(state.project);css();panel.addEventListener('click',clickHandler,true);panel.addEventListener('change',changeHandler,true);new MutationObserver(()=>queueMicrotask(enhanceSchemaBuilderUi)).observe(panel,{childList:true,subtree:true});enhanceSchemaBuilderUi()}
if(typeof document!=='undefined'){document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot()}
