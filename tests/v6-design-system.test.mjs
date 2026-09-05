import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultProject} from '../v5-model.mjs';
import {exportedDocument} from '../v5-export.mjs';
import {DESIGN_PRESETS,applyDesignPreset,applyTypeScale,applyContainerPreset,applySpacingPreset,designSystemSnapshot} from '../v6-design-system.mjs';

test('design preset is non-destructive to custom css and favicon',()=>{
  const p=defaultProject();
  p.theme.customCss='.legacy-card{border-radius:37px}';
  p.theme.favicon='/favicon.svg';
  assert.equal(applyDesignPreset(p,'aurora'),true);
  assert.equal(p.theme.customCss,'.legacy-card{border-radius:37px}');
  assert.equal(p.theme.favicon,'/favicon.svg');
  assert.equal(p.theme.designPreset,'aurora');
  assert.equal(p.theme.colors.primary,DESIGN_PRESETS.aurora.colors.primary);
});

test('global design preset changes exported theme defaults without mutating local node styles',()=>{
  const p=defaultProject();
  const page=p.pages[0];
  const before=structuredClone(page.blocks);
  applyDesignPreset(p,'commerce');
  const html=exportedDocument(p,page);
  assert.match(html,/background:#0F766E/);
  assert.match(html,/width:min\(100%,1200px\)/);
  assert.match(html,/border-radius:12px/);
  assert.deepEqual(page.blocks,before,'global design preset must not rewrite saved local block styles');
});

test('type, container and spacing presets are deterministic',()=>{
  const p=defaultProject();
  assert.equal(applyTypeScale(p,'display'),true);
  assert.equal(applyContainerPreset(p,'wide'),true);
  assert.equal(applySpacingPreset(p,'comfortable'),true);
  const s=designSystemSnapshot(p);
  assert.equal(p.theme.typography.h1.size,72);
  assert.equal(s.containerWidth,1280);
  assert.equal(s.spacing,10);
  assert.equal(s.typeScale,'display');
  assert.equal(s.containerPreset,'wide');
  assert.equal(s.spacingPreset,'comfortable');
});

test('unknown presets do not mutate project',()=>{
  const p=defaultProject(),before=structuredClone(p.theme);
  assert.equal(applyDesignPreset(p,'missing'),false);
  assert.equal(applyTypeScale(p,'missing'),false);
  assert.equal(applyContainerPreset(p,'missing'),false);
  assert.equal(applySpacingPreset(p,'missing'),false);
  assert.deepEqual(p.theme,before);
});
