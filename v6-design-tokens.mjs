const clone=v=>JSON.parse(JSON.stringify(v));

export function designTokenDefaults(theme={}){return{
  spacing:{xs:4,sm:8,md:16,lg:24,xl:32,x2:48,x3:72},
  radius:{sm:8,md:14,lg:22,xl:32,pill:999},
  shadow:{sm:'0 6px 20px rgba(15,23,42,.07)',md:'0 16px 42px rgba(15,23,42,.11)',lg:'0 28px 72px rgba(15,23,42,.17)'},
  width:{narrow:720,content:Number(theme.containerWidth)||1120,wide:1320},
  motion:{fast:150,normal:220,slow:350}
}}
function mergeDefaults(base,current){const out=clone(base);for(const[k,v]of Object.entries(current||{})){if(v&&typeof v==='object'&&!Array.isArray(v)&&out[k]&&typeof out[k]==='object')out[k]={...out[k],...v};else out[k]=v}return out}
export function ensureDesignTokens(project){if(!project||typeof project!=='object')return null;project.theme||={};project.theme.designTokens=mergeDefaults(designTokenDefaults(project.theme),project.theme.designTokens||{});return project.theme.designTokens}
const px=v=>`${Math.max(0,Number(v)||0)}px`;
const ms=v=>`${Math.max(0,Number(v)||0)}ms`;
const safeShadow=v=>String(v||'none').replace(/[{};]/g,'').trim()||'none';
export function designTokenCss(project){const t=ensureDesignTokens(project)||designTokenDefaults(),c=project?.theme?.colors||{},f=project?.theme?.fonts||{};return`:root{--wb-color-primary:${c.primary||'#705cff'};--wb-color-secondary:${c.secondary||'#17142b'};--wb-color-accent:${c.accent||'#ff9d66'};--wb-color-text:${c.text||'#111827'};--wb-color-muted:${c.muted||'#667085'};--wb-color-bg:${c.background||'#ffffff'};--wb-color-surface:${c.surface||'#f7f7fb'};--wb-color-border:${c.border||'#dfe3ec'};--wb-font-heading:${f.heading||'Inter,Arial,sans-serif'};--wb-font-body:${f.body||'Inter,Arial,sans-serif'};--wb-space-xs:${px(t.spacing.xs)};--wb-space-sm:${px(t.spacing.sm)};--wb-space-md:${px(t.spacing.md)};--wb-space-lg:${px(t.spacing.lg)};--wb-space-xl:${px(t.spacing.xl)};--wb-space-2xl:${px(t.spacing.x2)};--wb-space-3xl:${px(t.spacing.x3)};--wb-radius-sm:${px(t.radius.sm)};--wb-radius-md:${px(t.radius.md)};--wb-radius-lg:${px(t.radius.lg)};--wb-radius-xl:${px(t.radius.xl)};--wb-radius-pill:${px(t.radius.pill)};--wb-shadow-sm:${safeShadow(t.shadow.sm)};--wb-shadow-md:${safeShadow(t.shadow.md)};--wb-shadow-lg:${safeShadow(t.shadow.lg)};--wb-width-narrow:${px(t.width.narrow)};--wb-width-content:${px(t.width.content)};--wb-width-wide:${px(t.width.wide)};--wb-motion-fast:${ms(t.motion.fast)};--wb-motion-normal:${ms(t.motion.normal)};--wb-motion-slow:${ms(t.motion.slow)}}`}
export const DESIGN_TOKEN_REFERENCES={
  spacing:{Tight:'var(--wb-space-sm)',Normal:'var(--wb-space-md)',Comfortable:'var(--wb-space-lg)',Spacious:'var(--wb-space-xl)',Airy:'var(--wb-space-2xl)'},
  radius:{None:'0',Small:'var(--wb-radius-sm)',Medium:'var(--wb-radius-md)',Large:'var(--wb-radius-lg)',XL:'var(--wb-radius-xl)',Pill:'var(--wb-radius-pill)'},
  shadow:{None:'none',Soft:'var(--wb-shadow-sm)',Elevated:'var(--wb-shadow-md)',Dramatic:'var(--wb-shadow-lg)'},
  width:{Narrow:'var(--wb-width-narrow)',Content:'var(--wb-width-content)',Wide:'var(--wb-width-wide)'}
};
