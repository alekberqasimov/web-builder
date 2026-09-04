let installed=false;
export function installPremiumLibraryStyles(){
  if(installed||typeof document==='undefined')return;installed=true;
  const style=document.createElement('style');style.id='v6-premium-library-style';style.textContent=`
.library-card.is-premium{position:relative;min-width:0!important;max-width:100%!important;min-height:148px!important;padding:10px!important;align-content:end!important;overflow:hidden!important;border-color:rgba(126,107,237,.32)!important;background:linear-gradient(180deg,rgba(125,105,238,.08),rgba(255,255,255,.02))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 10px 28px rgba(22,18,55,.10)!important}
.library-card.is-premium::before{width:100%!important;max-width:100%!important;height:58px!important;flex:0 0 58px!important;background:radial-gradient(circle at 78% 20%,rgba(255,255,255,.28),transparent 24%),linear-gradient(135deg,#5f4ee9 0%,#8b5cf6 52%,#d468b7 100%)!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)!important}
.library-card.is-premium>span:first-child{top:31px!important;left:14px!important;width:32px!important;max-width:32px!important;height:32px!important;overflow:hidden!important;color:#fff!important;background:rgba(12,15,28,.26)!important;border:1px solid rgba(255,255,255,.22)!important;backdrop-filter:blur(8px);font-weight:850!important}
.library-card.is-premium strong,.library-card.is-premium small{width:100%!important;max-width:100%!important;min-width:0!important;overflow-wrap:anywhere!important;word-break:break-word!important}
.library-card.is-premium strong{display:block!important;margin-top:7px!important;padding-right:2px!important;font-size:11.5px!important;line-height:1.25!important}
.library-card.is-premium small{display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden!important;min-height:25px;color:#8b95a7!important;font-size:9.2px!important;line-height:1.38!important}
.v6-premium-badge{position:absolute;top:13px;right:13px;z-index:3;display:inline-flex;align-items:center;justify-content:center;min-width:31px;max-width:calc(100% - 26px);height:18px;padding:0 6px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(11,15,29,.45);color:#fff;font-style:normal;font-size:8px;font-weight:850;letter-spacing:.08em;backdrop-filter:blur(8px)}
.library-card.is-premium:hover{transform:translateY(-2px)!important;border-color:#7d6aed!important;box-shadow:0 16px 36px rgba(53,41,130,.17)!important}
html[data-builder-theme="dark"] .library-card.is-premium{background:linear-gradient(180deg,rgba(125,105,238,.12),rgba(16,24,39,.92))!important;border-color:#3f4670!important}
html[data-builder-theme="dark"] .library-card.is-premium small{color:#9fa9bd!important}
html[data-builder-theme="light"] .library-card.is-premium{background:linear-gradient(180deg,#f1eeff 0%,#ffffff 72%)!important;border-color:#d7d0ff!important}
html[data-builder-theme="light"] .library-card.is-premium small{color:#6f7a8e!important}
@media(max-width:760px){.library-card.is-premium{min-height:142px!important}.library-card.is-premium::before{height:54px!important;flex-basis:54px!important}}
@media(max-width:350px){.library-card.is-premium{min-height:132px!important}}
`;document.head.appendChild(style);
}
