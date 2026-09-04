(()=>{
function addEdgeButtons(){
  if(!document.querySelector('.edge-panel-toggle.edge-left')){
    const left=document.createElement('button');left.type='button';left.className='edge-panel-toggle edge-left';left.title='Blocks / Pages';left.setAttribute('aria-label','Toggle left panel');left.textContent='◧';left.onclick=()=>typeof togglePanel==='function'&&togglePanel('left');document.body.appendChild(left);
  }
  if(!document.querySelector('.edge-panel-toggle.edge-right')){
    const right=document.createElement('button');right.type='button';right.className='edge-panel-toggle edge-right';right.title='Settings';right.setAttribute('aria-label','Toggle right panel');right.textContent='◨';right.onclick=()=>typeof togglePanel==='function'&&togglePanel('right');document.body.appendChild(right);
  }
}
function installDragAutoScroll(){
  document.addEventListener('pointermove',e=>{
    if(!window.state||!state.pointerDrag)return;
    const wrap=document.querySelector('.canvas-wrap');if(!wrap)return;
    const r=wrap.getBoundingClientRect(),zone=Math.min(90,Math.max(48,r.height*.12));
    let dy=0;if(e.clientY<r.top+zone)dy=-Math.ceil((r.top+zone-e.clientY)/5);else if(e.clientY>r.bottom-zone)dy=Math.ceil((e.clientY-(r.bottom-zone))/5);
    if(dy)wrap.scrollBy({top:dy,left:0,behavior:'auto'});
  },true);
}
function keepPanelsScrollable(){
  const refresh=()=>document.querySelectorAll('.sidebar,.canvas-wrap').forEach(el=>{el.style.minHeight='0'});
  refresh();window.addEventListener('resize',refresh,{passive:true});
}
function bootFixes(){addEdgeButtons();installDragAutoScroll();keepPanelsScrollable()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootFixes,{once:true});else bootFixes();
})();
