import {findNode,findNodeWithParent,moveNode} from './v5-model.mjs';
import {$,$$,state,currentPage,mutate} from './v5-runtime.mjs';

let bound=false,drag=null,touchTimer=null,styleReady=false;
const excluded=t=>!!t.closest?.('.v5-block-toolbar,.v5-inline-add,input,textarea,select,button');
function ensureStyle(){if(styleReady)return;styleReady=true;const s=document.createElement('style');s.textContent=`
#canvas .v5-node.pointer-element-source{opacity:.62;cursor:grabbing!important}
#canvas .v5-node.pointer-element-source *{cursor:grabbing!important}
#canvas .pointer-element-drop.drop-target{outline:2px solid #705cff!important;outline-offset:3px}
#canvas .pointer-element-drop.drop-before{box-shadow:0 -3px 0 #705cff!important}
#canvas .pointer-element-drop.drop-after{box-shadow:0 3px 0 #705cff!important}
`;document.head.appendChild(s)}
function canvas(){return $('#canvas')}
function wrap(){return $('.canvas-wrap')}
function blockById(id){return currentPage().blocks.find(b=>b.id===id)}
function clearMarks(){$$('#canvas .pointer-element-drop').forEach(x=>x.classList.remove('pointer-element-drop','drop-target','drop-before','drop-after'))}
function clearTimer(){if(touchTimer){clearTimeout(touchTimer);touchTimer=null}}
function reset(){clearTimer();clearMarks();if(drag?.source){drag.source.classList.remove('pointer-element-source');drag.source.draggable=drag.wasDraggable}drag=null}
function autoScroll(y){const w=wrap();if(!w)return;const r=w.getBoundingClientRect(),edge=72,max=22;if(y<r.top+edge)w.scrollTop-=Math.ceil(max*(1-(y-r.top)/edge));else if(y>r.bottom-edge)w.scrollTop+=Math.ceil(max*(1-(r.bottom-y)/edge))}
export function pointerElementZone(y,top,height,edgeRatio=.22){const edge=Math.min(28,Math.max(10,height*edgeRatio));if(y<=top+edge)return'before';if(y>=top+height-edge)return'after';return'inside'}
function candidateNodeFromPoint(x,y){if(!drag)return null;for(const el of document.elementsFromPoint(x,y)){const n=el.closest?.('#canvas [data-node-id]');if(!n)continue;if(n===drag.source||drag.source.contains(n))continue;return n}return null}
function planAt(x,y){const live=candidateNodeFromPoint(x,y);if(!live)return null;const sec=live.closest('[data-block-id]'),block=blockById(sec?.dataset.blockId),target=block&&findNode(block.root,live.dataset.nodeId);if(!block||!target)return null;const srcBlock=blockById(drag.blockId),srcNode=srcBlock&&findNode(srcBlock.root,drag.nodeId);if(!srcBlock||!srcNode)return null;if(srcBlock===block&&(target.id===srcNode.id||findNode(srcNode,target.id)))return null;
 const r=live.getBoundingClientRect();
 if(target.type==='container'){
   const info=findNodeWithParent(block.root,target.id),zone=info?.parent?.type==='container'?pointerElementZone(y,r.top,r.height):'inside';
   if(zone==='inside'){if(target.locked)return null;return{blockId:block.id,containerId:target.id,beforeId:'',zone,live}}
   const parent=info?.parent;if(parent?.type!=='container'||parent.locked)return null;const siblings=parent.children,idx=siblings.findIndex(n=>n.id===target.id),beforeId=zone==='before'?target.id:(siblings[idx+1]?.id||'');return{blockId:block.id,containerId:parent.id,beforeId,zone,live};
 }
 const info=findNodeWithParent(block.root,target.id);if(info?.parent?.type!=='container'||info.parent.locked)return null;const zone=y<r.top+r.height/2?'before':'after',siblings=info.parent.children,idx=siblings.findIndex(n=>n.id===target.id),beforeId=zone==='before'?target.id:(siblings[idx+1]?.id||'');return{blockId:block.id,containerId:info.parent.id,beforeId,zone,live};
}
function mark(plan){clearMarks();if(!plan)return;plan.live.classList.add('pointer-element-drop',plan.zone==='inside'?'drop-target':plan.zone==='before'?'drop-before':'drop-after')}
function activate(e){if(!drag||drag.active)return;drag.active=true;drag.source.classList.add('pointer-element-source');try{drag.source.setPointerCapture(e.pointerId)}catch{}e.preventDefault();e.stopPropagation()}
function start(e,node){const sec=node.closest('[data-block-id]'),block=blockById(sec?.dataset.blockId);if(!block||node.dataset.locked==='1')return;const info=findNodeWithParent(block.root,node.dataset.nodeId);if(!info?.parent)return;drag={pointerId:e.pointerId,pointerType:e.pointerType,blockId:block.id,nodeId:node.dataset.nodeId,startX:e.clientX,startY:e.clientY,source:node,wasDraggable:node.draggable,active:false,plan:null};node.draggable=false;if(e.pointerType==='touch'){e.stopPropagation();touchTimer=setTimeout(()=>{if(drag&&drag.pointerId===e.pointerId)activate(e)},360)}}
function move(e){if(!drag||e.pointerId!==drag.pointerId)return;const dist=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY);if(!drag.active){if(drag.pointerType==='mouse'&&dist>=5)activate(e);else return}e.preventDefault();e.stopPropagation();autoScroll(e.clientY);drag.plan=planAt(e.clientX,e.clientY);mark(drag.plan)}
function moveAcross(srcBlockId,nodeId,targetBlockId,targetContainerId,beforeId=''){let moved=false;mutate('Move element',()=>{const src=blockById(srcBlockId),dst=blockById(targetBlockId);if(!src||!dst)return;if(src===dst){moved=moveNode(src,nodeId,targetContainerId,beforeId);if(!moved)return}else{const found=findNodeWithParent(src.root,nodeId),target=findNode(dst.root,targetContainerId);if(!found?.parent||target?.type!=='container'||target.locked)return;found.parent.children=found.parent.children.filter(n=>n.id!==nodeId);const idx=beforeId?target.children.findIndex(n=>n.id===beforeId):-1;idx>=0?target.children.splice(idx,0,found.node):target.children.push(found.node);moved=true}if(moved){state.selectedBlockId=dst.id;state.selectedNodeId=nodeId;state.multi.clear();state.multi.add(nodeId);state.activeRight='element'}});return moved}
function finish(e,cancel=false){if(!drag||e.pointerId!==drag.pointerId)return;clearTimer();const d=drag,plan=d.plan,commit=d.active&&!cancel&&plan;try{d.source.releasePointerCapture(e.pointerId)}catch{}d.source.classList.remove('pointer-element-source');d.source.draggable=d.wasDraggable;drag=null;clearMarks();if(commit)moveAcross(d.blockId,d.nodeId,plan.blockId,plan.containerId,plan.beforeId);if(d.active){e.preventDefault();e.stopPropagation()}}
export function bindPointerElementDnD(){if(bound)return;bound=true;ensureStyle();document.addEventListener('pointerdown',e=>{const node=e.target.closest?.('#canvas [data-node-id]');if(!node||e.target.closest?.('.v5-block-drag')||excluded(e.target))return;start(e,node)},true);document.addEventListener('pointermove',move,{capture:true,passive:false});document.addEventListener('pointerup',e=>finish(e,false),true);document.addEventListener('pointercancel',e=>finish(e,true),true);document.addEventListener('dragstart',e=>{if(e.target.closest?.('#canvas [data-node-id]')){e.preventDefault();e.stopImmediatePropagation()}},true)}
