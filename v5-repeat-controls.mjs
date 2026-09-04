import {makeImageTextItem} from './v5-model.mjs';
import {$,state,currentNode,mutate} from './v5-runtime.mjs';

function clampCount(value){return Math.max(1,Math.min(500,Number(value)||1))}

function selectedRepeatNode(){
  if(!state.project)return null;
  try{return currentNode()}catch{return null}
}

export function renderRepeatControls(){
  const panel=$('#elementInspector');
  if(!panel||!state.project||panel.classList.contains('hidden'))return;
  const node=selectedRepeatNode();
  if(node?.type!=='container'||node.props?.repeatTemplate!=='imageText')return;
  const existing=panel.querySelector('[data-repeat-image-text-wrap]');
  if(existing){
    const input=existing.querySelector('[data-repeat-image-text-count]');
    if(input&&document.activeElement!==input)input.value=String(node.children?.length||1);
    return;
  }
  const box=document.createElement('fieldset');
  box.dataset.repeatImageTextWrap='1';
  box.innerHTML=`<legend>Image + Text items</legend><label>Item count (1–500)<input data-repeat-image-text-count type="number" min="1" max="500" inputmode="numeric" value="${node.children?.length||1}"></label><small>Enter any number, for example 254. Existing items are preserved; new items are appended.</small>`;
  panel.querySelector('.inspector-head')?.after(box);
}

export function bindRepeatControls(){
  if(document.body.dataset.repeatControlsBound==='1')return;
  document.body.dataset.repeatControlsBound='1';
  const panel=$('#elementInspector');
  if(panel)new MutationObserver(()=>queueMicrotask(renderRepeatControls)).observe(panel,{childList:true,subtree:true});
  document.addEventListener('change',e=>{
    const input=e.target.closest?.('[data-repeat-image-text-count]');
    if(!input||!state.project)return;
    const node=selectedRepeatNode();
    if(node?.type!=='container'||node.props?.repeatTemplate!=='imageText')return;
    const target=clampCount(input.value);
    input.value=String(target);
    mutate('Image + Text item count',()=>{
      node.children||=[];
      while(node.children.length<target)node.children.push(makeImageTextItem(node.children.length+1));
      if(node.children.length>target)node.children.length=target;
      node.props.itemCount=target;
    });
  });
  document.addEventListener('click',()=>queueMicrotask(renderRepeatControls),true);
  queueMicrotask(renderRepeatControls);
}

export {clampCount};