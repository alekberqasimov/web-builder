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

function presetButtons(count,scope){return[1,3,6,9].map(n=>`<button type="button" data-repeat-image-text-preset="${n}" data-repeat-scope="${scope}" class="${Number(count)===n?'active':''}">${n}</button>`).join('')}
function injectCountControl(panel,node,scope){
  if(!panel||!node)return;
  const selector=`[data-repeat-image-text-wrap="${scope}"]`;
  const existing=panel.querySelector(selector);
  if(existing){
    const count=node.children?.length||1,input=existing.querySelector('[data-repeat-image-text-count]');
    if(input&&document.activeElement!==input)input.value=String(count);
    existing.querySelectorAll('[data-repeat-image-text-preset]').forEach(b=>b.classList.toggle('active',Number(b.dataset.repeatImageTextPreset)===count));
    return;
  }
  const count=node.children?.length||1,box=document.createElement('fieldset');
  box.dataset.repeatImageTextWrap=scope;
  box.innerHTML=`<legend>Image + Text items</legend><div class="segmented repeat-count-presets" aria-label="Quick item count">${presetButtons(count,scope)}</div><label>Manual count (1–500)<input data-repeat-image-text-count data-repeat-scope="${scope}" type="number" min="1" max="500" inputmode="numeric" value="${count}"></label><small>Quick presets: 1 / 3 / 6 / 9. Or enter any number manually, for example 254. Existing items are preserved; new items are appended.</small>`;
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

function nodeForControl(control){return control.dataset.repeatScope==='block'?currentBlockRepeatNode():selectedRepeatNode()}
function applyCount(node,target,label='Image + Text item count'){
  if(node?.type!=='container'||node.props?.repeatTemplate!=='imageText')return;
  target=clampCount(target);
  mutate(label,()=>{
    node.children||=[];
    while(node.children.length<target)node.children.push(makeImageTextItem(node.children.length+1));
    if(node.children.length>target)node.children.length=target;
    node.props.itemCount=target;
  });
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
    const target=clampCount(input.value);input.value=String(target);
    applyCount(nodeForControl(input),target);
  });
  document.addEventListener('click',e=>{
    const preset=e.target.closest?.('[data-repeat-image-text-preset]');
    if(preset&&state.project){e.preventDefault();applyCount(nodeForControl(preset),Number(preset.dataset.repeatImageTextPreset),'Image + Text preset count');return}
    queueMicrotask(renderRepeatControls);
  },true);
  queueMicrotask(renderRepeatControls);
}

export {clampCount};