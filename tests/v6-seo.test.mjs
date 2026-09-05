import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,addPage,addPageTranslation} from '../v5-model.mjs';
import {exportedDocument} from '../v5-export.mjs';
import {ensureSeoConfig,robotsText,sitemapXml,publicPageUrl,seoAuditIssues} from '../v6-seo.mjs';

test('production head emits canonical social robots and generated schema without meta keywords',()=>{
  const p=defaultProject();
  ensureSeoConfig(p);
  p.name='Acme Studio';
  p.siteUrl='https://acme.example';
  p.siteSeo.defaultOgImage='/share.jpg';
  p.siteSeo.twitterSite='acme';
  const home=p.pages[0];
  home.seo.title='Acme Studio — Premium sites';
  home.seo.description='Commercial website design and launch.';
  home.seo.keywords='ignored,legacy';
  const html=exportedDocument(p,home);
  assert.ok(html.includes('<link rel="canonical" href="https://acme.example/">'));
  assert.ok(html.includes('content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"'));
  assert.ok(html.includes('<meta property="og:site_name" content="Acme Studio">'));
  assert.ok(html.includes('<meta property="og:image" content="https://acme.example/share.jpg">'));
  assert.ok(html.includes('<meta name="twitter:site" content="@acme">'));
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('"@type":"WebSite"'));
  assert.ok(html.includes('"@type":"WebPage"'));
  assert.ok(!html.includes('name="keywords"'));
});

test('noindex does not force nofollow and invalid custom JSON-LD is excluded',()=>{
  const p=defaultProject();
  p.siteUrl='https://acme.example';
  const page=addPage(p,'Draft','ru');
  ensureSeoConfig(p);
  page.seo.noindex=true;
  page.seo.nofollow=false;
  page.seo.jsonLd='{broken';
  const html=exportedDocument(p,page);
  assert.ok(html.includes('content="noindex,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"'));
  assert.ok(!html.includes('{broken'));
  assert.ok(seoAuditIssues(p).some(x=>x.level==='error'&&x.msg.includes('Custom JSON-LD')));
});

test('sitemap uses canonical public URLs, hreflang and excludes noindex and 404 pages',()=>{
  const p=defaultProject(),ru=p.pages[0];
  p.siteUrl='https://acme.example/site/';
  const az=addPageTranslation(p,ru,'az');
  const about=addPage(p,'About','ru');
  const draft=addPage(p,'Draft','ru');
  draft.seo.noindex=true;
  const notFound=addPage(p,'Not Found','ru');
  p.notFoundPageId=notFound.id;
  ensureSeoConfig(p);
  const xml=sitemapXml(p);
  assert.equal(publicPageUrl(p,ru),'https://acme.example/site/');
  assert.equal(publicPageUrl(p,az),'https://acme.example/site/az/');
  assert.ok(xml.includes('<loc>https://acme.example/site/</loc>'));
  assert.ok(xml.includes('hreflang="az"'));
  assert.ok(xml.includes('<loc>https://acme.example/site/about.html</loc>'));
  assert.ok(!xml.includes('draft.html'));
  assert.ok(!xml.includes('not-found.html'));
});

test('robots.txt exposes only real absolute sitemap URLs and keeps noindex crawlable',()=>{
  const p=defaultProject();
  ensureSeoConfig(p);
  p.siteSeo.robots.disallow='/private/\ndrafts/';
  let robots=robotsText(p);
  assert.ok(robots.includes('User-agent: *'));
  assert.ok(robots.includes('Disallow: /private/'));
  assert.ok(robots.includes('Disallow: /drafts/'));
  assert.ok(!robots.includes('Sitemap:'));
  p.siteUrl='https://acme.example';
  robots=robotsText(p);
  assert.ok(robots.includes('Sitemap: https://acme.example/sitemap.xml'));
});

test('404 export can be forced noindex without canonical or generated schema',()=>{
  const p=defaultProject();
  p.siteUrl='https://acme.example';
  const nf=addPage(p,'Not Found','ru');
  ensureSeoConfig(p);
  const html=exportedDocument(p,nf,{forceNoindex:true,disableCanonical:true,disableAlternates:true,disableSchema:true});
  assert.ok(html.includes('name="robots" content="noindex,follow'));
  assert.ok(!html.includes('rel="canonical"'));
  assert.ok(!html.includes('"@type":"WebPage"'));
});

test('SEO audit catches whole-site robots blocking and invalid published URL',()=>{
  const p=defaultProject();
  ensureSeoConfig(p);
  p.siteSeo.robots.disallow='/';
  const issues=seoAuditIssues(p);
  assert.ok(issues.some(x=>x.level==='error'&&x.msg.includes('entire site')));
  assert.ok(issues.some(x=>x.level==='warn'&&x.msg.includes('Published URL')));
});
