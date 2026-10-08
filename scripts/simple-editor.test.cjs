/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { PDFDocument, degrees } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
function load(relativePath, deps = {}) {
  const loadedModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(relativePath, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInNewContext(source, {
    module: loadedModule,
    exports: loadedModule.exports,
    require: (name) => deps[name] ?? require(name),
    Uint8Array,
    Map,
    Set,
    atob,
  });
  return loadedModule.exports;
}
const layout = load("src/lib/pdf/text-layout.ts");
const coordinates = load("src/lib/pdf/page-coordinates.ts");
const ops = {
  embedUiFont: async (pdf, variant) => {
    pdf.registerFontkit(fontkit);
    return pdf.embedFont(
      fs.readFileSync(
        `public/fonts/NotoSans-${variant === "bold" ? "Bold" : "Regular"}.ttf`,
      ),
      { subset: true },
    );
  },
};
const canvas = load("src/lib/pdf/canvas-export.ts", {
  "@/lib/pdf/apply-edits": { applyTextEdits: async (bytes) => bytes },
  "@/lib/pdf/ops": ops,
  "@/lib/pdf/text-layout": layout,
  "./page-coordinates": coordinates,
});
const text = {
  id: "t",
  pageIndex: 1,
  type: "text",
  text: "İstanbul Şişli öğrencisi",
  x: 0.12,
  y: 0.4,
  width: 0.65,
  height: 0.15,
  fontSize: 18,
  color: "#202020",
  bold: true,
  italic: false,
  align: "left",
  rotation: 0,
  opacity: 1,
  lineHeight: 1.25,
};
async function fixture() {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Preserve me");
  const first = pdf.addPage([500, 700]),
    second = pdf.addPage([300, 500]);
  second.setRotation(degrees(90));
  first.drawText("Original");
  second.drawText("Rotated original");
  const field = pdf.getForm().createTextField("email");
  field.setText("qa@example.com");
  field.addToPage(first);
  return pdf.save();
}
function simple(deps = {}) {
  return load("src/lib/pdf/simple-export.ts", {
    "./canvas-export": canvas,
    "./ops": ops,
    "./text-layout": layout,
    ...deps,
  });
}

test("plain download is byte-identical to the uploaded PDF", async () => {
  const bytes = await fixture();
  const output = await simple().exportSimplePdf(bytes, []);
  assert.equal(Buffer.compare(Buffer.from(bytes), Buffer.from(output)), 0);
});
test("new Turkish text preserves page rotation, metadata and original forms", async () => {
  const output = await simple().exportSimplePdf(await fixture(), [text]);
  const pdf = await PDFDocument.load(output);
  assert.equal(pdf.getTitle(), "Preserve me");
  assert.equal(pdf.getPageCount(), 2);
  assert.equal(pdf.getPage(1).getRotation().angle, 90);
  assert.equal(pdf.getForm().getTextField("email").getText(), "qa@example.com");
});
test("overflow is rejected before a truncated PDF can be downloaded", async () => {
  await assert.rejects(
    simple().exportSimplePdf(await fixture(), [
      { ...text, text: "Too much text ".repeat(200), height: 0.025 },
    ]),
    /TEXT_OVERFLOW/,
  );
});
test("cover export keeps native overlays on other pages", async () => {
  let nativeElements, flattenedElements;
  const exporter = simple({
    "./canvas-export": {
      exportCanvasPdf: async (bytes, _boxes, _edits, elements) => {
        nativeElements = elements;
        return bytes;
      },
    },
    "./konva-flatten-export": {
      exportFlattenedScenePdf: async (bytes, _boxes, _edits, elements) => {
        flattenedElements = elements;
        return bytes;
      },
    },
  });
  const cover = { id: "cover", pageIndex: 0, type: "shape" };
  const replacement = { ...text, id: "replacement", pageIndex: 0 };
  await exporter.exportSimplePdf(await fixture(), [cover, replacement, text]);
  assert.deepEqual(
    Array.from(nativeElements, (value) => value.id),
    ["t"],
  );
  assert.deepEqual(
    Array.from(flattenedElements, (value) => value.id),
    ["cover", "replacement"],
  );
});
test("rotated page placement maps the display center into PDF coordinates", () => {
  for (const angle of [0, 90, 180, 270]) {
    const result = coordinates.elementInPdfCoordinates(text, 300, 500, angle);
    const physicalX = (result.x + result.width / 2) * 300,
      physicalY = (1 - result.y - result.height / 2) * 500;
    const [dx, dy] =
      angle === 90
        ? [physicalY, 300 - physicalX]
        : angle === 180
          ? [300 - physicalX, 500 - physicalY]
          : angle === 270
            ? [500 - physicalY, physicalX]
            : [physicalX, physicalY];
    const width = angle % 180 ? 500 : 300,
      height = angle % 180 ? 300 : 500;
    assert.ok(Math.abs(dx - (text.x + text.width / 2) * width) < 0.00001);
    assert.ok(Math.abs(dy - (1 - text.y - text.height / 2) * height) < 0.00001);
    assert.equal(result.rotation, angle ? -angle : 0);
  }
});
