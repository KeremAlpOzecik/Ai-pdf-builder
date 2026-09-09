/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadTs(relativePath, dependencies = {}) {
  const result = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(compiled, { exports: result.exports, module: result, require: (name) => dependencies[name] ?? require(name) });
  return result.exports;
}

test('real PDFs preserve content and use distinct template layouts', async () => {
  const renderer = await import('@react-pdf/renderer');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { cvToPdfBlob } = loadTs('src/lib/export-pdf.tsx', {
    '@react-pdf/renderer': { ...renderer, Font: { register: (config) => renderer.Font.register({ ...config, src: path.join(__dirname, '../public', config.src) }) } },
    '@/lib/cv-format': loadTs('src/lib/cv-format.ts'),
  });
  const cv = {
    targetLanguage: 'EN', personalInfo: { fullName: 'Test Candidate', title: 'Engineer', email: 'test@example.com', summary: 'Builds reliable software.' },
    workExperience: [], education: [{ id: 'edu', institution: 'Test University', degree: 'BSc', fieldOfStudy: 'Engineering', startDate: '2020-01', endDate: '2024-01' }],
    skills: [{ category: 'Technical', items: ['TypeScript'] }], languages: [{ language: 'English', proficiency: 'Fluent' }], projects: [], certifications: [],
  };
  const layouts = {};
  for (const template of ['modern', 'classic', 'compact']) {
    const blob = await cvToPdfBlob(cv, template);
    const loading = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), useSystemFonts: true });
    const doc = await loading.promise;
    const page = await doc.getPage(1);
    const { items } = await page.getTextContent();
    const locate = (text) => { const item = items.find(item => item.str?.includes(text)); assert.ok(item, `${template} preserves ${text}`); return item.transform; };
    layouts[template] = { name: locate('Test Candidate'), skill: locate('TypeScript'), school: locate('Test University'), email: locate('test@example.com') };
    await loading.destroy();
  }
  assert.ok(layouts.modern.email[4] < 100, 'modern contact belongs in sidebar');
  assert.ok(layouts.modern.name[4] > 200, 'modern name belongs in main column');
  assert.ok(layouts.modern.skill[4] < 100, 'modern skills belong in sidebar');
  assert.ok(layouts.classic.name[4] > 150, 'classic name is centered');
  assert.ok(layouts.compact.name[4] < 100, 'compact name is left aligned');
  assert.ok(layouts.compact.skill[4] > layouts.compact.school[4] + 200, 'compact skills and education form two columns');
});
