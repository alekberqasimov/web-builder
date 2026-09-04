(()=>{
'use strict';
const previousExport=exportedDocument;
function v4ExportCss(){
  const t=state.project?.theme||{};
  const bodyFont=t.bodyFont||'Inter, Arial, sans-serif',headingFont=t.headingFont||bodyFont,bodySize=Number(t.bodySize)||18,primary=t.primary||'#705cff',radius=Number(t.buttonRadius)||9;
  return `.section-content{font-family:${bodyFont}}.section-content h1,.section-content h2,.section-content h3,.logo-text{font-family:${headingFont}}.section-content p:not([data-v4-responsive]){font-size:${bodySize}px}.web-btn{background:${primary};border-radius:${radius}px}[data-v4-responsive]{font-size:var(--v4-fs-d,inherit)!important;width:var(--v4-w-d,auto)!important;max-width:100%}.v4-responsive-grid{display:grid!important;grid-template-columns:repeat(var(--v4-cols-d,3),minmax(0,1fr))!important;gap:var(--v4-grid-gap,14px)!important}.custom-stack.v4-row-layout{display:flex!important;flex-direction:row!important;flex-wrap:var(--v4-wrap,wrap);align-items:var(--v4-align,stretch);justify-content:var(--v4-justify,flex-start);gap:var(--v4-gap,18px)}.custom-stack.v4-column-layout{display:flex!important;flex-direction:column!important;gap:var(--v4-gap,18px)}.custom-stack.v4-grid-layout{display:grid!important;grid-template-columns:repeat(var(--v4-cols,2),minmax(0,1fr))!important;gap:var(--v4-gap,18px)}.custom-stack>.custom-item{min-width:0;flex:0 1 var(--v4-w-d,var(--v4-item-w,auto))}.v4-hidden-desktop{display:none!important}.v4-menu-items{display:flex;gap:20px;flex-wrap:wrap}.v4-menu-items a,.v4-export-link{color:inherit;text-decoration:none}@media(max-width:1180px){[data-v4-responsive]{font-size:var(--v4-fs-t,var(--v4-fs-d,inherit))!important;width:var(--v4-w-t,var(--v4-w-d,auto))!important}.v4-responsive-grid{grid-template-columns:repeat(var(--v4-cols-t,var(--v4-cols-d,2)),minmax(0,1fr))!important}.custom-stack>.custom-item{flex-basis:var(--v4-w-t,var(--v4-w-d,var(--v4-item-w,auto)))}.v4-hidden-tablet{display:none!important}}@media(max-width:760px){[data-v4-responsive]{font-size:var(--v4-fs-m,var(--v4-fs-t,var(--v4-fs-d,inherit)))!important;width:var(--v4-w-m,var(--v4-w-t,var(--v4-w-d,auto)))!important}.v4-responsive-grid{grid-template-columns:repeat(var(--v4-cols-m,1),minmax(0,1fr))!important}.custom-stack.v4-row-layout{flex-direction:column!important}.custom-stack.v4-grid-layout{grid-template-columns:1fr!important}.custom-stack>.custom-item{flex-basis:auto;width:var(--v4-w-m,var(--v4-w-t,var(--v4-w-d,auto)))!important}.v4-hidden-mobile{display:none!important}.v4-menu-items{width:100%;flex-direction:column}}`;
}
exportedDocument=page=>{
  let html=previousExport(page);
  html=html.replace('</head>',`<style id="v4-final-export">${v4ExportCss()}</style></head>`);
  return html;
};
})();
