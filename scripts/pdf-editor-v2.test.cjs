/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadTs(relativePath, dependencies = {}, browserGlobals = {}) {
  const result = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, { exports: result.exports, module: result, require: (name) => dependencies[name] ?? require(name), Blob, TextDecoder, Uint8Array, atob, btoa, ...browserGlobals });
  return result.exports;
}

test("read-only source selection stays native and is not persisted", () => {
  const { analyzeEditorCapabilities, isPersistedElement } = loadTs("src/lib/pdf/editor-capabilities.ts");
  const selection = { id: "source", type: "text", pageIndex: 0, sourceBoxId: "box", sourcePristine: true, x: 0.1, y: 0.1, width: 0.2, height: 0.1, rotation: 0, opacity: 1, text: "Merhaba", fontSize: 12, fontFamily: "Noto Sans", color: "#000000", align: "left", bold: false, italic: false };
  assert.equal(isPersistedElement(selection), false);
  assert.deepEqual(JSON.parse(JSON.stringify(analyzeEditorCapabilities({}, [selection]))), { standardAllowed: true, flattenedAllowed: true, level: "native", reasons: [], objects: [{ id: "source", pageIndex: 0, level: "native" }], pages: [{ pageIndex: 0, level: "native" }] });
});

test("source mutations fail closed instead of silently rasterizing standard output", () => {
  const { analyzeEditorCapabilities, inspectPdfSecurity } = loadTs("src/lib/pdf/editor-capabilities.ts");
  const graphic = { id: "source", type: "image", pageIndex: 0, sourceOp: 42, sourcePristine: false, x: 0, y: 0, width: 1, height: 1, rotation: 0, opacity: 1, dataUrl: "data:image/png;base64,AA==", name: "source" };
  const report = analyzeEditorCapabilities({}, [graphic]);
  assert.equal(report.standardAllowed, false);
  assert.equal(report.flattenedAllowed, true);
  assert.equal(report.level, "flatten-only");
  assert.match(report.reasons.join(" "), /rasterization/i);
  const security = inspectPdfSecurity(new TextEncoder().encode("%PDF-1.7 /Encrypt 9 0 R /ByteRange [0 10 20 30] /Contents <abc>"));
  assert.deepEqual(JSON.parse(JSON.stringify(security)), { encrypted: true, signed: true });
  assert.equal(analyzeEditorCapabilities({}, [{ ...graphic, sourceOp: undefined }], security).standardAllowed, false);
});

test("cvproject V2 round-trips export mode and V1 migrates fail-closed", async () => {
  const sceneDocument = loadTs("src/lib/pdf/scene-document.ts");
  const { encodeProject, decodeProject } = loadTs("src/lib/pdf/editor-project.ts", { "./scene-document": sceneDocument });
  const base = { fileName: "fixture.pdf", bytes: new TextEncoder().encode("%PDF-1.7\n"), edits: {}, boxesByPage: {}, guidesByPage: { 0: { x: [0.5], y: [] } }, elements: [{ id: "shape", type: "shape", shape: "rectangle", pageIndex: 0, x: 0.1, y: 0.2, width: 0.3, height: 0.1, rotation: -20, opacity: 1, fill: "#ffffff", stroke: "#000000", strokeWidth: 1 }], pages: [{ index: 0, width: 420, height: 594, rotation: 0 }] };
  const encoded = encodeProject({ ...base, exportMode: "flattened" });
  const payload = JSON.parse(await encoded.text());
  assert.equal(payload.version, 2);
  assert.equal(payload.scene.coordinateSpace, "pdf-points-top-left");
  assert.equal(payload.scene.elements[0].bounds.width, 126);
  assert.equal(payload.scene.elements[0].transform.centerX, 105);
  assert.equal((await decodeProject(encoded)).exportMode, "flattened");
  assert.deepEqual(JSON.parse(JSON.stringify((await decodeProject(encoded)).guidesByPage)), { 0: { x: [0.5], y: [] } });

  payload.version = 1;
  delete payload.scene;
  delete payload.exportMode;
  payload.elements = [{ id: "legacy", type: "text", sourceBoxId: "b", pageIndex: 0, x: 0, y: 0, width: 0.2, height: 0.1, rotation: 0, opacity: 1, text: "Eski", fontSize: 12, fontFamily: "Noto Sans", color: "#000000", align: "left", bold: false, italic: false }];
  const migrated = await decodeProject(new Blob([JSON.stringify(payload)]));
  assert.equal(migrated.exportMode, "standard");
  assert.equal(migrated.elements[0].sourcePristine, false);
  assert.equal(migrated.elements[0].lineHeight, 1.25);
});

test("standard text export uses one drawText call and a real font variant", () => {
  const source = fs.readFileSync(path.join(__dirname, "../src/lib/pdf/canvas-export.ts"), "utf8");
  assert.doesNotMatch(source, /if \(element\.bold\) page\.drawText/);
  assert.match(source, /boldItalic/);
  assert.match(source, /page\.drawText\(line\.text,/);
  assert.match(source, /layoutTextLines/);
});

test("shared text layout wraps long words and respects box height", () => {
  const { layoutTextLines } = loadTs("src/lib/pdf/text-layout.ts");
  const lines = layoutTextLines("supercalifragilistic test", 5, 20, 10, 1, value => value.length);
  assert.deepEqual(JSON.parse(JSON.stringify(lines)), [{ text: "super", width: 5 }, { text: "calif", width: 5 }]);
});

test("locking and naming source objects preserve original content", () => {
  const { changesSourceAppearance, analyzeEditorCapabilities } = loadTs("src/lib/pdf/editor-capabilities.ts");
  const element = { id: "source", type: "text", pageIndex: 0, sourceBoxId: "box", sourcePristine: true, text: "Name", locked: false, name: "", fontSize: 12 };
  for (const patch of [{ locked: true }, { name: "Label" }, { groupId: "group" }, { text: "Name" }]) {
    assert.equal(changesSourceAppearance(element, patch), false);
    assert.equal(analyzeEditorCapabilities({}, [{ ...element, ...patch }]).standardAllowed, true);
  }
  assert.equal(changesSourceAppearance(element, { text: "Changed" }), true);
  assert.equal(changesSourceAppearance(element, { hidden: true }), true);
});

test("all bundled font variants include Turkish glyphs and embed in a real PDF", async () => {
  const { PDFDocument } = require("pdf-lib");
  const fontkit = require("@pdf-lib/fontkit");
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const page = pdf.addPage();
  let y = 700;
  for (const variant of ["Regular", "Bold", "Italic", "BoldItalic"]) {
    const bytes = fs.readFileSync(path.join(__dirname, `../public/fonts/NotoSans-${variant}.ttf`));
    const face = fontkit.create(bytes);
    for (const letter of "İıŞşĞğÇçÖöÜü") assert.ok(face.glyphForCodePoint(letter.codePointAt(0)).id > 0, `${variant}: ${letter}`);
    const font = await pdf.embedFont(bytes, { subset: true });
    page.drawText("İstanbul Şişli öğrenci", { x: 40, y, font, size: 16 });
    y -= 25;
  }
  const output = await pdf.save();
  assert.equal((await PDFDocument.load(output)).getPageCount(), 1);
});

test("image export preserves untouched pages and widgets of shared fields", async () => {
  const { PDFDocument } = require("pdf-lib");
  const original = await PDFDocument.create();
  const pages = [original.addPage([300, 400]), original.addPage([500, 600]), original.addPage([200, 300])];
  pages.forEach((page, index) => page.drawText(`Original page ${index + 1}`));
  const form = original.getForm();
  const shared = form.createTextField("shared");
  shared.setText("Keep me");
  shared.addToPage(pages[0]); shared.addToPage(pages[1]);
  const untouched = form.createTextField("untouched");
  untouched.setText("Still editable"); untouched.addToPage(pages[2]);
  const bytes = await original.save();
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9v8AAAAASUVORK5CYII=", "base64");
  class Layer { add() {} draw() {} }
  class Stage { add() {} destroy() {} toCanvas() { return { toBlob: callback => callback(new Blob([png])) }; } }
  const { exportFlattenedScenePdf } = loadTs("src/lib/pdf/konva-flatten-export.ts", {
    konva: { default: { Stage, Layer, Image: class {}, Text: class {} } },
    "pdf-lib": { ...require("pdf-lib"), PDFDocument: { load: async input => {
      const pdf = await PDFDocument.load(input);
      // pdf-lib validates arrays by realm; normalize the VM harness boundary.
      const insertPage = pdf.insertPage.bind(pdf);
      pdf.insertPage = (index, dimensions) => insertPage(index, Array.from(dimensions));
      return pdf;
    } } },
    "./apply-edits": { applyTextEdits: async value => value },
    "./editor-fonts": { ensureEditorFonts: async () => {} },
    "./konva-geometry": { konvaFrame: () => ({ width: 30, height: 30 }) },
    "./pdfjs-client": { openPdf: async () => ({ numPages: 3, getPage: async index => ({ pageNumber: index }), loadingTask: { destroy: async () => {} } }) },
    "./source-graphics": { renderWithSourceGraphics: async () => ({ canvas: {}, viewport: { width: 300, height: 400 } }) },
    "./text-layout": { layoutTextLines: () => [] },
  }, { document: { fonts: { load: async () => {} }, createElement: () => ({ getContext: () => null }) } });
  const output = await exportFlattenedScenePdf(bytes, [], {}, [{ id: "new", pageIndex: 0, type: "text", text: "Change", fontSize: 12 }], 72);
  const pdf = await PDFDocument.load(output);
  assert.deepEqual(pdf.getPages().map(page => page.getSize()), [{ width: 300, height: 400 }, { width: 500, height: 600 }, { width: 200, height: 300 }]);
  const restored = pdf.getForm();
  assert.equal(restored.getTextField("untouched").getText(), "Still editable");
  assert.equal(restored.getTextField("shared").getText(), "Keep me");
  assert.equal(restored.getTextField("shared").acroField.getWidgets().length, 1);
  assert.equal(restored.getTextField("shared").acroField.getWidgets()[0].P().toString(), pdf.getPage(1).ref.toString());
  assert.equal(pdf.getPage(1).ref.toString(), pages[1].ref.toString());
  assert.equal(pdf.context.lookup(pages[0].ref), undefined, "Removed page objects must not remain hidden in the file");
});
