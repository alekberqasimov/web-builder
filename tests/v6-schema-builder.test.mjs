import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject} from '../v5-model.mjs';
import {exportedDocument} from '../v5-export.mjs';
import {ensureSeoConfig} from '../v6-seo.mjs';
import {ensureVisualSchemaConfig,addVisualSchema,setVisualSchemaField,validateVisualSchema,augmentedSchemaPayload,visualSchemaNodes} from '../v6-schema-core.mjs';

function project(){const p=defaultProject();ensureSeoConfig(p);ensureVisualSchemaConfig(p);p.siteUrl='https://acme.example';p.name='Acme';p.siteSeo.entity={type:'Organization',name:'Acme',logo:'',email:'',telephone:'',sameAs:''};return p}

test('visual schema config is non-destructive for existing projects',()=>{
  const p=project(),page=p.pages[0];
  page.seo.visualSchemas=[{id:'keep',type:'Product',primary:false,data:{name:'Keep'}}];
  ensureVisualSchemaConfig(p);
  assert.equal(page.seo.visualSchemas.length,1);
  assert.equal(page.seo.visualSchemas[0].id,'keep');
});

test('primary Product augments the existing graph and links WebPage mainEntity',()=>{
  const p=project(),page=p.pages[0],item=addVisualSchema(page,'Product');
  item.id='product-main';item.primary=true;
  setVisualSchemaField(item,'name','Premium Builder');
  setVisualSchemaField(item,'sku','WB-1');
  setVisualSchemaField(item,'brand','Acme');
  setVisualSchemaField(item,'offers.price','99');
  setVisualSchemaField(item,'offers.priceCurrency','USD');
  setVisualSchemaField(item,'offers.availability','https://schema.org/InStock');
  const payload=augmentedSchemaPayload(p,page),graph=payload['@graph'];
  assert.equal(graph.filter(x=>x['@type']==='WebSite').length,1);
  assert.equal(graph.filter(x=>x['@id']==='https://acme.example/#organization').length,1,'site Organization must not be duplicated');
  const product=graph.find(x=>x['@type']==='Product');
  assert.equal(product.name,'Premium Builder');
  assert.deepEqual(product.brand,{'@type':'Brand',name:'Acme'});
  assert.equal(product.offers['@type'],'Offer');
  const webpage=graph.find(x=>x['@type']==='WebPage');
  assert.deepEqual(webpage.mainEntity,{'@id':product['@id']});
});

test('visual Organization merges into stable site entity instead of creating duplicate node',()=>{
  const p=project(),page=p.pages[0],item=addVisualSchema(page,'Organization');
  item.id='org-visual';setVisualSchemaField(item,'name','Acme');setVisualSchemaField(item,'telephone','+994000000000');
  const graph=augmentedSchemaPayload(p,page)['@graph'];
  const orgs=graph.filter(x=>x['@id']==='https://acme.example/#organization');
  assert.equal(orgs.length,1);
  assert.equal(orgs[0].telephone,'+994000000000');
});

test('FAQ and breadcrumb text become structured graph nodes',()=>{
  const p=project(),page=p.pages[0],faq=addVisualSchema(page,'FAQPage'),crumb=addVisualSchema(page,'BreadcrumbList');
  faq.id='faq';crumb.id='crumb';
  setVisualSchemaField(faq,'items','What is it? | A website builder.\nCan I export? | Yes.');
  setVisualSchemaField(crumb,'items','Home | https://acme.example/\nPricing | https://acme.example/pricing.html');
  const graph=augmentedSchemaPayload(p,page)['@graph'],faqNode=graph.find(x=>x['@type']==='FAQPage'),crumbNode=graph.find(x=>x['@type']==='BreadcrumbList'),webpage=graph.find(x=>x['@type']==='WebPage');
  assert.equal(faqNode.mainEntity.length,2);
  assert.equal(faqNode.mainEntity[0]['@type'],'Question');
  assert.equal(crumbNode.itemListElement.length,2);
  assert.equal(crumbNode.itemListElement[1].position,2);
  assert.deepEqual(webpage.breadcrumb,{'@id':crumbNode['@id']});
});

test('Google-oriented minimum validation covers LocalBusiness Event Video and Product presets',()=>{
  const p=project(),page=p.pages[0];
  const business=addVisualSchema(page,'LocalBusiness');business.id='business';setVisualSchemaField(business,'name','Acme Baku');
  assert.equal(validateVisualSchema(business).valid,false);
  setVisualSchemaField(business,'address','Nizami Street 1, Baku');
  assert.equal(validateVisualSchema(business).valid,true);

  const event=addVisualSchema(page,'Event');event.id='event';setVisualSchemaField(event,'name','Launch Night');
  assert.equal(validateVisualSchema(event).valid,false);
  setVisualSchemaField(event,'startDate','2026-10-10T19:00');setVisualSchemaField(event,'location','Baku Convention Center');setVisualSchemaField(event,'locationAddress','Tbilisi Avenue, Baku');
  assert.equal(validateVisualSchema(event).valid,true);

  const video=addVisualSchema(page,'VideoObject');video.id='video';setVisualSchemaField(video,'name','Builder Demo');
  assert.equal(validateVisualSchema(video).valid,false);
  setVisualSchemaField(video,'thumbnailUrl','https://acme.example/video.jpg');setVisualSchemaField(video,'uploadDate','2026-09-05');
  assert.equal(validateVisualSchema(video).valid,true);

  const product=addVisualSchema(page,'Product');product.id='product-min';setVisualSchemaField(product,'name','Builder Pro');
  assert.equal(validateVisualSchema(product).valid,false);
  setVisualSchemaField(product,'offers.price','49');setVisualSchemaField(product,'offers.priceCurrency','USD');
  assert.equal(validateVisualSchema(product).valid,true);

  const graph=augmentedSchemaPayload(p,page)['@graph'];
  const businessNode=graph.find(x=>x['@id']==='https://acme.example/#schema-business');
  const eventNode=graph.find(x=>x['@id']==='https://acme.example/#schema-event');
  assert.equal(businessNode.address['@type'],'PostalAddress');
  assert.equal(eventNode.location['@type'],'Place');
  assert.equal(eventNode.location.address['@type'],'PostalAddress');
});

test('invalid visual schema is excluded from exported graph',()=>{
  const p=project(),page=p.pages[0],product=addVisualSchema(page,'Product');
  product.id='bad-product';setVisualSchemaField(product,'name','Bad');setVisualSchemaField(product,'url','javascript:alert(1)');
  assert.equal(validateVisualSchema(product).valid,false);
  assert.equal(visualSchemaNodes(p,page).some(x=>x.id==='bad-product'),false);
  const html=exportedDocument(p,page);
  assert.ok(!html.includes('bad-product'));
  assert.ok(!html.includes('javascript:alert'));
});

test('static export emits one schema script containing visual nodes and noindex suppresses it',()=>{
  const p=project(),page=p.pages[0],service=addVisualSchema(page,'Service');
  service.id='service';service.primary=true;setVisualSchemaField(service,'name','Premium setup');setVisualSchemaField(service,'provider','Acme');
  let html=exportedDocument(p,page);
  assert.equal((html.match(/application\/ld\+json/g)||[]).length,1);
  assert.ok(html.includes('"@type":"Service"'));
  assert.ok(html.includes('"mainEntity":{"@id":"https://acme.example/#schema-service"}'));
  page.seo.noindex=true;
  html=exportedDocument(p,page);
  assert.equal((html.match(/application\/ld\+json/g)||[]).length,0);
});
