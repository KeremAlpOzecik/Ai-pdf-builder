/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test harness. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');

// Execute the real component handlers with isolated UI and download adapters.
// No browser, real CV data or network requests are needed.
function renderHeader(template) {
  const calls = [];
  const downloads = [];
  const cv = { personalInfo: { fullName: 'Test Candidate' } };
  const state = { cv, resumeTemplate: template, screen: 'editor', aiJob: null };
  const jsx = (type, props) => ({ type, props });
  const componentModule = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../src/components/app-header.tsx'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    'next/navigation': { usePathname: () => '/studio' },
    '@/store/cv-store': { useCvStore: (select) => select(state) },
    '@/components/providers': {
      useDisplayLanguage: () => 'TR',
      useLabels: () => ({ exportPdf: 'PDF', exportDocx: 'Word' }),
    },
    '@/lib/cv-utils': { cvHasContent: () => true },
    sonner: { toast: { error: (error) => { throw new Error(error); } } },
    '@/lib/export-pdf': { cvToPdfBlob: async (...args) => { calls.push(['pdf', ...args]); return new Blob(['pdf']); } },
    '@/lib/export-docx': { cvToDocxBlob: async (...args) => { calls.push(['docx', ...args]); return new Blob(['docx']); } },
  };
  vm.runInNewContext(compiled, {
    module: componentModule, exports: componentModule.exports,
    require: (id) => mocks[id] ?? new Proxy({}, { get: (_, name) => String(name) }),
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
    document: { createElement: () => ({ click() { downloads.push(this.download); } }) },
  });
  return { tree: componentModule.exports.AppHeader(), calls, downloads, cv };
}

function buttons(node, label) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap((child) => buttons(child, label));
  const children = node.props?.children;
  const own = node.props?.onClick && (children === label || (Array.isArray(children) && children.includes(label))) ? [node] : [];
  return [...own, ...buttons(children, label)];
}

for (const template of ['modern', 'classic', 'compact']) {
  for (const [label, format, count] of [['PDF', 'pdf', 2], ['Word', 'docx', 1]]) {
    test(`${template}: all header ${label} actions forward the selected template`, async () => {
      const { tree, calls, downloads, cv } = renderHeader(template);
      const actions = buttons(tree, label);
      assert.equal(actions.length, count, 'desktop/mobile download actions must be covered');
      for (const action of actions) {
        action.props.onClick();
        await new Promise(setImmediate);
      }
      assert.equal(calls.length, count);
      for (const [actualFormat, actualCv, actualTemplate] of calls) {
        assert.equal(actualFormat, format);
        assert.equal(actualCv, cv);
        assert.equal(actualTemplate, template);
      }
      assert.deepEqual(downloads, Array(count).fill(`Test Candidate.${format}`));
    });
  }
}
