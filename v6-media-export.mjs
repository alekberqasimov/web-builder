import {escapeAttr} from './v5-core.mjs';
import {walk} from './v5-ops.mjs';

const escRe=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const validLoading=v=>['lazy','eager'].includes(v)?v:'lazy';
const validPriority=v=>['auto','high','low'].includes(v)?v:'auto';
const validDecoding=v=>['async','auto','sync'].includes(v)?v:'async';

export function imagePerformanceAttrs(node){const p=node?.props||{},attrs=[];if(String(p.srcset||'').trim())attrs.push(`srcset="${escapeAttr(String(p.srcset).trim())}"`);if(String(p.sizes||'').trim())attrs.push(`sizes="${escapeAttr(String(p.sizes).trim())}"`);attrs.push(`loading="${validLoading(p.loading||(p.lazy===false?'eager':'lazy'))}"`);attrs.push(`fetchpriority="${validPriority(p.fetchPriority||'auto')}"`);attrs.push(`decoding="${validDecoding(p.decoding||'async')}"`);return attrs.join(' ')}
export function enhanceMediaHtml(project,page,html=''){let out=String(html);for(const block of page?.blocks||[])walk(block.root,node=>{if(node.type!=='image')return;const re=new RegExp(`<img([^>]*data-node-id="${escRe(node.id)}"[^>]*)>`);out=out.replace(re,(tag,inside)=>{const clean=inside.replace(/\s(?:srcset|sizes|loading|fetchpriority|decoding)="[^"]*"/gi,'');return`<img${clean} ${imagePerformanceAttrs(node)}>`})});return out}
