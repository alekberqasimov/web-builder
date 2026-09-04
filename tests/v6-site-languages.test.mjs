import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,addPage,addPageTranslation,pageFile,addSiteLanguage,setDefaultSiteLanguage,switchProjectLanguage,linkedPage,relativePageHref,ensureSiteLanguageConfig} from '../v5-model.mjs';
import {renderPage} from '../v5-render-core.mjs';
import {exportedDocument} from '../v5-export.mjs';

test('site languages are separate from builder ui language and allow more than three',()=>{
  const p=defaultProject();
  assert.equal(p.uiLang,'ru');
  assert.deepEqual(p.siteLanguages.map(x=>x.code),['ru','az','en']);
  assert.ok(addSiteLanguage(p,'de','Deutsch'));
  assert.ok(addSiteLanguage(p,'tr','Türkçe'));
  assert.equal(p.siteLanguages.length,5);
  assert.equal(p.uiLang,'ru');
});

test('linked translations share one logical page group',()=>{
  const p=defaultProject(),ru=p.pages[0];
  const az=addPageTranslation(p,ru,'az');
  const en=addPageTranslation(p,ru,'en');
  assert.equal(ru.groupId,az.groupId);
  assert.equal(ru.groupId,en.groupId);
  assert.equal(linkedPage(p,ru,'az').id,az.id);
  switchProjectLanguage(p,'en',ru.id);
  assert.equal(p.currentPageId,en.id);
  assert.equal(p.activeSiteLang,'en');
});

test('multilingual paths use root for default language and folders for others',()=>{
  const p=defaultProject(),ru=p.pages[0];
  const az=addPageTranslation(p,ru,'az');
  const aboutRu=addPage(p,'About','ru');
  const aboutAz=addPageTranslation(p,aboutRu,'az');
  ensureSiteLanguageConfig(p);
  assert.equal(pageFile(ru,p),'index.html');
  assert.equal(pageFile(az,p),'az/index.html');
  assert.equal(pageFile(aboutRu,p),'about.html');
  assert.equal(pageFile(aboutAz,p),'az/about.html');
  assert.equal(pageFile(aboutAz),'az/about.html');
  assert.equal(relativePageHref(p,az,aboutAz),'about.html');
  assert.equal(relativePageHref(p,aboutAz,aboutRu),'../about.html');
});

test('changing default site language remaps export prefixes without changing ui language',()=>{
  const p=defaultProject(),ru=p.pages[0],az=addPageTranslation(p,p.pages[0],'az');
  setDefaultSiteLanguage(p,'az');
  assert.equal(pageFile(az,p),'index.html');
  assert.equal(pageFile(ru,p),'ru/index.html');
  assert.equal(p.uiLang,'ru');
});

test('auto navigation stays inside page language and export adds hreflang',()=>{
  const p=defaultProject(),ru=p.pages[0];
  p.siteUrl='https://example.com';
  const az=addPageTranslation(p,ru,'az');
  const aboutRu=addPage(p,'About','ru');
  const aboutAz=addPageTranslation(p,aboutRu,'az');
  const ruHtml=renderPage(p,ru,{editor:false});
  const azHtml=renderPage(p,az,{editor:false});
  assert.ok(ruHtml.includes('About'));
  assert.ok(!ruHtml.includes('az/about.html'));
  assert.ok(azHtml.includes('About'));
  const doc=exportedDocument(p,aboutAz);
  assert.ok(doc.includes('hreflang="ru"'));
  assert.ok(doc.includes('hreflang="az"'));
  assert.ok(doc.includes('https://example.com/az/about.html'));
});
