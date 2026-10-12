/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const { PDFDocument } = require('pdf-lib');
const JSZip = require('jszip');
function load(path, dependencies = {}) {
  const api = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  // pdf-lib checks instanceof Array, so keep generated code in the Node realm.
  vm.runInThisContext(`(function(exports, require) { ${code}\n })`)(api, name => dependencies[name] ?? require(name));
  return api;
}
const queue = load('src/lib/batch-queue.ts');
const zip = load('src/lib/batch-zip.ts');
const split = load('src/lib/pdf/batch-split.ts', { '../download': { stem: name => name.replace(/\.[^.]+$/, '') } });

test('18 jobs respect concurrency and continue after one failure', async () => {
  let active = 0;
  let peak = 0;
  const updates = [];
  await queue.runBatchQueue(Array.from({ length: 18 }, (_, i) => i), async (input, report) => {
    active++; peak = Math.max(peak, active);
    report(45);
    await new Promise(resolve => setTimeout(resolve, 3));
    active--;
    if (input === 2) throw new Error('corrupt');
    return input * 2;
  }, { concurrency: 3, onUpdate: update => updates.push(update) });
  assert.equal(peak, 3);
  assert.equal(updates.filter(u => u.status === 'completed').length, 17);
  assert.equal(updates.filter(u => u.status === 'error').length, 1);
  assert.ok(updates.some(u => u.status === 'completed' && u.result === 34));
});
test('default queue runs in list order with monotonic bounded progress', async () => {
  const order = [];
  const updates = [];
  await queue.runBatchQueue([4, 1, 9], async (input, report) => {
    order.push(input); report(70); report(20); report(200); report(NaN); return input;
  }, { onUpdate: update => updates.push(update) });
  assert.deepEqual(order, [4, 1, 9]);
  assert.deepEqual(updates.filter(u => u.index === 0).map(u => u.progress), [0, 70, 70, 99, 100]);
  await assert.rejects(queue.runBatchQueue([], async () => {}, { concurrency: 4, onUpdate() {} }), /INVALID_CONCURRENCY/);
});
test('abort suppresses late updates and stops queued jobs', async () => {
  const controller = new AbortController();
  const started = [];
  const updates = [];
  await queue.runBatchQueue([1, 2, 3], async input => { started.push(input); controller.abort(); return input; }, {
    signal: controller.signal, onUpdate: update => updates.push(update),
  });
  assert.deepEqual(started, [1]);
  assert.equal(updates.length, 1);
});
test('ZIP preserves duplicate outputs with safe case-insensitive unique filenames', async () => {
  const names = zip.uniqueArchiveNames(['Report.pdf', 'report.pdf', 'report (2).pdf', '../Report.pdf']);
  assert.equal(new Set(names.map(name => name.toLowerCase())).size, 4);
  assert.ok(names.every(name => !name.includes('/') && !name.includes('\\')));
  const archive = await zip.createBatchZip([
    { name: 'same.pdf', blob: new Blob(['first']) },
    { name: 'same.pdf', blob: new Blob(['second']) },
  ]);
  const decoded = await JSZip.loadAsync(await archive.arrayBuffer());
  assert.equal(await decoded.file('same.pdf').async('string'), 'first');
  assert.equal(await decoded.file('same (2).pdf').async('string'), 'second');
});
test('batch splitting uses each file page count and rejects invalid ranges', async () => {
  const source = await PDFDocument.create();
  source.addPage([200, 400]); source.addPage([300, 400]);
  const bytes = await source.save();
  let reads = 0;
  const file = { name: 'test.pdf', arrayBuffer: async () => { reads++; return bytes; } };
  const reports = [];
  const outputs = await split.splitPdfBatch(file, { mode: 'every', from: 1, to: 1, pages: [] }, value => reports.push(value));
  assert.equal(reads, 1);
  assert.equal(outputs.length, 2);
  assert.equal((await PDFDocument.load(await outputs[1].blob.arrayBuffer())).getPage(0).getWidth(), 300);
  assert.equal(reports.at(-1), 100);
  await assert.rejects(split.splitPdfBatch(file, { mode: 'range', from: 1, to: 3, pages: [] }, () => {}), /INVALID_PAGE_RANGE/);
  await assert.rejects(split.splitPdfBatch(file, { mode: 'range', from: 1, to: 1e9, pages: [] }, () => {}), /INVALID_PAGE_RANGE/);
});
