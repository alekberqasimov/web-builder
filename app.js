const STORAGE_KEY='web-builder-project-v1';
const templates={
  navbar:{name:'Меню',icon:'☰',category:'main',html:`<div class="nav-row"><div class="logo-text" contenteditable="true">NOVA</div><nav class="nav-links"><a href="#" contenteditable="true">Главная</a><a href="#" contenteditable="true">Услуги</a><a href="#" contenteditable="true">Контакты</a></nav><a class="web-btn" href="#" contenteditable="true">Начать</a></div>`,style:{bg:'#ffffff',color:'#111827',padding:24,width:1120,align:'left'}},
  hero:{name:'Главный экран',icon:'✦',category:'main',html:`<div class="hero-grid"><div><div class="kicker" contenteditable="true">НОВОЕ ПОКОЛЕНИЕ САЙТОВ</div><h1 contenteditable="true">Создавай смело. Запускай быстро.</h1><p contenteditable="true">Профессиональный сайт без сложного кода — собери страницу из готовых блоков.</p><a class="web-btn" href="#" contenteditable="true">Начать проект</a></div><div class="hero-art"></div></div>`,style:{bg:'#f7f6ff',color:'#17142b',padding:86,width:1120,align:'left'}},
  features:{name:'Преимущества',icon:'▦',category:'content',html:`<div class="kicker" contenteditable="true">ПОЧЕМУ МЫ</div><h2 contenteditable="true">Всё необходимое для сильного старта</h2><div class="feature-grid"><div class="feature-card"><div class="feature-icon">01</div><h3 contenteditable="true">Быстрый запуск</h3><p contenteditable="true">Соберите страницу за несколько минут.</p></div><div class="feature-card"><div class="feature-icon">02</div><h3 contenteditable="true">Адаптивный дизайн</h3><p contenteditable="true">Отличный вид на любом устройстве.</p></div><div class="feature-card"><div class="feature-icon">03</div><h3 contenteditable="true">Полный контроль</h3><p contenteditable="true">Скачайте код и разместите где угодно.</p></div></div>`,style:{bg:'#ffffff',color:'#111827',padding:76,width:1120,align:'left'}},
  text:{name:'Текст',icon:'¶',category:'content',html:`<div class="kicker" contenteditable="true">НАША ИСТОРИЯ</div><h2 contenteditable="true">Простая идея, сильный результат</h2><p contenteditable="true">Нажмите на любой текст и начните редактирование. Вы можете менять содержание прямо на холсте — всё сохраняется автоматически в вашем браузере.</p>`,style:{bg:'#f2f4f8',color:'#172033',padding:72,width:880,align:'left'}},
  split:{name:'Текст + медиа',icon:'◧',category:'content',html:`<div class="split-grid"><div class="media-placeholder">✦</div><div><div class="kicker" contenteditable="true">О ПРОЕКТЕ</div><h2 contenteditable="true">Дизайн, который работает</h2><p contenteditable="true">Расскажите о продукте понятным языком и покажите его главное преимущество.</p><a class="web-btn" href="#" contenteditable="true">Подробнее</a></div></div>`,style:{bg:'#ffffff',color:'#111827',padding:78,width:1120,align:'left'}},
  quote:{name:'Цитата',icon:'“',category:'content',html:`<p class="quote" contenteditable="true">«Хороший сайт не просто выглядит красиво — он ясно ведёт человека к нужному действию».</p><div class="kicker" contenteditable="true">— ВАША КОМАНДА</div>`,style:{bg:'#18152c',color:'#ffffff',padding:86,width:880,align:'center'}},
  cta:{name:'Призыв',icon:'→',category:'main',html:`<div class="kicker" contenteditable="true">ГОТОВЫ НАЧАТЬ?</div><h2 contenteditable="true">Превратите идею в работающий сайт</h2><p contenteditable="true">Создайте страницу, скачайте её и загрузите на любой хостинг.</p><a class="web-btn" href="#" contenteditable="true">Создать сейчас</a>`,style:{bg:'#705cff',color:'#ffffff',padding:78,width:880,align:'center'}},
  contact:{name:'Контакты',icon:'✉',category:'main',html:`<div class="contact-grid"><div><div class="kicker" contenteditable="true">СВЯЗАТЬСЯ</div><h2 contenteditable="true">Давайте обсудим проект</h2><p contenteditable="true">Оставьте сообщение — мы ответим в ближайшее время.</p></div><form class="contact-form"><input placeholder="Ваше имя"><input type="email" placeholder="Email"><textarea placeholder="Сообщение"></textarea><button class="web-btn" type="button">Отправить</button></form></div>`,style:{bg:'#f5f6fa',color:'#111827',padding:76,width:1120,align:'left'}},
  footer:{name:'Подвал',icon:'▬',category:'main',html:`<div class="footer-row"><div><div class="logo-text" contenteditable="true">NOVA</div><small contenteditable="true">© 2026. Все права защищены.</small></div><nav class="nav-links"><a href="#" contenteditable="true">Instagram</a><a href="#" contenteditable="true">LinkedIn</a><a href="#" contenteditable="true">Email</a></nav></div>`,style:{bg:'#0d1020',color:'#ffffff',padding:46,width:1120,align:'left'}}
};

const state={sections:[],selected:null,history:[],future:[],draggedSection:null};
const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#canvas'),frame=$('#canvasFrame'),toast=$('#toast');
const uid=()=>`s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
const clone=o=>JSON.parse(JSON.stringify(o));

function renderLibrary(){
  const q=$('#blockSearch').value.toLowerCase(); const cat=$('#categoryTabs .active').dataset.category;
  $('#blockList').innerHTML=Object.entries(templates).filter(([,t])=>(cat==='all'||t.category===cat)&&t.name.toLowerCase().includes(q)).map(([key,t])=>`<button class="block-card" draggable="true" data-template="${key}"><span class="block-icon">${t.icon}</span><strong>${t.name}</strong><small>Перетащить</small></button>`).join('');
  $$('.block-card').forEach(el=>{el.addEventListener('click',()=>addSection(el.dataset.template));el.addEventListener('dragstart',e=>{e.dataTransfer.setData('template',el.dataset.template);e.dataTransfer.effectAllowed='copy'})});
}
function render(){
  canvas.classList.toggle('empty',!state.sections.length);
  canvas.innerHTML=state.sections.map(s=>`<section class="site-section ${s.id===state.selected?'selected':''}" data-id="${s.id}" draggable="true" style="background:${s.style.bg};color:${s.style.color};text-align:${s.style.align}"><div class="section-toolbar" contenteditable="false"><button class="section-drag" title="Переместить">↕</button><button data-act="duplicate" title="Копировать">⧉</button><button data-act="delete" title="Удалить">×</button></div><div class="section-content" style="padding-top:${s.style.padding}px;padding-bottom:${s.style.padding}px;max-width:${s.style.width}px">${s.html}</div></section>`).join('');
  bindCanvas(); updateInspector(); updateHistoryButtons();
}
function snapshot(){state.history.push(JSON.stringify(state.sections));if(state.history.length>60)state.history.shift();state.future=[]}
function commit(label='Сохранено локально'){localStorage.setItem(STORAGE_KEY,JSON.stringify(state.sections));$('#saveStatus').textContent=label;setTimeout(()=>$('#saveStatus').textContent='Сохранено локально',900)}
function addSection(type,index=state.sections.length){snapshot();const t=templates[type];const item={id:uid(),type,html:t.html,style:clone(t.style)};state.sections.splice(index,0,item);state.selected=item.id;commit();render();setTimeout(()=>document.querySelector(`[data-id="${item.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),30)}
function mutate(fn){snapshot();fn();commit();render()}
function bindCanvas(){
  $$('.site-section').forEach(el=>{
    el.addEventListener('click',e=>{if(e.target.closest('[data-act="delete"]'))return deleteSection(el.dataset.id);if(e.target.closest('[data-act="duplicate"]'))return duplicateSection(el.dataset.id);state.selected=el.dataset.id;renderSelectionOnly()});
    el.addEventListener('dragstart',e=>{if(e.target.closest('[contenteditable=true]')){e.preventDefault();return}state.draggedSection=el.dataset.id;e.dataTransfer.setData('section',el.dataset.id);setTimeout(()=>el.classList.add('dragging'))});
    el.addEventListener('dragend',()=>{state.draggedSection=null;el.classList.remove('dragging');removeMarkers()});
  });
  $$('[contenteditable=true]').forEach(el=>{el.addEventListener('focus',()=>{const sec=el.closest('.site-section');state.selected=sec.dataset.id;renderSelectionOnly()});el.addEventListener('input',debounce(()=>{const sec=el.closest('.site-section'),s=findSection(sec.dataset.id);s.html=sec.querySelector('.section-content').innerHTML;commit('Автосохранение…')},250));el.addEventListener('dragstart',e=>e.stopPropagation())});
}
function renderSelectionOnly(){$$('.site-section').forEach(el=>el.classList.toggle('selected',el.dataset.id===state.selected));updateInspector();if(innerWidth<760)$$('.sidebar').forEach(x=>x.classList.remove('open'))}
function findSection(id){return state.sections.find(s=>s.id===id)}
function deleteSection(id){mutate(()=>{const i=state.sections.findIndex(s=>s.id===id);state.sections.splice(i,1);state.selected=state.sections[Math.max(0,i-1)]?.id||null})}
function duplicateSection(id){mutate(()=>{const i=state.sections.findIndex(s=>s.id===id),copy=clone(state.sections[i]);copy.id=uid();state.sections.splice(i+1,0,copy);state.selected=copy.id})}
function updateInspector(){
  const s=findSection(state.selected);$('#emptyInspector').classList.toggle('hidden',!!s);$('#inspector').classList.toggle('hidden',!s);if(!s)return;
  $('#sectionType').value=templates[s.type]?.name||s.type;$('#backgroundColor').value=toHex(s.style.bg);$('#backgroundText').value=s.style.bg;$('#textColor').value=toHex(s.style.color);$('#textColorText').value=s.style.color;$('#paddingRange').value=s.style.padding;$('#paddingValue').value=`${s.style.padding} px`;$('#contentWidth').value=String(s.style.width);$('#textAlign').value=s.style.align;
}
function toHex(value){if(/^#[0-9a-f]{6}$/i.test(value))return value;return '#ffffff'}
function updateStyle(key,value){const s=findSection(state.selected);if(!s)return;s.style[key]=value;const el=document.querySelector(`[data-id="${s.id}"]`);if(key==='bg')el.style.background=value;if(key==='color')el.style.color=value;if(key==='align')el.style.textAlign=value;if(key==='padding'){const c=el.querySelector('.section-content');c.style.paddingTop=c.style.paddingBottom=`${value}px`}if(key==='width')el.querySelector('.section-content').style.maxWidth=`${value}px`;commit('Автосохранение…')}
function updateHistoryButtons(){$('#undoBtn').disabled=!state.history.length;$('#redoBtn').disabled=!state.future.length}
function undo(){if(!state.history.length)return;state.future.push(JSON.stringify(state.sections));state.sections=JSON.parse(state.history.pop());state.selected=null;commit();render()}
function redo(){if(!state.future.length)return;state.history.push(JSON.stringify(state.sections));state.sections=JSON.parse(state.future.pop());state.selected=null;commit();render()}
function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms)}}
function notify(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(notify.t);notify.t=setTimeout(()=>toast.classList.remove('show'),2200)}
function removeMarkers(){$$('.drop-marker').forEach(x=>x.remove())}
function dropIndexFromY(y){const els=$$('.site-section:not(.dragging)');for(let i=0;i<els.length;i++){const r=els[i].getBoundingClientRect();if(y<r.top+r.height/2)return state.sections.findIndex(s=>s.id===els[i].dataset.id)}return state.sections.length}

canvas.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect=state.draggedSection?'move':'copy';removeMarkers();const idx=dropIndexFromY(e.clientY),marker=document.createElement('div');marker.className='drop-marker';const sections=$$('.site-section:not(.dragging)');if(sections[idx])canvas.insertBefore(marker,sections[idx]);else canvas.appendChild(marker)});
canvas.addEventListener('dragleave',e=>{if(!canvas.contains(e.relatedTarget))removeMarkers()});
canvas.addEventListener('drop',e=>{e.preventDefault();removeMarkers();let idx=dropIndexFromY(e.clientY);const type=e.dataTransfer.getData('template'),id=e.dataTransfer.getData('section');if(type)return addSection(type,idx);if(id){const old=state.sections.findIndex(s=>s.id===id);if(old<0)return;snapshot();const [item]=state.sections.splice(old,1);if(old<idx)idx--;state.sections.splice(Math.max(0,idx),0,item);state.selected=id;commit();render()}});

function cleanSectionHtml(html){const box=document.createElement('div');box.innerHTML=html;box.querySelectorAll('[contenteditable]').forEach(x=>x.removeAttribute('contenteditable'));box.querySelectorAll('form').forEach(f=>f.setAttribute('action','#'));return box.innerHTML}
function exportedDocument(){
  const sections=state.sections.map(s=>`<section style="background:${s.style.bg};color:${s.style.color};text-align:${s.style.align}"><div class="section-content" style="padding-top:${s.style.padding}px;padding-bottom:${s.style.padding}px;max-width:${s.style.width}px">${cleanSectionHtml(s.html)}</div></section>`).join('\n');
  const builderCss=[...document.styleSheets].find(s=>s.href&&s.href.endsWith('styles.css'));let css='';try{css=[...builderCss.cssRules].map(r=>r.cssText).join('\n')}catch(e){}css=css.replace(/\.site-section\.selected[^}]*}/g,'').replace(/\.section-toolbar[^}]*}/g,'').replace(/\.canvas-frame[^}]*}/g,'').replace(/\.canvas[^}]*}/g,'');
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Мой сайт</title><style>html,body{margin:0;font-family:Inter,Arial,sans-serif;color:#111827}*{box-sizing:border-box}${css}.section-toolbar{display:none!important}@media(max-width:760px){.section-content{padding-left:22px!important;padding-right:22px!important}}</style></head><body>${sections}<script>document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));<\/script></body></html>`;
}
function preview(){if(!state.sections.length)return notify('Сначала добавьте блок');const w=open('','_blank');if(!w)return notify('Разрешите всплывающие окна');w.document.open();w.document.write(exportedDocument());w.document.close()}
async function downloadSite(){if(!state.sections.length)return notify('Сначала добавьте блок');const html=exportedDocument();if(window.JSZip){const zip=new JSZip();zip.file('index.html',html);zip.file('README.txt','Готовый статический сайт. Загрузите index.html на ваш сервер или хостинг.');const blob=await zip.generateAsync({type:'blob'});downloadBlob(blob,'my-website.zip');notify('ZIP готов')}else{downloadBlob(new Blob([html],{type:'text/html'}),'index.html');notify('Скачан index.html') }}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function exportProject(){downloadBlob(new Blob([JSON.stringify({version:1,sections:state.sections},null,2)],{type:'application/json'}),'web-builder-project.json')}

$('#blockSearch').addEventListener('input',renderLibrary);$('#categoryTabs').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('#categoryTabs button').forEach(x=>x.classList.toggle('active',x===b));renderLibrary()});
$$('[data-device]').forEach(b=>b.addEventListener('click',()=>{$$('[data-device]').forEach(x=>x.classList.toggle('active',x===b));frame.className=`canvas-frame ${b.dataset.device}`}));
$('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;$('#previewBtn').onclick=preview;$('#downloadBtn').onclick=downloadSite;
$('#newBtn').onclick=()=>{if(!state.sections.length||confirm('Начать новый проект? Текущие блоки будут удалены.')){snapshot();state.sections=[];state.selected=null;commit();render()}};
$('#duplicateBtn').onclick=()=>duplicateSection(state.selected);$('#deleteBtn').onclick=()=>deleteSection(state.selected);$('#exportProjectBtn').onclick=exportProject;
$('#importProjectInput').addEventListener('change',async e=>{try{const data=JSON.parse(await e.target.files[0].text());if(!Array.isArray(data.sections))throw Error();snapshot();state.sections=data.sections;state.selected=null;commit();render();notify('Проект открыт')}catch(err){notify('Неверный файл проекта')}e.target.value='' });
[['backgroundColor','bg'],['backgroundText','bg'],['textColor','color'],['textColorText','color'],['textAlign','align'],['contentWidth','width']].forEach(([id,key])=>$('#'+id).addEventListener('input',e=>{updateStyle(key,key==='width'?Number(e.target.value):e.target.value);if(id==='backgroundColor')$('#backgroundText').value=e.target.value;if(id==='textColor')$('#textColorText').value=e.target.value}));
$('#paddingRange').addEventListener('input',e=>{$('#paddingValue').value=`${e.target.value} px`;updateStyle('padding',Number(e.target.value))});
$$('[data-open-panel]').forEach(b=>b.onclick=()=>document.querySelector(`.${b.dataset.openPanel}-sidebar`).classList.add('open'));$$('[data-close-panel]').forEach(b=>b.onclick=()=>b.closest('.sidebar').classList.remove('open'));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}if(e.key==='Delete'&&state.selected&&!document.activeElement.matches('input,textarea,[contenteditable=true]'))deleteSection(state.selected)});

try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));if(Array.isArray(saved))state.sections=saved}catch(e){}
if(!state.sections.length){state.sections=['navbar','hero','features','cta','footer'].map(type=>({id:uid(),type,html:templates[type].html,style:clone(templates[type].style)}));commit()}
renderLibrary();render();
