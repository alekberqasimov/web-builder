import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSocial,makeTabs} from '../v5-core.mjs';
import {socialHrefFromPlatform,platformFromItem,platformValue,applyFloatingStyleModel,functionalAuditIssues,premiumFunctionalCss} from '../v6-functional-premium.mjs';

test('WhatsApp and Telegram destinations are generated from simple customer inputs',()=>{
  assert.equal(socialHrefFromPlatform('whatsapp','+994 50 123 45 67'),'https://wa.me/994501234567');
  assert.equal(socialHrefFromPlatform('whatsapp','+994501234567','Salam'),'https://wa.me/994501234567?text=Salam');
  assert.equal(socialHrefFromPlatform('telegram','@brand_support'),'https://t.me/brand_support');
  assert.equal(platformFromItem({label:'WhatsApp',url:'https://wa.me/994501234567'}),'whatsapp');
  assert.equal(platformValue({url:'https://t.me/brand_support'},'telegram'),'brand_support');
});

test('floating contact settings create exportable responsive style values',()=>{
  const n=makeSocial([{label:'WhatsApp',url:'https://wa.me/994501234567',icon:'WA'}]);
  n.props.style='floating';n.props.floating={position:'left',size:62,offsetX:30,offsetY:36,tooltip:false,pulse:false};
  applyFloatingStyleModel(n);
  assert.equal(n.style.base.left,'30px');
  assert.equal(n.style.base.right,undefined);
  assert.equal(n.style.base['--social-size'],'62px');
  assert.equal(n.style.base['--social-tooltip-enabled'],'0');
  assert.equal(n.style.base['--social-pulse-animation'],'none');
  assert.match(n.style.mobile.bottom,/safe-area-inset-bottom/);
});

test('customer audit explains broken tabs and contact placeholders',()=>{
  const tabs=makeTabs([{id:'a',label:'',content:''},{id:'b',label:'OK',content:'Content'}]);
  const tabIssues=functionalAuditIssues(tabs).map(x=>x.msg).join('\n');
  assert.match(tabIssues,/tab 1 has no title/i);
  assert.match(tabIssues,/tab 1 has no content/i);
  const social=makeSocial([{label:'WhatsApp',url:'https://wa.me/994000000000',icon:'WA'},{label:'Telegram',url:'https://t.me/username',icon:'TG'}]);social.props.style='floating';
  const socialIssues=functionalAuditIssues(social).map(x=>x.msg).join('\n');
  assert.match(socialIssues,/real phone number/i);
  assert.match(socialIssues,/real username/i);
});

test('premium css explicitly protects tab text and brands floating contacts',()=>{
  const css=premiumFunctionalCss();
  assert.match(css,/\.v5-tabs-buttons button\{[^}]*color:#344054!important/);
  assert.match(css,/wa\.me/);
  assert.match(css,/25D366/);
  assert.match(css,/t\.me/);
  assert.match(css,/229ED9/);
});
