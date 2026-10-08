/* eslint-disable @typescript-eslint/no-require-imports -- Source-level UI regression guards. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const workspace = fs.readFileSync("src/components/tools/tool-workspace.tsx", "utf8");
const editor = fs.readFileSync("src/components/tools/edit-pdf-editor.tsx", "utf8");
const pdfExport = fs.readFileSync("src/lib/export-pdf.tsx", "utf8");

test("mode and split-method changes clear stale results", () => {
  assert.match(workspace, /setJpgMode\("to-pdf"\);[\s\S]{0,160}setResults\(\[\]\)/);
  assert.match(workspace, /setJpgMode\("to-jpg"\);[\s\S]{0,160}setResults\(\[\]\)/);
  assert.match(workspace, /setSplitMode\(e\.target\.value\); setResults\(\[\]\)/);
});

test("invalid PDFs disable processing and selected-page filenames are unambiguous", () => {
  assert.match(workspace, /setFileValid\(false\)/);
  assert.match(workspace, /!fileValid/);
  assert.match(workspace, /selectedPages\.join\("_"\)/);
});

test("export blocks clipped text and has a timeout", () => {
  assert.match(editor, /metrics\.requiredHeight > metrics\.availableHeight/);
  assert.match(editor, /PDF dışa aktarma zaman aşımına uğradı/);
});

test("PDF headings do not encode visual tracking into extracted text", () => {
  const headingStyle = pdfExport.match(/heading: \{[^\n]+/u)?.[0] ?? "";
  assert.doesNotMatch(headingStyle, /letterSpacing/);
});
