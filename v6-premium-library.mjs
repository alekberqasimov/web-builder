let installed=false;
export function installPremiumLibraryStyles(){
 if(installed||typeof document==='undefined')return;installed=true;
 const style=document.createElement('style');style.id='v6-premium-library-style';style.textContent=`
.library-item{position:relative;min-width:0}.library-item>.library-card{width:100%;height:100%}.library-item>.v5-fav-star{position:absolute;z-index:4}.library-item[hidden]{display:none!important}
#blockList{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#blockList .library-card{position:relative;display:flex!important;flex-direction:column;align-items:stretch!important;justify-content:flex-start!important;gap:0;min-width:0!important;max-width:100%!important;min-height:166px!important;padding:9px!important;background:var(--panel)!important;border:1px solid var(--border)!important;border-radius:12px!important;box-shadow:none!important;text-align:left;transition:border-color .15s ease,box-shadow .15s ease}
#blockList .library-card::before{display:none!important}
#blockList .library-card>.catalog-thumb{position:static!important;display:block!important;flex:none!important;width:100%!important;max-width:none!important;height:auto!important;padding:0!important;transform:none!important;background:none!important;border:0!important;box-shadow:none!important;border-radius:6px;overflow:hidden}
.catalog-thumb svg{display:block;width:100%;height:auto}
#blockList .library-card strong{display:block!important;width:100%;margin-top:10px!important;white-space:normal;font-size:12px!important;font-weight:650!important;line-height:1.4!important;color:var(--text);overflow-wrap:anywhere}
#blockList .library-card small{display:block;margin-top:4px;color:var(--muted);font-size:10px;line-height:1.45;overflow-wrap:anywhere}
#blockList .library-card:hover{border-color:var(--primary,#7162dd)!important;box-shadow:0 3px 12px rgba(20,30,50,.08)!important;transform:none!important}
#blockList .library-card:focus-visible{outline:2px solid var(--primary,#7162dd);outline-offset:2px}
.v6-premium-badge{position:absolute;left:14px;top:14px;padding:2px 5px;border-radius:4px;background:#fff;color:#5341ad;font-size:8px;font-weight:750;font-style:normal;letter-spacing:.07em}
#blockList .v5-fav-star{top:12px!important;right:12px!important;background:#fff!important;color:#5341ad!important;border-radius:5px}
.catalog-empty{grid-column:1/-1;margin:8px 0;padding:20px 12px;border:1px dashed var(--border);border-radius:12px;font-size:13px;line-height:1.6;color:var(--muted)}
#blockList .library-card[hidden],#elementList .library-card[hidden]{display:none!important}
#saveStatus[data-save-state="error"]{color:#b42318}#saveStatus[data-save-state="error"]::before{background:#b42318}
@media(prefers-reduced-motion:reduce){#blockList .library-card{transition:none}}
`;document.head.appendChild(style);
}
