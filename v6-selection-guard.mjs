import {state} from './v5-runtime.mjs';

let bound=false;

function eligibleTarget(target){
  if(!target?.closest)return null;
  if(target.closest('.v5-block-toolbar,[data-inline-add],#contextMenu'))return null;
  const node=target.closest('#canvas [data-node-id]');
  const section=target.closest('#canvas [data-block-id]');
  if(!section)return null;
  return {node,section};
}

function applyFallback(blockId,nodeId,multiKey){
  if(!state.project||typeof state.render!=='function')return;
  if(nodeId){
    if(state.selectedBlockId===blockId&&state.selectedNodeId===nodeId&&state.activeRight==='element')return;
    if(multiKey&&state.selectedBlockId===blockId){
      state.multi.has(nodeId)?state.multi.delete(nodeId):state.multi.add(nodeId);
    }else{
      state.multi.clear();
      state.multi.add(nodeId);
    }
    state.selectedBlockId=blockId;
    state.selectedNodeId=nodeId;
    state.activeRight='element';
  }else{
    if(state.selectedBlockId===blockId&&!state.selectedNodeId&&state.activeRight==='block')return;
    state.multi.clear();
    state.selectedBlockId=blockId;
    state.selectedNodeId='';
    state.activeRight='block';
  }
  state.render();
}

function bind(){
  if(bound)return;
  const canvas=document.querySelector('#canvas');
  if(!canvas){setTimeout(bind,50);return}
  bound=true;
  canvas.addEventListener('click',e=>{
    const hit=eligibleTarget(e.target);if(!hit)return;
    const blockId=hit.section.dataset.blockId||'';
    const nodeId=hit.node?.dataset.nodeId||'';
    const multiKey=!!(e.ctrlKey||e.metaKey);
    // The main editor owns normal selection. This microtask only repairs selection
    // if another late-loaded module replaced or interrupted the delegated handler.
    queueMicrotask(()=>applyFallback(blockId,nodeId,multiKey));
  },true);
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
}

export {applyFallback};
