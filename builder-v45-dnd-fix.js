(()=>{
'use strict';
let drag=null;
const box=s=>{const b=document.createElement('div');b.innerHTML=s?.html||'';return b};
function clearMarks(){document.querySelectorAll('.v45-drop,.v45-before,.v45-after,.v45-dragging').forEach(n=>n.classList.remove('v45-drop','v45-before','v45-after','v45-dragging'))}
function move(sid,id,cellKey,targetId,before){const s=findSection(sid);if(!s||!/^layout(1|2|3|4|Grid)$/.test(s.type))return;const b=box(s),src=b.querySelector(`[data-v45-id="${CSS.escape(id)}"]`),cell=b.querySelector(`.v45-cell[data-v45-cell="${CSS.escape(cellKey)}"]`);if(!src||!cell)return;const target=targetId?b.querySelector(`[data-v45-id="${CSS.escape(targetId)}"]`):null;if(target===src)return;snapshot();if(target&&target.parentElement===cell)cell.insertBefore(src,before?target:target.nextSibling);else cell.appendChild(src);s.html=b.innerHTML;state.selected=s.id;commit();renderCanvas()}
document.addEventListener('dragstart',e=>{const el=e.target.closest?.('.v45-element');if(!el)return;const sec=el.closest('.site-section');if(!sec)return;drag={sid:sec.dataset.id,id:el.dataset.v45Id};el.classList.add('v45-dragging');try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',`${drag.sid}|${drag.id}`)}catch{}},true);
document.addEventListener('dragover',e=>{if(!drag)return;const cell=e.target.closest?.('.v45-cell');if(!cell)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();clearMarks();cell.classList.add('v45-drop');const target=e.target.closest('.v45-element');if(target&&target.dataset.v45Id!==drag.id){const r=target.getBoundingClientRect();target.classList.add(e.clientY<r.top+r.height/2?'v45-before':'v45-after')}},true);
document.addEventListener('drop',e=>{if(!drag)return;const cell=e.target.closest?.('.v45-cell');if(!cell)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const target=e.target.closest('.v45-element');const before=!!target?.classList.contains('v45-before');move(drag.sid,drag.id,cell.dataset.v45Cell,target?.dataset.v45Id||null,before);drag=null;clearMarks()},true);
document.addEventListener('dragend',()=>{drag=null;clearMarks()},true);
})();
