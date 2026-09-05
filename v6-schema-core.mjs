import {schemaPayload,buildSeoHead,ensureSeoConfig,normalizeSiteUrl,publicPageUrl} from './v6-seo.mjs';

export const VISUAL_SCHEMA_TYPES=['LocalBusiness','Product','Offer','Service','Article','BlogPosting','Event','Person','Organization','VideoObject','BreadcrumbList','FAQPage'];
export const MAIN_ENTITY_TYPES=new Set(['LocalBusiness','Product','Service','Article','BlogPosting','Event','Person','Organization','VideoObject']);
const TYPE_SET=new Set(VISUAL_SCHEMA_TYPES);

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
  if(!page)return null;
  page.seo??={};
  page.seo.visualSchemas=Array.isArray(page.seo.visualSchemas)?page.seo.visualSchemas:[];
  const row=createVisualSchema(type);
  page.seo.visualSchemas.push(row);
  return row;
}
export function removeVisualSchema(page,id){
  if(!page?.seo?.visualSchemas)return false;
  const before=page.seo.visualSchemas.length;
  page.seo.visualSchemas=page.seo.visualSchemas.filter(x=>x.id!==id);
  return before!==page.seo.visualSchemas.length;
}
function setPath(obj,path,value){
  const parts=path.split('.');let cur=obj;
  for(let i=0;i<parts.length-1;i++)cur=cur[parts[i]]||(cur[parts[i]]={});
  if(value===''||value===null||value===undefined)delete cur[parts.at(-1)];else cur[parts.at(-1)]=value;
}
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
  if((type==='Person'||type==='Organization')&&typeof d.sameAs==='string')d.sameAs=lines(d.sameAs).map(httpUrl).filter(Boolean);
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
function nestedUrl(data,path){return path.split('.').reduce((a,k)=>a?.[k],data)}
export function validateVisualSchema(item){
  const issues=[];
  if(!item||!TYPE_SET.has(item.type))return{valid:false,issues:['Unsupported schema type']};
  const d=item.data||{},type=item.type;
  if(type==='FAQPage'){
    if(!lines(d.items).some(x=>x.includes('|')))issues.push('Add at least one question | answer line.');
  }else if(type==='BreadcrumbList'){
    if(!lines(d.items).some(x=>x.includes('|')))issues.push('Add at least one label | URL line.');
  }else if(['Article','BlogPosting'].includes(type)){
    if(!String(d.headline||d.name||'').trim())issues.push('Headline or name is required.');
  }else if(['VideoObject','Event'].includes(type)){
    if(!String(d.name||'').trim())issues.push('Name is required.');
  }else if(type==='Offer'){
    if(!String(d.price??'').trim())issues.push('Price is required.');
  }else if(!String(d.name||d.headline||'').trim())issues.push('Name is required.');
  for(const key of ['url','image','logo','thumbnailUrl','contentUrl','embedUrl','offers.url','offers.availability']){
    const v=nestedUrl(d,key);if(v&&!httpUrl(v))issues.push(`${key} must be an absolute http(s) URL.`);
  }
  return{valid:issues.length===0,issues};
}
function siteEntityId(project,type){const base=normalizeSiteUrl(project?.siteUrl);if(!base)return'';return type==='Person'?`${base}/#person`:type==='Organization'?`${base}/#organization`:''}
export function visualSchemaNodes(project,page){
  ensureVisualSchemaConfig(project);
  const canonical=publicPageUrl(project,page),webpageId=canonical?`${canonical}#webpage`:'',rows=[];
  for(const item of page?.seo?.visualSchemas||[]){
    if(!validateVisualSchema(item).valid)continue;
    const data=normalizeSpecial(item.type,item.data),siteId=siteEntityId(project,item.type),safeId=String(item.id||uid()).replace(/[^a-zA-Z0-9_-]/g,''),id=siteId||`${canonical||'urn:web-builder'}#schema-${safeId}`;
    const node=cleanObject({'@type':item.type,'@id':id,...data});if(!node)continue;
    if(webpageId&&!['Organization','Person','BreadcrumbList','FAQPage'].includes(item.type))node.isPartOf={'@id':webpageId};
    rows.push({...item,node});
  }
  return rows;
}
function mergeNode(base,node){for(const[k,v]of Object.entries(node)){if(k==='@id'||k==='@type')continue;if(base[k]===undefined||base[k]===''||(Array.isArray(base[k])&&base[k].length===0))base[k]=v}return base}
export function augmentedSchemaPayload(project,page,options={}){
  ensureVisualSchemaConfig(project);
  const base=schemaPayload(project,page,options);if(!base)return null;
  const graph=Array.isArray(base['@graph'])?base['@graph'].map(x=>structuredClone(x)):[],seen=new Map(graph.filter(x=>x?.['@id']).map(x=>[x['@id'],x]));
  const rows=visualSchemaNodes(project,page);
  for(const row of rows){const id=row.node['@id'];if(seen.has(id))mergeNode(seen.get(id),row.node);else{graph.push(row.node);seen.set(id,row.node)}}
  const canonical=publicPageUrl(project,page),wp=seen.get(canonical?`${canonical}#webpage`:'');
  if(wp){
    const primary=rows.find(x=>x.primary&&MAIN_ENTITY_TYPES.has(x.type))||rows.find(x=>MAIN_ENTITY_TYPES.has(x.type));
    if(primary)wp.mainEntity={'@id':primary.node['@id']};
    const breadcrumb=rows.find(x=>x.type==='BreadcrumbList');if(breadcrumb)wp.breadcrumb={'@id':breadcrumb.node['@id']};
  }
  return{'@context':'https://schema.org','@graph':graph};
}
export function buildSchemaAwareSeoHead(project,page,options={}){
  const head=buildSeoHead(project,page,options),payload=augmentedSchemaPayload(project,page,options);if(!payload)return head;
  const script=`<script type="application/ld+json">${JSON.stringify(payload).replace(/<\//g,'<\\/')}</script>`;
  const re=/<script type="application\/ld\+json">[\s\S]*?<\/script>/;
  return re.test(head)?head.replace(re,script):head+script;
}
