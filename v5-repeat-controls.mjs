import {makeImageTextItem} from './v5-model.mjs';
import {$,state,currentBlock,currentNode,mutate} from './v5-runtime.mjs';

function clampCount(value){return Math.max(1,Math.min(500,Number(value)||1))}

function selectedRepeatNode(){
  if(!state.project)return null;
  try{return currentNode()}catch{return null}
}

function findImageTextGrid(root){
  if(!root)return null;
  if(root.type==='container'&&root.props?.repeatTemplate==='imageText')return root;
  for(const child of root.children||[]){const found=findImageTextGrid(child);if(found)return found}
  return null;
}

function currentBlockRepeatNode(){
  if(!state.project)return null;
  try{return findImageTextGrid(currentBlock()?.root)}catch{return null}
}

function injectCountControl(panel,node,scope){
  if(!panel||!node)return;
  const selector=`[data-repeat-image-text-wrap="${scope}"]`;
  const existing=panel.querySelector(selector);
  if(existing){
    const input=existing.querySelector('[data-repeat-image-text-count]');
    if(input&&document.activeElement!==input)input.value=String(node.children?.length||1);
    return;
  }
  const box=document.createElement('fieldset');
  box.dataset.repeatImageTextWrap=scope;
  box.innerHTML=`<legend>Image + Text items</legend><label>Item count (1–500)<input data-repeat-image-text-count data-repeat-scope="${scope}" type="number" min="1" max="500" inputmode="numeric" value="${node.children?.length||1}"></label><small>Enter any number, for example 254. Existing items are preserved; new items are appended.</small>`;
  panel.querySelector('.inspector-head')?.after(box);
}

export function renderRepeatControls(){
  if(!state.project)return;
  const blockPanel=$('#blockInspector');
  if(blockPanel&&!blockPanel.classList.contains('hidden'))injectCountControl(blockPanel,currentBlockRepeatNode(),'block');
  const elementPanel=$('#elementInspector');
  if(elementPanel&&!elementPanel.classList.contains('hidden')){
    const node=selectedRepeatNode();
    if(node?.type==='container'&&node.props?.repeatTemplate==='imageText')injectCountControl(elementPanel,node,'element');
  }
}

function nodeForInput(input){
  return input.dataset.repeatScope==='block'?currentBlockRepeatNode():selectedRepeatNode();
}

export function bindRepeatControls(){
  if(document.body.dataset.repeatControlsBound==='1')return;
  document.body.dataset.repeatControlsBound='1';
  for(const selector of['#blockInspector','#elementInspector']){
    const panel=$(selector);
    if(panel)new MutationObserver(()=>queueMicrotask(renderRepeatControls)).observe(panel,{childList:true,subtree:true});
  }
  document.addEventListener('change',e=>{
    const input=e.target.closest?.('[data-repeat-image-text-count]');
    if(!input||!state.project)return;
    const node=nodeForInput(input);
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