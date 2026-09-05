import {$,state,currentNode} from './v5-runtime.mjs';

function ensureLegacyBalanced(){
  if(!state.project||currentNode()?.type!=='heading')return;
  const root=$('#elementInspector');
  if(!root||root.querySelector('[data-v6-max-width="720px"]'))return;
  const group=root.querySelector('.v6-premium-design-editor .v6-layout-presets');
  if(!group)return;
  const button=document.createElement('button');
  button.type='button';
  button.dataset.v6MaxWidth='720px';
  button.textContent='Balanced';
  const tokenNarrow=group.querySelector('[data-v6-max-width="var(--wb-width-narrow)"]');
  group.insertBefore(button,tokenNarrow||group.lastElementChild||null);
}

function boot(){
  const root=$('#elementInspector');
  if(!root||!state.project){setTimeout(boot,50);return}
  let queued=false;
  const schedule=()=>{
    if(queued)return;
    queued=true;
    queueMicrotask(()=>{queued=false;ensureLegacyBalanced()});
  };
  new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  schedule();
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
}
