// Trust boundaries for imported project data and public resource URLs.
export function safeResourceUrl(value,{image=false}={}){
 const s=String(value||'').trim();
 if(!s||/[\u0000-\u001f\u007f]/.test(s))return '';
 if(image&&/^data:image\/(?:png|jpeg|gif|webp|avif|svg\+xml)[;,]/i.test(s))return s;
 if(/^(?:https?:\/\/|blob:)/i.test(s))return s;
 if(/^[a-z][a-z0-9+.-]*:/i.test(s)||s.startsWith('//')||s.includes('\\'))return '';
 return s;
}
export function safeNavigationUrl(value){
 const s=String(value||'').trim();
 if(!s||/[\u0000-\u001f\u007f]/.test(s))return '#';
 if(/^(https?:\/\/|mailto:|tel:|#|\/)/i.test(s)&&!s.includes('\\'))return s;
 if(/^[a-z][a-z0-9+.-]*:/i.test(s)||s.includes('\\'))return '#';
 return `https://${s}`;
}
export function validateProjectInput(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||!Array.isArray(input.pages)||!input.pages.length)throw new Error('Project must contain at least one page.');
 if(input.schemaVersion&&Number(input.schemaVersion)>5)throw new Error('This project needs a newer builder version.');
 let count=0;const stack=[{v:input,depth:0}];
 while(stack.length){const {v,depth}=stack.pop();if(!v||typeof v!=='object')continue;if(depth>80||++count>100000)throw new Error('Project exceeds supported size or nesting.');for(const k of Object.keys(v)){if(['__proto__','prototype','constructor'].includes(k))throw new Error('Unsafe project property.');stack.push({v:v[k],depth:depth+1})}}
 for(const page of input.pages){if(!page||typeof page!=='object')throw new Error('Invalid page.');const blocks=page.blocks||page.sections;if(!Array.isArray(blocks))throw new Error('Invalid page blocks.');for(const block of blocks){if(!block||typeof block!=='object')throw new Error('Invalid block.');if(input.schemaVersion===5&&!block.root)throw new Error('Missing block root.');if(block.root){const nodes=[block.root];while(nodes.length){const n=nodes.pop();if(!n||typeof n.type!=='string'||!n.props||typeof n.props!=='object'||!Array.isArray(n.children))throw new Error('Invalid element.');nodes.push(...n.children)}}}}
 return input;
}
export function validateExportPaths(paths){
 const seen=new Set();
 for(const path of paths){if(typeof path!=='string'||path.length>180||!path.endsWith('.html')||path.startsWith('/')||path.includes('\\')||/[:\x00-\x1f\x7f?#%]/.test(path)||path.split('/').some(p=>!p||p==='.'||p==='..'||p.endsWith('.')||p.endsWith(' ')))throw new Error(`Unsafe export path: ${path}`);const key=path.toLowerCase();if(seen.has(key))throw new Error(`Duplicate export path: ${path}`);seen.add(key)}
 return paths;
}
export const cssAttributeValue=value=>String(value||'').replace(/["\\\n\r\f]/g,c=>'\\'+c.codePointAt(0).toString(16)+' ');
