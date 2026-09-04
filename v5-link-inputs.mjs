import {$,state,currentNode} from './v5-runtime.mjs';

export function linkTargetUsesTextInput(type=''){return ['url','email','phone'].includes(String(type))}

function placeholder(type){if(type==='email')return 'name@example.com';if(type==='phone')return '+994501234567';return 'https://example.com'}

export function enhanceLinkTargetInput(){
  if(state.activeRight!=='element')return;
  const node=currentNode();
  if(!node)return;
  const type=$('#elementInspector [data-link="type"]')?.value||node.props?.link?.type||'none';
  const current=$('#elementInspector [data-link-target]');
  if(!current||!linkTargetUsesTextInput(type)||current.tagName==='INPUT')return;
  const input=document.createElement('input');
  input.setAttribute('data-link-target','1');
  input.value=node.props?.link?.value||current.value||'';
  input.placeholder=placeholder(type);
  input.autocomplete='off';
  current.replaceWith(input);
}
