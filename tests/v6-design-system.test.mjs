import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject,preset,walk} from '../v5-model.mjs';
import {ensureDesignTokens,designTokenCss,DESIGN_TOKEN_REFERENCES} from '../v6-design-tokens.mjs';
import {imagePerformanceAttrs,enhanceMediaHtml} from '../v6-media-export.mjs';
import {exportedDocument} from '../v5-export.mjs';

test('global design tokens are backward-compatible and export as CSS variables',()=>{
  const project=defaultProject();
  assert.equal(project.theme.designTokens,undefined);
  const tokens=ensureDesignTokens(project);
  assert.equal(tokens.width.content,project.theme.containerWidth);
  tokens.spacing.md=20;
  tokens.radius.lg=26;
  const css=designTokenCss(project);
  assert.ok(css.includes('--wb-space-md:20px'));
  assert.ok(css.includes('--wb-radius-lg:26px'));
  assert.equal(DESIGN_TOKEN_REFERENCES.spacing.Normal,'var(--wb-space-md)');
});

test('token references and responsive auto-fit grid survive static export',()=>{
  const project=defaultProject(),page=project.pages[0],block=preset('layout1'),root=block.root;
  ensureDesignTokens(project).spacing.lg=28;
  root.props.layout='grid';root.props.gridMode='auto-fit';root.props.gridMinWidth=260;
  root.style.base.display='grid';root.style.base.gridTemplateColumns='repeat(auto-fit,minmax(260px,1fr))';root.style.base.gap='var(--wb-space-lg)';
  root.style.mobile.gridTemplateColumns='1fr';
  page.blocks.push(block);
  const html=exportedDocument(project,page);
  assert.ok(html.includes('--wb-space-lg:28px'));
  assert.ok(html.includes('grid-template-columns:repeat(auto-fit,minmax(260px,1fr))'));
  assert.ok(html.includes('gap:var(--wb-space-lg)'));
  assert.ok(html.includes('@media(max-width:760px)'));
});

test('Media Studio exports responsive native image performance attributes',()=>{
  const project=defaultProject(),page=project.pages[0],block=preset('imageText');
  let image=null;walk(block.root,n=>{if(!image&&n.type==='image')image=n});
  assert.ok(image);
  image.props.src='https://cdn.example/image-1280.jpg';
  image.props.srcset='https://cdn.example/image-640.jpg 640w, https://cdn.example/image-1280.jpg 1280w';
  image.props.sizes='(max-width: 760px) 100vw, 50vw';
  image.props.loading='eager';image.props.fetchPriority='high';image.props.decoding='async';
  image.style.base.filter='saturate(1.06) contrast(1.03)';
  image.style.base.clipPath='circle(50% at 50% 50%)';
  page.blocks.push(block);
  const html=exportedDocument(project,page);
  assert.ok(html.includes('srcset="https://cdn.example/image-640.jpg 640w, https://cdn.example/image-1280.jpg 1280w"'));
  assert.ok(html.includes('sizes="(max-width: 760px) 100vw, 50vw"'));
  assert.ok(html.includes('loading="eager"'));
  assert.ok(html.includes('fetchpriority="high"'));
  assert.ok(html.includes('decoding="async"'));
  assert.ok(html.includes('filter:saturate(1.06) contrast(1.03)'));
  assert.ok(html.includes('clip-path:circle(50% at 50% 50%)'));
});

test('media enhancer replaces legacy loading without duplicating attributes',()=>{
  const node={id:'img-1',type:'image',props:{loading:'eager',fetchPriority:'low',decoding:'sync',srcset:'a.jpg 1x',sizes:'100vw'}};
  const page={blocks:[{root:node}]};
  const attrs=imagePerformanceAttrs(node);
  assert.ok(attrs.includes('fetchpriority="low"'));
  const html=enhanceMediaHtml({},page,'<img data-node-id="img-1" src="a.jpg" loading="lazy">');
  assert.equal((html.match(/loading=/g)||[]).length,1);
  assert.ok(html.includes('loading="eager"'));
  assert.ok(html.includes('srcset="a.jpg 1x"'));
});
