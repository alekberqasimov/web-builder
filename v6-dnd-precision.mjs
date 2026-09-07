import {uid,clone,walk,preset,reorderBlocks} from './v5-model.mjs';
import {state,currentPage,mutate} from './v5-runtime.mjs';

const MARKER_CLASS='v6-precision-block-marker';
let marker=null;

export function precisionBlockDropIndex(y,boxes=[]){
  for(let i=0;i<boxes.length;i++){
    const r=boxes[i];
    if(y<r.top+r.height/2)return i;
  }
  return boxes.length;
}

function canvas(){return document.querySelector('#canvas')}
function canvasWrap(){return document.querySelector('.canvas-wrap')}
function clearMarker(){marker?.remove();marker=null}
function liveSections(drag=state.drag){
  const exclude=drag?.kind==='block'?drag.blockId:'';
  return [...document.querySelectorAll('#canvas>[data-block-id]')].filter(x=>x.dataset.blockId!==exclude);
}
function dropIndex(y,drag=state.drag){return precisionBlockDropIndex(y,liveSections(drag).map(x=>x.getBoundingClientRect()))}
function showMarker(y,drag=state.drag){
  clearMarker();
  const c=canvas();if(!c)return;
  const sections=liveSections(drag),idx=dropIndex(y,drag);
  marker=document.createElement('div');
  marker.className=MARKER_CLASS;
  marker.setAttribute('aria-hidden','true');
  marker.innerHTML='<span>Drop here</span>';
  sections[idx]?c.insertBefore(marker,sections[idx]):c.appendChild(marker);
}
function autoScroll(y){
  const w=canvasWrap();if(!w)return;
  const r=w.getBoundingClientRect(),edge=84,max=28;
  if(y<r.top+edge)w.scrollTop-=Math.ceil(max*(1-(y-r.top)/edge));
  else if(y>r.bottom-edge)w.scrollTop+=Math.ceil(max*(1-(r.bottom-y)/edge));
}
function makeBlock(key){
  if(String(key||'').startsWith('preset:')){
    const saved=state.project?.presets?.find(x=>x.id===String(key).slice(7));
    if(!saved)return null;
    const b=clone(saved.block);b.id=uid('block');walk(b.root,n=>n.id=uid('el'));return b;
  }
  try{return preset(key)}catch{return null}
}
function commitDrop(d,idx){
  if(d.kind==='new-block'){
    mutate('Drop block precisely',()=>{
      const b=makeBlock(d.key);if(!b)return;
      const page=currentPage(),to=Math.max(0,Math.min(idx,page.blocks.length));
      page.blocks.splice(to,0,b);
      state.selectedBlockId=b.id;state.selectedNodeId='';state.activeRight='block';
    });
    return;
  }
  if(d.kind==='block'){
    mutate('Reorder block precisely',()=>{
      const page=currentPage();
      const max=Math.max(0,page.blocks.length-1),to=Math.max(0,Math.min(idx,max));
      reorderBlocks(page,d.blockId,to);
      state.selectedBlockId=d.blockId;state.selectedNodeId='';state.activeRight='block';
    });
  }
}
function isCanvasBlockDnD(e){
  const d=state.drag;
  return !!d&&['block','new-block'].includes(d.kind)&&!!e.target.closest?.('#canvas');
}
function ensureStyle(){
  if(document.getElementById('v6PrecisionDnDStyle'))return;
  const s=document.createElement('style');s.id='v6PrecisionDnDStyle';
  s.textContent=`.${MARKER_CLASS}{height:4px!important;min-height:4px!important;margin:4px 8px!important;position:relative;background:#705cff!important;border-radius:999px;box-shadow:0 0 0 3px rgba(112,92,255,.16),0 8px 24px rgba(112,92,255,.24);pointer-events:none;z-index:96}.${MARKER_CLASS}>span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:3px 8px;border-radius:999px;background:#705cff;color:#fff;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.02em;white-space:nowrap}.v5-section.pointer-block-source{opacity:.62!important}`;
  document.head.append(s);
}
function bind(){
  ensureStyle();
  document.addEventListener('dragover',e=>{
    if(!isCanvasBlockDnD(e))return;
    e.preventDefault();e.stopImmediatePropagation();
    if(e.dataTransfer)e.dataTransfer.dropEffect=state.drag.kind==='new-block'?'copy':'move';
    autoScroll(e.clientY);showMarker(e.clientY,state.drag);
  },true);
  document.addEventListener('drop',e=>{
    if(!isCanvasBlockDnD(e))return;
    const d=state.drag,idx=dropIndex(e.clientY,d);
    e.preventDefault();e.stopImmediatePropagation();
    clearMarker();commitDrop(d,idx);state.drag=null;
  },true);
  document.addEventListener('dragend',clearMarker,true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')clearMarker()},true);
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
}
