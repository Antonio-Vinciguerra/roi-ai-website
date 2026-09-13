import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { landscapeFrame } from '../scene-math.mjs';
import { capabilityCards } from '../experience-render.mjs';

test('landscape blending is continuous, reversible and bounded at phone and desktop sizes', () => {
  for (const height of [240, 480, 640, 900, 1600]) {
    let previous = 0;
    for (let top = height * 2; top >= -height; top -= height / 200) {
      const frame = landscapeFrame(top, height, 1);
      assert.ok(frame.opacity >= 0 && frame.opacity <= 1);
      assert.ok(frame.opacity >= previous);
      assert.ok(frame.opacity - previous < .02);
      assert.ok(Math.abs(frame.shift) <= 18);
      assert.deepEqual(frame, landscapeFrame(top, height, 1));
      previous = frame.opacity;
    }
    assert.equal(landscapeFrame(height, height, 0).opacity, 1);
    assert.equal(landscapeFrame(height, height, 1).opacity, 0);
    assert.equal(landscapeFrame(0, height, 1).opacity, 1);
  }
});
test('chapters and links exist without scripts, tab controls or hidden panels', () => {
  const html = capabilityCards();
  assert.equal([...html.matchAll(/data-chapter="/g)].length, 3);
  for (const key of ['operate','grow','invest']) {
    assert.ok(html.includes('id="capability-' + key + '"'));
    assert.ok(html.includes('href="' + key + '.html"'));
    assert.ok(html.includes('aria-labelledby="title-' + key + '"'));
  }
  assert.doesNotMatch(html,/capability-controls|inert|role="tab/);
});
test('home leads into the photographic story and keeps detailed tools in native disclosures', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.ok(html.indexOf('id="capabilities"') < html.indexOf('id="challenge"'));
  assert.equal([...html.matchAll(/<details class="story-detail">/g)].length, 4);
  for (const key of ['operate','grow','invest']) assert.ok(html.includes('href="#capability-' + key + '"'));
});
test('scroll narration has no input interception, panel hiding or timed advancement', async () => {
  const js = await readFile(new URL('../motion.js', import.meta.url), 'utf8');
  assert.doesNotMatch(js,/preventDefault|scrollTo\(|setInterval|setTimeout|\.inert\s*=/);
  assert.match(js,/prefers-reduced-motion/);
  assert.match(js,/visibilitychange/);
  const css = await readFile(new URL('../narrative.css', import.meta.url), 'utf8');
  assert.match(css,/position:sticky/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css,/scroll-snap-type|height:100vh/);
});

test('full-width story explicitly replaces every inherited card-grid track and gap', async () => {
  const css = await readFile(new URL('../narrative.css', import.meta.url), 'utf8');
  const rule = css.match(/\.capability-gallery\.scroll-story\{([^}]+)\}/)[1];
  assert.match(rule,/grid-template-columns:minmax\(0,1fr\)/);
  assert.match(rule,/gap:0/);
  assert.match(rule,/width:100%/);
  for (const selector of ['story-backdrop','story-chapters']) {
    const properties = css.match(new RegExp('\\.' + selector + '\\{([^}]+)\\}'))[1];
    assert.match(properties,/grid-area:1\/1/);
    assert.match(properties,/width:100%/);
    assert.match(properties,/min-width:0/);
  }
});

test('opening and scroll text share a soft reveal with reduced-motion and no-script readability', async () => {
  const css = await readFile(new URL('../narrative.css', import.meta.url), 'utf8');
  const js = await readFile(new URL('../motion.js', import.meta.url), 'utf8');
  assert.match(css,/hero-title\{animation:soft-text-enter 1\.65s/);
  assert.match(css,/hero-note\{animation:soft-text-enter/);
  assert.match(css,/\.text-arrival\{animation:soft-scroll-text/);
  assert.match(css,/prefers-reduced-motion:reduce\)\{[\s\S]*hero-title[\s\S]*opacity:1/);
  assert.match(js,/IntersectionObserver/);
  assert.match(js,/animation\.cancel\(\)/);
  assert.doesNotMatch(css,/visibility:hidden|display:none[^}]*hero-title/);
});
