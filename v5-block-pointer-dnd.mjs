import {reorderBlocks} from './v5-model.mjs';
import {$,$$,state,currentPage,mutate} from './v5-runtime.mjs';

let bound=false,drag=null,marker=null,styleReady=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function ensureStyle(){if(styleReady)return;styleReady=true;const s=document.createElement('style');s.textContent=`
.v5-block-drag{touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}
.v5-block-drag.pointer-dragging{cursor:grabbing}
.v5-section.pointer-block-source{opacity:.72}
.block-drop-marker.pointer-marker{height:3px!important;min-height:3px!important;margin:2px 0!important;background:#705cff!important;border-radius:999px;box-shadow:0 0 0 2px color-mix(in srgb,#705cff 20%,transparent)}
`;document.head.appendChild(s)}
function canvas(){return $('#canvas')}
function wrap(){return $('.canvas-wrap')}
function clearMarker(){marker?.remove();marker=null}
function clearVisual(){clearMarker();$$('.pointer-block-source').forEach(x=>x.classList.remove('pointer-block-source'));$$('.pointer-dragging').forEach(x=>x.classList.remove('pointer-dragging'))}
function liveBlocks(exclude=''){return $$('#canvas>[data-block-id]').filter(x=>x.dataset.blockId!==exclude)}
export function pointerBlockDropIndex(y,boxes){for(let i=0;i<boxes.length;i++)if(y<boxes[i].top+boxes[i].height/2)return i;return boxes.length}
function indexAt(y){return pointerBlockDropIndex(y,liveBlocks(drag?.blockId).map(x=>x.getBoundingClientRect()))}
function showMarker(y){clearMarker();const c=canvas();if(!c||!drag)return;const secs=liveBlocks(drag.blockId),idx=indexAt(y);marker=document.createElement('div');marker.className='block-drop-marker pointer-marker';if(secs[idx])c.insertBefore(marker,secs[idx]);else c.appendChild(marker);drag.index=idx}
function autoScroll(y){const w=wrap();if(!w)return;const r=w.getBoundingClientRect(),edge=72,max=24;if(y<r.top+edge)w.scrollTop-=Math.ceil(max*(1-(y-r.top)/edge));else if(y>r.bottom-edge)w.scrollTop+=Math.ceil(max*(1-(r.bottom-y)/edge))}
function start(e,handle){const sec=handle.closest('#canvas>[data-block-id]');if(!sec)return;handle.draggable=false;drag={pointerId:e.pointerId,blockId:sec.dataset.blockId,startX:e.clientX,startY:e.clientY,index:null,active:false,handle};try{handle.setPointerCapture(e.pointerId)}catch{}handle.classList.add('pointer-dragging');sec.classList.add('pointer-block-source');e.preventDefault();e.stopPropagation()}
function move(e){if(!drag||e.pointerId!==drag.pointerId)return;const dist=Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY);if(!drag.active&&dist<5)return;drag.active=true;e.preventDefault();e.stopPropagation();autoScroll(e.clientY);showMarker(e.clientY)}
function finish(e,cancel=false){if(!drag||e.pointerId!==drag.pointerId)return;const d=drag;drag=null;try{d.handle.releasePointerCapture(e.pointerId)}catch{}d.handle.draggable=true;const shouldCommit=d.active&&!cancel&&Number.isInteger(d.index);clearVisual();if(shouldCommit){const page=currentPage();const old=page.blocks.findIndex(b=>b.id===d.blockId);const filtered=page.blocks.filter(b=>b.id!==d.blockId);const target=clamp(d.index,0,filtered.length);const currentInFiltered=old<0?-1:Math.min(old,filtered.length);if(old>=0&&target!==currentInFiltered)mutate('Reorder block',()=>reorderBlocks(currentPage(),d.blockId,target))}e.preventDefault();e.stopPropagation()}
export function bindPointerBlockDnD(){if(bound)return;bound=true;ensureStyle();document.addEventListener('pointerdown',e=>{const h=e.target.closest?.('#canvas .v5-block-drag');if(h)start(e,h)},true);document.addEventListener('pointermove',move,{capture:true,passive:false});document.addEventListener('pointerup',e=>finish(e,false),true);document.addEventListener('pointercancel',e=>finish(e,true),true);document.addEventListener('dragstart',e=>{if(e.target.closest?.('#canvas .v5-block-drag'))e.preventDefault()},true)}
