import {makeImageTextItem} from './v5-model.mjs';
import {$,currentNode,mutate} from './v5-runtime.mjs';

function clampCount(value){return Math.max(1,Math.min(500,Number(value)||1))}

function renderImageTextCount(){
  const panel=$('#elementInspector'),node=currentNode();
  if(!panel||panel.classList.contains('hidden')||node?.type!=='container'||node.props?.repeatTemplate!=='imageText')return;
  const existing=panel.querySelector('[data-repeat-image-text-wrap]');
  if(existing){const input=existing.querySelector('[data-repeat-image-text-count]');if(input&&document.activeElement!==input)input.value=String(node.children?.length||1);return}
  const box=document.createElement('fieldset');
  box.dataset.repeatImageTextWrap='1';
  box.innerHTML=`<legend>Image + Text items</legend><label>Item count (1–500)<input data-repeat-image-text-count type="number" min="1" max="500" inputmode="numeric" value="${node.children?.length||1}"></label><small>Enter any number, for example 254. Existing items are preserved; new items are appended.</small>`;
  const head=panel.querySelector('.inspector-head');
  head?.after(box);
}

document.addEventListener('change',e=>{
  const input=e.target.closest?.('[data-repeat-image-text-count]');
  if(!input)return;
  const node=currentNode();
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

const panel=$('#elementInspector');
if(panel)new MutationObserver(()=>queueMicrotask(renderImageTextCount)).observe(panel,{childList:true,subtree:true});
document.addEventListener('click',()=>queueMicrotask(renderImageTextCount),true);
renderImageTextCount();

export {clampCount};