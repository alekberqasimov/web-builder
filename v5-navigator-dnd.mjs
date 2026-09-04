import {uid,clone,walk,findNode,findNodeWithParent,moveNode,reorderBlocks,preset} from './v5-model.mjs';
import {$,state,currentPage,mutate} from './v5-runtime.mjs';
import {elementFactories} from './v5-library.mjs';

let currentIntent=null;

export function dropZoneFromRatio(ratio,isContainer=true,hasParent=true){
  const r=Math.max(0,Math.min(1,Number(ratio)||0));
  if(isContainer&&r>=0.28&&r<=0.72)return'inside';
  if(!hasParent&&isContainer)return'inside';
  return r<0.5?'before':'after';
}

function clearMarks(){document.querySelectorAll('.nav-drop-before,.nav-drop-after,.nav-drop-inside').forEach(x=>x.classList.remove('nav-drop-before','nav-drop-after','nav-drop-inside'))}
function blockIndex(id){return currentPage().blocks.findIndex(b=>b.id===id)}
function resolveIntent(e){
  const d=state.drag;if(!d)return null;
  const blockWrap=e.target.closest('[data-tree-block]');
  const nodeRow=e.target.closest('[data-tree-node]');
  if(['block','new-block'].includes(d.kind)){
    if(!blockWrap)return null;
    const row=blockWrap.querySelector(':scope>.tree-row')||blockWrap,r=row.getBoundingClientRect();
    const zone=(e.clientY-r.top)/Math.max(1,r.height)<.5?'before':'after';
    return{mode:'block',targetBlockId:blockWrap.dataset.treeBlock,zone,row};
  }
  if(!['node','new-element'].includes(d.kind)||!nodeRow)return null;
  const targetBlockId=nodeRow.dataset.block,block=currentPage().blocks.find(b=>b.id===targetBlockId),target=block&&findNode(block.root,nodeRow.dataset.treeNode);
  if(!block||!target)return null;
  const info=findNodeWithParent(block.root,target.id),r=nodeRow.getBoundingClientRect(),ratio=(e.clientY-r.top)/Math.max(1,r.height),zone=dropZoneFromRatio(ratio,target.type==='container',!!info?.parent);
  if(zone==='inside'&&target.type==='container')return{mode:'node',zone:'inside',targetBlockId,containerId:target.id,beforeId:'',row:nodeRow};
  if(info?.parent?.type!=='container'){
    if(target.type==='container')return{mode:'node',zone:'inside',targetBlockId,containerId:target.id,beforeId:'',row:nodeRow};
    return null;
  }
  const siblings=info.parent.children,idx=siblings.findIndex(x=>x.id===target.id),beforeId=zone==='before'?target.id:(siblings[idx+1]?.id||'');
  return{mode:'node',zone,targetBlockId,containerId:info.parent.id,beforeId,row:nodeRow};
}
function mark(intent){clearMarks();if(!intent?.row)return;intent.row.classList.add(intent.zone==='inside'?'nav-drop-inside':intent.zone==='before'?'nav-drop-before':'nav-drop-after')}
function makeBlock(key){
  if(key.startsWith('preset:')){const saved=state.project.presets.find(x=>x.id===key.slice(7));if(!saved)return null;const b=clone(saved.block);b.id=uid('block');walk(b.root,n=>n.id=uid('el'));return b}
  return preset(key)
}
function addElementAt(type,blockId,containerId,beforeId=''){
  const b=currentPage().blocks.find(x=>x.id===blockId),c=b&&findNode(b.root,containerId),factory=elementFactories[type];if(!b||c?.type!=='container'||!factory)return false;
  const el=factory(),idx=beforeId?c.children.findIndex(x=>x.id===beforeId):-1;idx>=0?c.children.splice(idx,0,el):c.children.push(el);state.selectedBlockId=b.id;state.selectedNodeId=el.id;state.multi.clear();state.multi.add(el.id);state.activeRight='element';return true
}
function moveAcross(srcBlockId,nodeId,targetBlockId,containerId,beforeId=''){
  const src=currentPage().blocks.find(x=>x.id===srcBlockId),dst=currentPage().blocks.find(x=>x.id===targetBlockId);if(!src||!dst)return false;
  if(src===dst){const ok=moveNode(src,nodeId,containerId,beforeId);if(ok){state.selectedBlockId=dst.id;state.selectedNodeId=nodeId}return ok}
  const found=findNodeWithParent(src.root,nodeId),target=findNode(dst.root,containerId);if(!found?.parent||target?.type!=='container'||target.locked)return false;
  found.parent.children=found.parent.children.filter(x=>x.id!==nodeId);const idx=beforeId?target.children.findIndex(x=>x.id===beforeId):-1;idx>=0?target.children.splice(idx,0,found.node):target.children.push(found.node);state.selectedBlockId=dst.id;state.selectedNodeId=nodeId;return true
}
function applyIntent(intent,d){
  if(intent.mode==='block'){
    const target=blockIndex(intent.targetBlockId);if(target<0)return;
    const idx=target+(intent.zone==='after'?1:0);
    if(d.kind==='new-block')mutate('Add block in Navigator',()=>{const b=makeBlock(d.key);if(!b)return;currentPage().blocks.splice(idx,0,b);state.selectedBlockId=b.id;state.selectedNodeId='';state.activeRight='block'});
    else mutate('Reorder block in Navigator',()=>{let to=idx;const from=blockIndex(d.blockId);if(from>=0&&from<idx)to--;reorderBlocks(currentPage(),d.blockId,to);state.selectedBlockId=d.blockId;state.selectedNodeId=''});
    return;
  }
  if(d.kind==='new-element')mutate('Add element in Navigator',()=>addElementAt(d.key,intent.targetBlockId,intent.containerId,intent.beforeId));
  else if(d.kind==='node')mutate('Move element in Navigator',()=>moveAcross(d.blockId,d.nodeId,intent.targetBlockId,intent.containerId,intent.beforeId));
}

export function bindNavigatorDnD(){
  const tree=$('#navigatorTree');if(!tree||tree.dataset.v5NavDnd==='1')return;tree.dataset.v5NavDnd='1';
  tree.addEventListener('dragover',e=>{const i=resolveIntent(e);if(!i)return;e.preventDefault();e.stopImmediatePropagation();currentIntent=i;mark(i);if(e.dataTransfer)e.dataTransfer.dropEffect=state.drag?.kind?.startsWith('new')?'copy':'move'},true);
  tree.addEventListener('dragleave',e=>{if(!tree.contains(e.relatedTarget)){currentIntent=null;clearMarks()}},true);
  tree.addEventListener('drop',e=>{const d=state.drag,i=currentIntent||resolveIntent(e);if(!d||!i)return;e.preventDefault();e.stopImmediatePropagation();applyIntent(i,d);currentIntent=null;state.drag=null;clearMarks()},true);
  tree.addEventListener('dragend',()=>{currentIntent=null;clearMarks()},true);
}
