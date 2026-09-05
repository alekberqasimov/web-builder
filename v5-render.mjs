export {basePublicCss} from './v5-public.mjs';
export * from './v5-render-core.mjs';
export * from './v5-export.mjs';
import {collectCss as collectLegacyCss} from './v5-public.mjs';
import {designTokenCss} from './v6-design-tokens.mjs';
export function collectCss(project,page){return designTokenCss(project)+collectLegacyCss(project,page)}
