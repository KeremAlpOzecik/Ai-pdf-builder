/* eslint-disable @typescript-eslint/no-require-imports -- Node regression harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { PDFDocument, degrees } = require('pdf-lib');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/pdf/ops.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: exportsObject, Array, Uint8Array, ArrayBuffer, require: name => name.startsWith('@/') ? {} : name.startsWith('@fontsource/noto-sans/files/') ? name : require(name) });

async function fixture() {
  const pdf = await PDFDocument.create();
  [200, 300, 400].forEach((width, i) => { const page = pdf.addPage([width, 600]); page.setRotation(degrees(i * 90)); });
  const bytes = await pdf.save();
  return { arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
}

test('visual page extraction preserves selected content and rejects invalid selection', async () => {
  const file = await fixture();
  const pdf = await PDFDocument.load(await exportsObject.extractPdfPages(file, [1, 3]));
  assert.deepEqual(pdf.getPages().map(page => page.getWidth()), [200, 400]);
  assert.equal(pdf.getPages()[1].getRotation().angle, 180);
  await assert.rejects(exportsObject.extractPdfPages(file, []));
  await assert.rejects(exportsObject.extractPdfPages(file, [4]));
});

test('selected rotation preserves unselected pages and existing rotations', async () => {
  const file = await fixture();
  const selected = await PDFDocument.load(await exportsObject.rotatePdf(file, 90, [2]));
  assert.deepEqual(selected.getPages().map(page => page.getRotation().angle), [0, 180, 180]);
  const all = await PDFDocument.load(await exportsObject.rotatePdf(file, 270));
  assert.deepEqual(all.getPages().map(page => page.getRotation().angle), [270, 0, 90]);
});

test('merge respects file order and split retains the requested range', async () => {
  const file = await fixture();
  const part = await exportsObject.splitPdf(file, 2, 3);
  const merged = await PDFDocument.load(await exportsObject.mergePdfs([{ arrayBuffer: async () => part }, file]));
  assert.deepEqual(merged.getPages().map(page => page.getWidth()), [300, 400, 200, 300, 400]);
});
