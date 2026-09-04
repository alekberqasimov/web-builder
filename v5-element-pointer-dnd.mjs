import {findNode,findNodeWithParent,moveNode} from './v5-model.mjs';
import {$,$$,state,currentPage,mutate} from './v5-runtime.mjs';

let bound=false,mouseDrag=null,touchDrag=null,touchTimer=null,styleReady=false,suppressClickUntil=0;
const excluded=t=>!!t.closest?.('.v5-block-toolbar,.v5-inline-add,input,textarea,select,button');
function ensureStyle(){if(styleReady)return;styleReady=true;const s=document.createElement('style');s.textContent=`
#canvas .v5-node.pointer-element-source{opacity:.62;cursor:grabbing!important;user-select:none!important}
#canvas .v5-node.pointer-element-source *{cursor:grabbing!important;user-select:none!important}
#canvas .pointer-element-drop.drop-target{outline:2px solid #705cff!important;outline-offset:3px}
#canvas .pointer-element-drop.drop-before{box-shadow:0 -3px 0 #705cff!important}
#canvas .pointer-element-drop.drop-after{box-shadow:0 3px 0 #705cff!important}
`;document.head.appendChild(s)}
function wrap(){return $('.canvas-wrap')}
function blockById(id){return currentPage().blocks.find(b=>b.id===id)}
function clearMarks(){$$('#canvas .pointer-element-drop').forEach(x=>x.classList.remove('pointer-element-drop','drop-target','drop-before','drop-after'))}
function clearTimer(){if(touchTimer){clearTimeout(touchTimer);touchTimer=null}}
function activeDrag(){return mouseDrag||touchDrag}
function restoreSource(d){if(!d?.source)return;d.source.classList.remove('pointer-element-source');d.source.draggable=d.wasDraggable}
function resetMouse(){clearMarks();restoreSource(mouseDrag);mouseDrag=null}
function resetTouch(){clearTimer();clearMarks();restoreSource(touchDrag);touchDrag=null}
function autoScroll(y){const w=wrap();if(!w)return;const r=w.getBoundingClientRect(),edge=72,max=22;if(y<r.top+edge)w.scrollTop-=Math.ceil(max*(1-(y-r.top)/edge));else if(y>r.bottom-edge)w.scrollTop+=Math.ceil(max*(1-(r.bottom-y)/edge))}
export function pointerElementZone(y,top,height,edgeRatio=.22){const edge=Math.min(28,Math.max(10,height*edgeRatio));if(y<=top+edge)return'before';if(y>=top+height-edge)return'after';return'inside'}
function candidateNodeFromPoint(d,x,y){for(const el of document.elementsFromPoint(x,y)){const n=el.closest?.('#canvas [data-node-id]');if(!n)continue;if(n===d.source||d.source.contains(n))continue;return n}return null}
function planAt(d,x,y){const live=candidateNodeFromPoint(d,x,y);if(!live)return null;const sec=live.closest('[data-block-id]'),block=blockById(sec?.dataset.blockId),target=block&&findNode(block.root,live.dataset.nodeId);if(!block||!target)return null;const srcBlock=blockById(d.blockId),srcNode=srcBlock&&findNode(srcBlock.root,d.nodeId);if(!srcBlock||!srcNode)return null;if(srcBlock===block&&(target.id===srcNode.id||findNode(srcNode,target.id)))return null;
 const r=live.getBoundingClientRect();
 if(target.type==='container'){
   const info=findNodeWithParent(block.root,target.id),zone=info?.parent?.type==='container'?pointerElementZone(y,r.top,r.height):'inside';
   if(zone==='inside'){if(target.locked)return null;return{blockId:block.id,containerId:target.id,beforeId:'',zone,live}}
   const parent=info?.parent;if(parent?.type!=='container'||parent.locked)return null;const siblings=parent.children,idx=siblings.findIndex(n=>n.id===target.id),beforeId=zone==='before'?target.id:(siblings[idx+1]?.id||'');return{blockId:block.id,containerId:parent.id,beforeId,zone,live};
 }
 const info=findNodeWithParent(block.root,target.id);if(info?.parent?.type!=='container'||info.parent.locked)return null;const zone=y<r.top+r.height/2?'before':'after',siblings=info.parent.children,idx=siblings.findIndex(n=>n.id===target.id),beforeId=zone==='before'?target.id:(siblings[idx+1]?.id||'');return{blockId:block.id,containerId:info.parent.id,beforeId,zone,live};
}
function mark(plan){clearMarks();if(!plan)return;plan.live.classList.add('pointer-element-drop',plan.zone==='inside'?'drop-target':plan.zone==='before'?'drop-before':'drop-after')}
function baseDrag(node,x,y,pointerType){const sec=node.closest('[data-block-id]'),block=blockById(sec?.dataset.blockId);if(!block||node.dataset.locked==='1')return null;const info=findNodeWithParent(block.root,node.dataset.nodeId);if(!info?.parent)return null;return{pointerType,blockId:block.id,nodeId:node.dataset.nodeId,startX:x,startY:y,source:node,wasDraggable:node.draggable,active:false,plan:null}}
function activate(d){if(!d||d.active)return;d.active=true;d.source.classList.add('pointer-element-source');d.source.draggable=false}
function moveAcross(srcBlockId,nodeId,targetBlockId,targetContainerId,beforeId=''){let moved=false;mutate('Move element',()=>{const src=blockById(srcBlockId),dst=blockById(targetBlockId);if(!src||!dst)return;if(src===dst){moved=moveNode(src,nodeId,targetContainerId,beforeId);if(!moved)return}else{const found=findNodeWithParent(src.root,nodeId),target=findNode(dst.root,targetContainerId);if(!found?.parent||target?.type!=='container'||target.locked)return;found.parent.children=found.parent.children.filter(n=>n.id!==nodeId);const idx=beforeId?target.children.findIndex(n=>n.id===beforeId):-1;idx>=0?target.children.splice(idx,0,found.node):target.children.push(found.node);moved=true}if(moved){state.selectedBlockId=dst.id;state.selectedNodeId=nodeId;state.multi.clear();state.multi.add(nodeId);state.activeRight='element'}});return moved}
function commitDrag(d){if(!d?.active||!d.plan)return false;const p=d.plan,moved=moveAcross(d.blockId,d.nodeId,p.blockId,p.containerId,p.beforeId);if(moved)suppressClickUntil=Date.now()+350;return moved}

function mouseDown(e){if(e.button!==0||touchDrag)return;const node=e.target.closest?.('#canvas [data-node-id]');if(!node||e.target.closest?.('.v5-block-drag')||excluded(e.target))return;mouseDrag=baseDrag(node,e.clientX,e.clientY,'mouse');if(!mouseDrag)return;mouseDrag.source.draggable=false}
function mouseMove(e){const d=mouseDrag;if(!d)return;const dist=Math.hypot(e.clientX-d.startX,e.clientY-d.startY);if(!d.active){if(dist<5)return;activate(d)}e.preventDefault();e.stopPropagation();autoScroll(e.clientY);d.plan=planAt(d,e.clientX,e.clientY);mark(d.plan)}
function mouseUp(e){const d=mouseDrag;if(!d)return;const shouldCommit=d.active&&d.plan;clearMarks();restoreSource(d);mouseDrag=null;if(shouldCommit)commitDrag(d);if(d.active){e.preventDefault();e.stopPropagation()}}

function touchDown(e){if(e.pointerType==='mouse'||mouseDrag)return;const node=e.target.closest?.('#canvas [data-node-id]');if(!node||e.target.closest?.('.v5-block-drag')||excluded(e.target))return;touchDrag=baseDrag(node,e.clientX,e.clientY,e.pointerType||'touch');if(!touchDrag)return;e.stopPropagation();touchTimer=setTimeout(()=>{const d=touchDrag;if(!d||d.pointerId&&d.pointerId!==e.pointerId)return;activate(d);try{d.source.setPointerCapture(e.pointerId)}catch{}},360);touchDrag.pointerId=e.pointerId}
function touchMove(e){const d=touchDrag;if(!d||e.pointerId!==d.pointerId)return;const dist=Math.hypot(e.clientX-d.startX,e.clientY-d.startY);if(!d.active){if(dist>10)resetTouch();return}e.preventDefault();e.stopPropagation();autoScroll(e.clientY);d.plan=planAt(d,e.clientX,e.clientY);mark(d.plan)}
function touchEnd(e,cancel=false){const d=touchDrag;if(!d||e.pointerId!==d.pointerId)return;clearTimer();try{d.source.releasePointerCapture(e.pointerId)}catch{}const shouldCommit=d.active&&!cancel&&d.plan;clearMarks();restoreSource(d);touchDrag=null;if(shouldCommit)commitDrag(d);if(d.active){e.preventDefault();e.stopPropagation()}}

export function bindPointerElementDnD(){if(bound)return;bound=true;ensureStyle();
 document.addEventListener('mousedown',mouseDown,true);document.addEventListener('mousemove',mouseMove,{capture:true,passive:false});document.addEventListener('mouseup',mouseUp,true);
 document.addEventListener('pointerdown',touchDown,true);document.addEventListener('pointermove',touchMove,{capture:true,passive:false});document.addEventListener('pointerup',e=>touchEnd(e,false),true);document.addEventListener('pointercancel',e=>touchEnd(e,true),true);
 document.addEventListener('dragstart',e=>{if(e.target.closest?.('#canvas [data-node-id]')){e.preventDefault();e.stopImmediatePropagation()}},true);
 document.addEventListener('click',e=>{if(Date.now()<suppressClickUntil&&e.target.closest?.('#canvas [data-node-id]')){e.preventDefault();e.stopImmediatePropagation()}},true)
}
