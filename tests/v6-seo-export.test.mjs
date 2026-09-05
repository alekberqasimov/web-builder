import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,addPageTranslation} from '../v5-model.mjs';
import {exportedDocument} from '../v5-export.mjs';
import {ensureSeoConfig,robotsText,sitemapXml,schemaPayload,publicPageUrl,seoAuditIssues} from '../v6-seo.mjs';
import {defaultSiteLanguage} from '../v5-languages.mjs';

function projectFixture(){
  const p=defaultProject();
  p.name='Acme Studio';
  p.siteUrl='https://example.com';
  ensureSeoConfig(p);
  const home=p.pages[0];
  const defaultLang=defaultSiteLanguage(p);
  home.name='Home';
  home.lang=defaultLang;
  home.seo.title='Acme Studio — Premium Websites';
  home.seo.description='Premium commercial websites for modern companies.';
  home.seo.ogTitle='Acme Studio';
  home.seo.ogDescription='Premium commercial websites.';
  home.seo.ogImage='/assets/social.jpg';
  home.seo.ogImageAlt='Acme Studio website preview';
  home.seo.schemaType='WebPage';
  p.siteSeo.defaultOgImage='https://example.com/assets/default.jpg';
  p.siteSeo.twitterSite='acmestudio';
  p.siteSeo.entity={type:'Organization',name:'Acme Studio',logo:'https://example.com/assets/logo.png',email:'hello@example.com',telephone:'+1 555 0100',sameAs:'https://www.linkedin.com/company/acme'};
  return {p,home,defaultLang};
}

test('production HTML exports complete discoverability head',()=>{
  const {p,home}=projectFixture();
  const html=exportedDocument(p,home);
  assert.match(html,/<title>Acme Studio — Premium Websites<\/title>/);
  assert.match(html,/<meta name="description" content="Premium commercial websites for modern companies\.">/);
  assert.match(html,/<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">/);
  assert.match(html,/<link rel="canonical" href="https:\/\/example\.com\//);
  assert.match(html,/<meta property="og:title" content="Acme Studio">/);
  assert.match(html,/<meta property="og:image" content="https:\/\/example\.com\/assets\/social\.jpg">/);
  assert.match(html,/<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html,/<meta name="twitter:site" content="@acmestudio">/);
  assert.match(html,/application\/ld\+json/);
  assert.doesNotMatch(html,/meta name="keywords"/i);
});

test('schema graph contains WebSite, Organization and WebPage with stable ids',()=>{
  const {p,home}=projectFixture();
  const data=schemaPayload(p,home);
  assert.equal(data['@context'],'https://schema.org');
  const types=data['@graph'].map(x=>x['@type']);
  assert.ok(types.includes('WebSite'));
  assert.ok(types.includes('Organization'));
  assert.ok(types.includes('WebPage'));
  const wp=data['@graph'].find(x=>x['@type']==='WebPage');
  assert.equal(wp.url,'https://example.com/');
  assert.equal(wp.isPartOf['@id'],'https://example.com/#website');
});

test('robots.txt is crawlable by default and advertises sitemap',()=>{
  const {p}=projectFixture();
  p.siteSeo.robots.disallow='/private/\ndrafts/';
  const txt=robotsText(p);
  assert.match(txt,/^User-agent: \*/);
  assert.match(txt,/Disallow: \/private\//);
  assert.match(txt,/Disallow: \/drafts\//);
  assert.match(txt,/Sitemap: https:\/\/example\.com\/sitemap\.xml/);
  assert.doesNotMatch(txt,/Disallow: \/\n/);
});

test('sitemap excludes noindex and designated 404 pages',()=>{
  const {p,home}=projectFixture();
  const hidden=structuredClone(home);hidden.id='hidden';hidden.home=false;hidden.slug='hidden';hidden.groupId='hidden-group';hidden.seo={...hidden.seo,noindex:true,title:'Hidden'};
  const nf=structuredClone(home);nf.id='not-found';nf.home=false;nf.slug='not-found';nf.groupId='nf-group';nf.seo={...nf.seo,title:'404'};
  p.pages.push(hidden,nf);p.notFoundPageId=nf.id;
  const xml=sitemapXml(p);
  assert.match(xml,/https:\/\/example\.com\//);
  assert.doesNotMatch(xml,/hidden/);
  assert.doesNotMatch(xml,/not-found/);
});

test('multilingual pages export reciprocal hreflang and x-default in HTML and sitemap',()=>{
  const {p,home,defaultLang}=projectFixture();
  const altLang=defaultLang==='az'?'en':'az';
  const alt=addPageTranslation(p,home,altLang);
  alt.seo.title='Acme Studio Alternate';alt.seo.description='Alternate language version';
  const html=exportedDocument(p,home);
  assert.match(html,new RegExp(`hreflang="${defaultLang}"`));
  assert.match(html,new RegExp(`hreflang="${altLang}"`));
  assert.match(html,/hreflang="x-default"/);
  const xml=sitemapXml(p);
  assert.match(xml,/xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  assert.match(xml,new RegExp(`hreflang="${altLang}"`));
  assert.match(xml,/hreflang="x-default"/);
});

test('404 export can be forced non-indexable with no canonical, alternates or schema',()=>{
  const {p,home}=projectFixture();
  const html=exportedDocument(p,home,{forceNoindex:true,disableCanonical:true,disableAlternates:true,disableSchema:true});
  assert.match(html,/<meta name="robots" content="noindex,follow,/);
  assert.doesNotMatch(html,/rel="canonical"/);
  assert.doesNotMatch(html,/hreflang=/);
  assert.doesNotMatch(html,/application\/ld\+json/);
});

test('SEO audit flags dangerous crawl and invalid publishing configuration',()=>{
  const {p}=projectFixture();
  p.siteSeo.robots.disallow='/';
  p.pages[0].seo.canonical='javascript:alert(1)';
  const issues=seoAuditIssues(p);
  assert.ok(issues.some(x=>x.level==='error'&&/blocks crawling of the entire site/.test(x.msg)));
  assert.ok(issues.some(x=>/Manual canonical URL/.test(x.msg)));
});

test('publicPageUrl produces stable root and page URLs for configured default language',()=>{
  const {p,home}=projectFixture();
  assert.equal(publicPageUrl(p,home),'https://example.com/');
  const page=structuredClone(home);page.id='about';page.home=false;page.slug='about';
  assert.equal(publicPageUrl(p,page),'https://example.com/about.html');
});
