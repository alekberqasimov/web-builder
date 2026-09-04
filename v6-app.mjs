import {defaultProject,migrateProject} from './v5-model.mjs';
import {$,$$,state,tr,currentPage,setRender,clearSelection,dbGet,dbPut,DB_KEY,LEGACY_DB_KEY,persist,mutate,undo,redo,upgradeLegacyContent,breadcrumbText} from './v5-runtime.mjs';
import {elementLabels,renderLeft,renderBlocksLibrary,renderElementsLibrary,renderPagesList,addBlockFromLibrary,addElementType,createPageFlow,renderNavigator,navigatorClick,navigatorRename} from './v5-library.mjs';
import {renderInspector,handleMainInspectorChange,handleMainInspectorClick} from './v5-inspector-main.mjs';
import {bindElementInspectorEvents} from './v5-element-actions.mjs';
import {renderCanvas,selectFromEvent,beginInlineEdit,inlineEdit,finishInlineEdit,blockToolbarClick,bindDnD,openContextMenu,contextAction,keyboardShortcuts,openPreview,renderPreview,downloadSite,importProject} from './v5-canvas.mjs';
import {bindPointerBlockDnD} from './v5-block-pointer-dnd.mjs';
import {bindPointerElementDnD} from './v5-element-pointer-dnd.mjs';
import {bindNavigatorDnD} from './v5-navigator-dnd.mjs';
import {bindLibraryExtras,enhanceLibraries} from './v5-library-extras.mjs';
import {bindVisualEditors,renderVisualEditors} from './v5-visual-editors.mjs';
import {enhanceLinkTargetInput} from './v5-link-inputs.mjs';
import {localizeUi} from './v5-localize.mjs';
import {localizeV54} from './v5-localize-v54.mjs';
import {localizeV55} from './v5-localize-v55.mjs';
import {bindDeepAudit,renderDeepAudit} from './v5-deep-audit.mjs';
import {bindAssetManager,renderAssetManager} from './v5-assets.mjs';
import {bindSmartGuides} from './v5-smart-guides.mjs';
import {bindMyBlocksManager,renderMyBlocksManager} from './v5-my-blocks.mjs';
import {bindBulkActions,renderBulkActions} from './v5-bulk-actions.mjs';
import {bindNavigatorControls,enhanceNavigatorControls} from './v5-navigator-controls.mjs';
import {bindPageTemplates,renderPageTemplates} from './v5-page-templates.mjs';
import {bindProKeyboard} from './v5-keyboard-pro.mjs';
import {bindResponsiveAudit,renderResponsiveAudit} from './v5-responsive-audit.mjs';
import {bindFreePosition,renderFreePositionControls,enhanceFreeCanvas} from './v5-free-position.mjs';
import {bindAssetOrganizer,enhanceAssetOrganizer} from './v5-asset-organizer.mjs';
import {bindIconLibrary,renderIconLibrary} from './v5-icon-library.mjs';
import {bindAnimationPro,renderAnimationPro} from './v5-animation-pro.mjs';
import {bindPerformanceSettings,renderPerformanceSettings} from './v5-performance.mjs';

const COMPACT_QUERY='(max-width:1100px)';
let wasCompact=matchMedia(COMPACT_QUERY).matches;

function compact(){return matchMedia(COMPACT_QUERY).matches}
function setText(id,key){const el=$('#'+id);if(el)el.textContent=tr(key)}
function setDataLabel(id,key){const el=$('#'+id);if(!el)return;const value=tr(key);el.dataset.label=value;el.title=value}

function applyTranslations(){
  document.documentElement.lang=state.project?.uiLang||'ru';
  const tabs={blocksTab:'blocks',elementsTab:'elements',pagesTab:'pages',blockTab:'block',elementTab:'element',pageTab:'page',seoTab:'seo',siteTab:'site'};
  for(const[id,key]of Object.entries(tabs))setText(id,key);
  setDataLabel('leftToggle',state.activeLeft||'blocks');
  setDataLabel('rightToggle','settings');
  setDataLabel('newBtn','newProject');
  setDataLabel('previewBtn','preview');
  setDataLabel('downloadBtn','download');
  const left=$('#leftTitle'),right=$('#rightTitle');
  if(left)left.textContent=tr(state.activeLeft||'blocks');
  if(right)right.textContent=tr('settings');
}

function updateSaveStatus(){if($('#saveStatus'))$('#saveStatus').textContent=state.saving?'Saving…':tr('saved')}

function syncPanelUi(){
  const leftOpen=!document.body.classList.contains('left-collapsed');
  const rightOpen=!document.body.classList.contains('right-collapsed');
  const overlay=compact()&&(leftOpen||rightOpen);
  const backdrop=$('#panelBackdrop');
  if(backdrop){backdrop.style.display=overlay?'block':'';backdrop.setAttribute('aria-hidden',overlay?'false':'true')}
  $('#leftToggle')?.setAttribute('aria-expanded',String(leftOpen));
  $('#rightToggle')?.setAttribute('aria-expanded',String(rightOpen));
}

function closeCompactPanels(){
  if(!compact())return;
  document.body.classList.add('left-collapsed','right-collapsed');
  syncPanelUi();
}

function openPanel(side){
  const target=side==='left'?'left-collapsed':'right-collapsed';
  const other=side==='left'?'right-collapsed':'left-collapsed';
  if(compact()){
    document.body.classList.add(other);
    document.body.classList.remove(target);
  }else document.body.classList.remove(target);
  syncPanelUi();
}

function togglePanel(side){
  const target=side==='left'?'left-collapsed':'right-collapsed';
  const other=side==='left'?'right-collapsed':'left-collapsed';
  const opening=document.body.classList.contains(target);
  if(compact()){
    document.body.classList.add(other);
    document.body.classList.toggle(target,!opening);
  }else document.body.classList.toggle(target);
  syncPanelUi();
}

function syncResponsivePanels(force=false){
  const now=compact();
  if(force||now!==wasCompact){
    if(now)document.body.classList.add('left-collapsed','right-collapsed');
    else document.body.classList.remove('left-collapsed','right-collapsed');
    wasCompact=now;
  }
  syncPanelUi();
}

function enhanceUi(){
  enhanceLibraries();
  enhanceNavigatorControls();
  renderVisualEditors();
  enhanceLinkTargetInput();
  renderFreePositionControls();
  renderIconLibrary();
  renderAnimationPro();
  enhanceFreeCanvas();
  if(state.activeRight==='element')renderBulkActions();
  if(state.activeRight==='site'){
    renderDeepAudit();renderResponsiveAudit();renderAssetManager();enhanceAssetOrganizer();renderMyBlocksManager();renderPageTemplates();renderPerformanceSettings();
  }
  localizeUi();localizeV54();localizeV55();
}

function renderAll(){
  if(!state.project)return;
  applyTranslations();
  if($('#pageLabel'))$('#pageLabel').textContent=`${currentPage().name} · ${(currentPage().lang||'').toUpperCase()}`;
  if($('#breadcrumb'))$('#breadcrumb').textContent=breadcrumbText(elementLabels);
  renderLeft();
  renderCanvas();
  renderInspector();
  renderNavigator();
  enhanceUi();
  updateSaveStatus();
  if($('#undoBtn'))$('#undoBtn').disabled=!state.history.length;
  if($('#redoBtn'))$('#redoBtn').disabled=!state.future.length;
  syncPanelUi();
}

function bind(){
  $('#uiLanguage').onchange=e=>mutate('Language',()=>state.project.uiLang=e.target.value);
  $('#undoBtn').onclick=undo;$('#redoBtn').onclick=redo;
  $('#newBtn').onclick=()=>{if(confirm('Create a new project?'))mutate('New project',()=>{state.project=defaultProject();clearSelection()})};
  $('#previewBtn').onclick=openPreview;$('#downloadBtn').onclick=downloadSite;

  ['blocks','elements','pages'].forEach(n=>$(`#${n}Tab`).onclick=()=>{state.activeLeft=n;renderAll()});
  ['block','element','page','seo','site'].forEach(n=>$(`#${n}Tab`).onclick=()=>{state.activeRight=n;renderInspector();enhanceUi();applyTranslations()});

  $('#blockSearch').oninput=()=>{renderBlocksLibrary();enhanceLibraries();localizeUi();localizeV54();localizeV55()};
  $('#blockCategory').onchange=()=>{renderBlocksLibrary();enhanceLibraries();localizeUi();localizeV54();localizeV55()};
  $('#elementSearch').oninput=()=>{renderElementsLibrary();enhanceLibraries();localizeUi();localizeV54();localizeV55()};

  $('#blocksPanel').onclick=e=>{const b=e.target.closest('[data-add-block]');if(b){addBlockFromLibrary(b.dataset.addBlock);closeCompactPanels()}};
  $('#elementsPanel').onclick=e=>{const b=e.target.closest('[data-add-element]');if(b){addElementType(b.dataset.addElement);closeCompactPanels()}};
  $('#pagesPanel').onclick=e=>{
    const r=e.target.closest('[data-page-id]');
    if(r){state.project.currentPageId=r.dataset.pageId;clearSelection();state.activeRight='page';persist();renderAll();closeCompactPanels()}
    if(e.target.id==='addPageInline')createPageFlow();
  };

  $('#canvas').onclick=e=>{if(e.target.closest('.v5-block-toolbar'))return;if(e.target.closest('a[href]'))e.preventDefault();selectFromEvent(e)};
  $('#canvas').addEventListener('focusin',beginInlineEdit,true);
  $('#canvas').addEventListener('input',inlineEdit,true);
  $('#canvas').addEventListener('focusout',finishInlineEdit,true);
  $('#canvas').addEventListener('click',e=>{
    const add=e.target.closest('[data-inline-add]');
    if(add){
      e.preventDefault();e.stopPropagation();
      const c=add.closest('[data-node-id]');
      if(c){state.selectedBlockId=add.closest('[data-block-id]').dataset.blockId;state.selectedNodeId=c.dataset.nodeId;state.activeLeft='elements';state.activeRight='element';renderAll();if(compact())openPanel('left')}
    }
  },true);
  $('#canvas').addEventListener('click',blockToolbarClick,true);

  $('#rightSidebar').addEventListener('change',e=>{if(e.target.id==='projectImport'){importProject(e.target.files?.[0]);return}handleMainInspectorChange(e)});
  $('#rightSidebar').addEventListener('click',handleMainInspectorClick);
  $('#rightSidebar').addEventListener('input',e=>{if(e.target.matches('[data-b="name"]'))handleMainInspectorChange(e)});
  bindElementInspectorEvents();

  $('#navigatorTree').onclick=navigatorClick;
  $('#navigatorTree').ondblclick=navigatorRename;

  bindPointerBlockDnD();bindPointerElementDnD();bindDnD();bindNavigatorDnD();bindLibraryExtras();bindVisualEditors();bindDeepAudit();bindAssetManager();bindSmartGuides();bindMyBlocksManager();bindBulkActions();bindNavigatorControls();bindPageTemplates();bindResponsiveAudit();bindProKeyboard();bindFreePosition();bindAssetOrganizer();bindIconLibrary();bindAnimationPro();bindPerformanceSettings();

  $$('[data-device]').forEach(b=>b.onclick=()=>{
    state.device=b.dataset.device;
    $$('[data-device]').forEach(x=>x.classList.toggle('active',x===b));
    $('#customWidth').value='';
    $('#canvasFrame').style.width='';
    delete $('#canvasFrame').dataset.customWidth;
    renderAll();
  });

  $('#customWidth').onchange=e=>{
    const v=Math.max(240,Math.min(1920,Number(e.target.value)||0));
    if(v){
      const frame=$('#canvasFrame');
      frame.style.width=v+'px';
      frame.dataset.customWidth='1';
      $$('[data-device]').forEach(x=>x.classList.remove('active'));
      e.target.value=String(v);
    }
  };

  $('#zoomSelect').onchange=e=>{const v=e.target.value;$('#canvasFrame').style.zoom=v==='fit'?'':v};
  $('#guidesBtn').onclick=()=>$('#canvas').classList.toggle('show-guides');

  $('#closePreview').onclick=()=>$('#previewDialog').close();
  $('#previewPage').onchange=e=>renderPreview(e.target.value);
  $('#previewDevice').onchange=e=>$('#previewFrame').className=e.target.value;

  $('#leftToggle').onclick=()=>togglePanel('left');
  $('#rightToggle').onclick=()=>togglePanel('right');
  $('#panelBackdrop').onclick=closeCompactPanels;
  document.addEventListener('click',e=>{const c=e.target.closest('[data-close-panel]');if(c){document.body.classList.add(c.dataset.closePanel==='left'?'left-collapsed':'right-collapsed');syncPanelUi()}});

  window.addEventListener('resize',()=>syncResponsivePanels());

  document.addEventListener('keydown',keyboardShortcuts);
  $('#canvas').addEventListener('contextmenu',openContextMenu);
  $('#navigatorTree').addEventListener('contextmenu',openContextMenu);
  document.addEventListener('click',e=>{if(!e.target.closest('#contextMenu'))$('#contextMenu').classList.add('hidden')});
  $('#contextMenu').onclick=contextAction;
}

async function boot(){
  syncResponsivePanels(true);
  let p=await dbGet(DB_KEY);
  if(!p){
    const legacy=await dbGet(LEGACY_DB_KEY);
    p=migrateProject(legacy||defaultProject());
    upgradeLegacyContent(p);
    await dbPut(DB_KEY,p);
  }else{
    p=migrateProject(p);
    upgradeLegacyContent(p);
  }
  state.project=p;
  state.project.assets||=[];
  state.project.assetFolders||=[];
  state.project.presets||=[];
  state.project.pageTemplates||=[];
  state.project.exportSettings||={minify:true};
  $('#uiLanguage').value=p.uiLang||'ru';
  setRender(renderAll);
  bind();
  renderAll();
  persist();
}

boot();
