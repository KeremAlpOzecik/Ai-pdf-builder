const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const api = {};
let fixture;
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/pdf/compare.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: api, require: name => name === 'diff' ? require('diff') : { openPdf: async () => fixture } });

test('identical documents contain no changes', async () => {
  const result = await api.comparePdfTexts('Türkçe belge\nİstanbul', 'Türkçe belge\nİstanbul');
  assert.equal(result.groups, 0);
  assert.equal(result.additions, 0);
  assert.equal(result.deletions, 0);
});
test('replacement and later insertion are counted and preserve both documents', async () => {
  const oldText = 'Merhaba eski belge. Ortak metin.';
  const newText = 'Merhaba yeni belge. Ortak metin. Ek bilgi';
  const result = await api.comparePdfTexts(oldText, newText);
  assert.equal(result.groups, 2);
  assert.equal(result.additions, 3);
  assert.equal(result.deletions, 1);
  assert.equal(result.changes.filter(c => !c.added).map(c => c.value).join(''), oldText);
  assert.equal(result.changes.filter(c => !c.removed).map(c => c.value).join(''), newText);
});
test('size limit rejects oversized input', async () => {
  await assert.rejects(api.comparePdfTexts('a'.repeat(300001), ''), /PDF_COMPARE_LIMIT/);
});
test('extractor detects image-only pages and releases page and document resources', async () => {
  let cleaned = 0;
  let destroyed = 0;
  fixture = { numPages: 2, getPage: async number => ({
    getTextContent: async () => ({ items: number === 1 ? [{ str: 'Metin', transform: [1, 0, 0, 1, 0, 100], hasEOL: true }] : [] }),
    cleanup: () => cleaned++,
  }), loadingTask: { destroy: async () => destroyed++ } };
  const result = await api.extractPdfText({ arrayBuffer: async () => new ArrayBuffer(0) });
  assert.equal(result.text.trim(), 'Metin');
  assert.deepEqual(Array.from(result.emptyPages), [2]);
  assert.equal(cleaned, 2);
  assert.equal(destroyed, 1);
});
test('extraction failures still destroy the worker', async () => {
  let destroyed = false;
  fixture = { numPages: 301, loadingTask: { destroy: async () => { destroyed = true; } } };
  await assert.rejects(api.extractPdfText({ arrayBuffer: async () => new ArrayBuffer(0) }), /PDF_COMPARE_LIMIT/);
  assert.equal(destroyed, true);
});
