(()=>{
'use strict';
let editStart=null,editTarget=null;
const trackedIds=new Set(['backgroundColor','backgroundText','textColor','textColorText','paddingRange','contentWidth','textAlign','imageAlt','imageFit','siteUrl','siteName']);
function begin(target){if(editStart!==null)return;editStart=JSON.stringify(state.project);editTarget=target}
function finish(target){if(editStart===null)return;if(target?.isContentEditable){const sec=target.closest('.site-section');if(sec)syncSectionHtml(sec)}setTimeout(()=>{const before=editStart;editStart=null;editTarget=null;const after=JSON.stringify(state.project);if(before===after)return;if(state.history.at(-1)!==before){state.history.push(before);if(state.history.length>25)state.history.shift()}state.future=[];updateHistoryButtons();commit()},220)}
document.addEventListener('focusin',e=>{if(e.target?.isContentEditable||trackedIds.has(e.target?.id))begin(e.target)},true);
document.addEventListener('focusout',e=>{if(e.target===editTarget)finish(e.target)},true);
document.addEventListener('pointerdown',e=>{if(editStart!==null&&editTarget&&e.target!==editTarget&&!editTarget.contains?.(e.target))finish(editTarget)},true);
})();
