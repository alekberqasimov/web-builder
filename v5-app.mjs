import {defaultProject,migrateProject} from './v5-model.mjs';
import {$,$$,state,tr,currentPage,setRender,clearSelection,dbGet,dbPut,DB_KEY,LEGACY_DB_KEY,persist,mutate,undo,redo,upgradeLegacyContent,breadcrumbText} from './v5-runtime.mjs';
import {elementLabels,renderLeft,renderBlocksLibrary,renderElementsLibrary,renderPagesList,addBlockFromLibrary,addElementType,createPageFlow,renderNavigator,navigatorClick,navigatorRename} from './v5-library.mjs';
import {renderInspector,handleMainInspectorChange,handleMainInspectorClick} from './v5-inspector-main.mjs';
import {bindElementInspectorEvents} from './v5-element-actions.mjs';
import {renderCanvas,selectFromEvent,beginInlineEdit,inlineEdit,finishInlineEdit,blockToolbarClick,bindDnD,openContextMenu,contextAction,keyboardShortcuts,openPreview,renderPreview,downloadSite,importProject} from './v5-canvas.mjs';
import {bindNavigatorDnD} from './v5-navigator-dnd.mjs';
import {bindLibraryExtras,enhanceLibraries} from './v5-library-extras.mjs';
import {bindVisualEditors,renderVisualEditors} from './v5-visual-editors.mjs';
import {localizeUi} from './v5-localize.mjs';
import {bindDeepAudit,renderDeepAudit} from './v5-deep-audit.mjs';

function applyTranslations(){document.documentElement.lang=state.project?.uiLang||'ru';const map={blocksTab:'blocks',elementsTab:'elements',pagesTab:'pages',blockTab:'block',elementTab:'element',pageTab:'page',seoTab:'seo',siteTab:'site',newBtn:'newProject',previewBtn:'preview',downloadBtn:'download'};for(const[id,k]of Object.entries(map)){const el=$('#'+id);if(el)el.textContent=tr(k)}if($('#leftTitle'))$('#leftTitle').textContent=tr(state.activeLeft);if($('#rightTitle'))$('#rightTitle').textContent=tr('settings')}
function updateSaveStatus(){if($('#saveStatus'))$('#saveStatus').textContent=state.saving?'Saving…':tr('saved')}
function syncResponsivePanels(){const compact=matchMedia('(max-width:1180px)').matches;if(compact){document.body.classList.add('left-collapsed','right-collapsed')}else{document.body.classList.remove('left-collapsed','right-collapsed')}}
function enhanceUi(){enhanceLibraries();renderVisualEditors();if(state.activeRight==='site')renderDeepAudit();localizeUi()}
function renderAll(){if(!state.project)return;applyTranslations();if($('#pageLabel'))$('#pageLabel').textContent=`${currentPage().name} · ${(currentPage().lang||'').toUpperCase()}`;if($('#breadcrumb'))$('#breadcrumb').textContent=breadcrumbText(elementLabels);renderLeft();renderCanvas();renderInspector();renderNavigator();enhanceUi();updateSaveStatus();if($('#undoBtn'))$('#undoBtn').disabled=!state.history.length;if($('#redoBtn'))$('#redoBtn').disabled=!state.future.length}

function bind(){
  $('#uiLanguage').onchange=e=>mutate('Language',()=>state.project.uiLang=e.target.value);
  $('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;
  $('#newBtn').onclick=()=>{if(confirm('Create a new project?'))mutate('New project',()=>{state.project=defaultProject();clearSelection()})};
  $('#previewBtn').onclick=openPreview;$('#downloadBtn').onclick=downloadSite;
  ['blocks','elements','pages'].forEach(n=>$(`#${n}Tab`).onclick=()=>{state.activeLeft=n;renderAll()});
  ['block','element','page','seo','site'].forEach(n=>$(`#${n}Tab`).onclick=()=>{state.activeRight=n;renderInspector();enhanceUi()});
  $('#blockSearch').oninput=()=>{renderBlocksLibrary();enhanceLibraries();localizeUi()};$('#blockCategory').onchange=()=>{renderBlocksLibrary();enhanceLibraries();localizeUi()};$('#elementSearch').oninput=()=>{renderElementsLibrary();enhanceLibraries();localizeUi()};
  $('#blocksPanel').onclick=e=>{const b=e.target.closest('[data-add-block]');if(b)addBlockFromLibrary(b.dataset.addBlock)};
  $('#elementsPanel').onclick=e=>{const b=e.target.closest('[data-add-element]');if(b)addElementType(b.dataset.addElement)};
  $('#pagesPanel').onclick=e=>{const r=e.target.closest('[data-page-id]');if(r){state.project.currentPageId=r.dataset.pageId;clearSelection();state.activeRight='page';persist();renderAll()}if(e.target.id==='addPageInline')createPageFlow()};
  $('#canvas').onclick=e=>{if(e.target.closest('.v5-block-toolbar'))return;if(e.target.closest('a[href]'))e.preventDefault();selectFromEvent(e)};
  $('#canvas').addEventListener('focusin',beginInlineEdit,true);$('#canvas').addEventListener('input',inlineEdit,true);$('#canvas').addEventListener('focusout',finishInlineEdit,true);
  $('#canvas').addEventListener('click',e=>{const add=e.target.closest('[data-inline-add]');if(add){e.preventDefault();e.stopPropagation();const c=add.closest('[data-node-id]');if(c){state.selectedBlockId=add.closest('[data-block-id]').dataset.blockId;state.selectedNodeId=c.dataset.nodeId;state.activeLeft='elements';state.activeRight='element';renderAll()}}},true);
  $('#canvas').addEventListener('click',blockToolbarClick,true);
  $('#rightSidebar').addEventListener('change',e=>{if(e.target.id==='projectImport'){importProject(e.target.files?.[0]);return}handleMainInspectorChange(e)});
  $('#rightSidebar').addEventListener('click',handleMainInspectorClick);
  $('#rightSidebar').addEventListener('input',e=>{if(e.target.matches('[data-b="name"]'))handleMainInspectorChange(e)});
  bindElementInspectorEvents();
  $('#navigatorTree').onclick=navigatorClick;$('#navigatorTree').ondblclick=navigatorRename;
  bindDnD();bindNavigatorDnD();bindLibraryExtras();bindVisualEditors();bindDeepAudit();
  $$('[data-device]').forEach(b=>b.onclick=()=>{state.device=b.dataset.device;$$('[data-device]').forEach(x=>x.classList.toggle('active',x===b));$('#customWidth').value='';$('#canvasFrame').style.width='';renderAll()});
  $('#customWidth').onchange=e=>{const v=Math.max(280,Math.min(1920,Number(e.target.value)||0));if(v){$('#canvasFrame').style.width=v+'px';$$('[data-device]').forEach(x=>x.classList.remove('active'))}};
  $('#zoomSelect').onchange=e=>{const v=e.target.value;$('#canvasFrame').style.zoom=v==='fit'?'':v;};
  $('#guidesBtn').onclick=()=>$('#canvas').classList.toggle('show-guides');
  $('#closePreview').onclick=()=>$('#previewDialog').close();$('#previewPage').onchange=e=>renderPreview(e.target.value);$('#previewDevice').onchange=e=>$('#previewFrame').className=e.target.value;
  $('#leftToggle').onclick=()=>{document.body.classList.toggle('left-collapsed');if(matchMedia('(max-width:1180px)').matches)document.body.classList.add('right-collapsed')};$('#rightToggle').onclick=()=>{document.body.classList.toggle('right-collapsed');if(matchMedia('(max-width:1180px)').matches)document.body.classList.add('left-collapsed')};
  window.addEventListener('resize',()=>{if(matchMedia('(min-width:1181px)').matches)document.body.classList.remove('left-collapsed','right-collapsed')});
  document.addEventListener('keydown',keyboardShortcuts);$('#canvas').addEventListener('contextmenu',openContextMenu);$('#navigatorTree').addEventListener('contextmenu',openContextMenu);document.addEventListener('click',e=>{if(!e.target.closest('#contextMenu'))$('#contextMenu').classList.add('hidden')});$('#contextMenu').onclick=contextAction;
}

async function boot(){syncResponsivePanels();let p=await dbGet(DB_KEY);if(!p){const legacy=await dbGet(LEGACY_DB_KEY);p=migrateProject(legacy||defaultProject());upgradeLegacyContent(p);await dbPut(DB_KEY,p)}else{p=migrateProject(p);upgradeLegacyContent(p)}state.project=p;$('#uiLanguage').value=p.uiLang||'ru';setRender(renderAll);bind();renderAll();persist()}
boot();
