import {state} from './v5-runtime.mjs';

function clearAllRefs(value){
  if(!value||typeof value!=='object')return 0;
  let cleared=0;
  if(value.componentRef){value.componentRef='';cleared++}
  if(value.root)cleared+=clearAllRefs(value.root);
  for(const child of value.children||[])cleared+=clearAllRefs(child);
  return cleared;
}

function sanitizeNodeTree(node,insideLinked=false){
  if(!node||typeof node!=='object')return 0;
  let cleared=0;
  const ownsLink=!insideLinked&&!!node.componentRef;
  if(insideLinked&&node.componentRef){node.componentRef='';cleared++}
  const nextInside=insideLinked||ownsLink;
  for(const child of node.children||[])cleared+=sanitizeNodeTree(child,nextInside);
  return cleared;
}

/**
 * Enforces a strict non-nesting invariant for reusable component references.
 * Component definitions never store references to other components, and a
 * linked instance may not contain another linked instance below its root.
 * Concrete content is preserved; only the nested link metadata is detached.
 */
export function enforceComponentReferenceInvariant(project){
  if(!project||typeof project!=='object')return 0;
  let cleared=0;
  for(const def of project.components||[])cleared+=clearAllRefs(def?.template);
  for(const page of project.pages||[]){
    for(const block of page.blocks||[]){
      if(block.componentRef){
        if(block.root)cleared+=clearAllRefs(block.root);
      }else if(block.root){
        cleared+=sanitizeNodeTree(block.root,false);
      }
    }
  }
  return cleared;
}

function wrapRender(){
  if(typeof state.render!=='function'||state.render.__v6ReuseGuardWrapped)return false;
  const base=state.render;
  const wrapped=(...args)=>{
    enforceComponentReferenceInvariant(state.project);
    return base(...args);
  };
  wrapped.__v6ReuseGuardWrapped=true;
  state.render=wrapped;
  return true;
}

function boot(){
  if(!state.project||typeof state.render!=='function'){setTimeout(boot,60);return}
  enforceComponentReferenceInvariant(state.project);
  wrapRender();
}

if(typeof document!=='undefined'){
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
}
