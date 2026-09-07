import './v6-reuse-core.mjs';
import './v6-reuse-guard.mjs';
import './v6-advanced-layout.mjs';
import './v6-schema-builder.mjs';
import './v6-dnd-precision.mjs';
import './v6-nav-config.mjs';
export * from './v6-reuse-core.mjs';

// Final editor-shell accessibility guard. This entry point loads after the visual layers,
// so these contrast values cannot be accidentally weakened by an earlier theme stylesheet.
if(typeof document!=='undefined'){
  let style=document.getElementById('v6EditorContrastGuard');
  if(!style){
    style=document.createElement('style');
    style.id='v6EditorContrastGuard';
    style.textContent='html[data-builder-theme="light"][data-editor-premium="2"] .breadcrumb,html[data-builder-theme="light"][data-editor-premium="2"] .save-status{color:#47556c!important}html[data-builder-theme="light"][data-editor-premium="2"] .search input::placeholder{color:#526177!important}';
    document.head.append(style);
  }
}