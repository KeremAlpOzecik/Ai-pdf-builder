import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFString, StandardFonts, rgb } from "pdf-lib";

const tempDir = path.join(process.cwd(), "tmp", "pdfs");
const fixturePath = path.join(tempDir, "editor-e2e.pdf");

test.beforeAll(async () => {
  await mkdir(tempDir, { recursive: true });
  const pdf = await PDFDocument.create();
  pdf.setTitle("Editor structure fixture");
  pdf.setAuthor("Codex QA");
  const page = pdf.addPage([420, 594]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText("Original Name", { x: 48, y: 520, size: 22, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText("Second searchable line", { x: 48, y: 480, size: 12, font });
  const form = pdf.getForm();
  const field = form.createTextField("candidate.email");
  field.setText("qa@example.com");
  field.addToPage(page, { x: 48, y: 420, width: 180, height: 24 });
  const link = pdf.context.obj({ Type: "Annot", Subtype: "Link", Rect: [48, 380, 200, 400], Border: [0, 0, 0], A: { S: "URI", URI: PDFString.of("https://example.com/profile") } });
  page.node.addAnnot(pdf.context.register(link));
  await writeFile(fixturePath, await pdf.save());
});

async function uploadFixture(page: import("@playwright/test").Page) {
  await page.goto("/tools/edit-pdf");
  const input = page.locator('input[type="file"][accept="application/pdf,.pdf"]');
  await input.setInputFiles(fixturePath);
  // WebKit on Windows can retain the programmatic file list without emitting change.
  if (page.context().browser()?.browserType().name() === "webkit") {
    await page.waitForTimeout(100);
    if (await input.count()) await input.dispatchEvent("change");
  }
  await expect(page.getByText("Original Name", { exact: true }).first()).toBeVisible();
}

async function saveCanvasPreview(page: import("@playwright/test").Page, target: string) {
  const dataUrl = await page.locator(".pdf-page").evaluate((root) => {
    const canvases = [...root.querySelectorAll("canvas")];
    const width = canvases[0]?.width ?? root.clientWidth;
    const height = canvases[0]?.height ?? root.clientHeight;
    const output = document.createElement("canvas");
    output.width = width; output.height = height;
    const context = output.getContext("2d")!;
    context.fillStyle = "white"; context.fillRect(0, 0, width, height);
    if (canvases[0]) context.drawImage(canvases[0], 0, 0, width, height);
    for (const mask of root.querySelectorAll<HTMLElement>(".pdf-edited-text")) {
      const style = getComputedStyle(mask);
      context.fillStyle = style.backgroundColor;
      context.fillRect(mask.offsetLeft, mask.offsetTop, mask.offsetWidth, mask.offsetHeight);
    }
    for (const canvas of canvases.slice(1)) context.drawImage(canvas, 0, 0, width, height);
    return output.toDataURL("image/png");
  });
  await writeFile(target, Buffer.from(dataUrl.split(",")[1], "base64"));
}

test("selection is a byte-identical no-op and numeric drafts keep intermediate input", async ({ page }, testInfo) => {
  await uploadFixture(page);
  const original = await readFile(fixturePath);
  await page.getByText("Original Name", { exact: true }).first().click();
  if (!testInfo.project.name.startsWith("mobile")) await expect(page.getByText(/0 (değişiklik|saved changes)/)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /İndir|Download/ }).click();
  const download = await downloadPromise;
  const downloadedPath = await download.path();
  if (!downloadedPath) throw new Error("Download path unavailable");
  const downloaded = await readFile(downloadedPath);
  expect(createHash("sha256").update(downloaded).digest("hex")).toBe(createHash("sha256").update(original).digest("hex"));

  const height = page.getByLabel(/Yükseklik|Height/).last();
  await height.fill("12");
  await height.blur();
  await expect(height).toHaveValue("12");
  const rotation = page.getByLabel(/Döndürme|Rotation/).last();
  await rotation.fill("-20");
  await rotation.blur();
  await expect(rotation).toHaveValue("-20");
  const fontSize = page.getByLabel(/^Boyut$|^Size$/).last();
  await fontSize.fill("15");
  await fontSize.blur();
  await expect(fontSize).toHaveValue("15");
  await expect(page.getByRole("alert").filter({ hasText: /Standart çıktı güvenle üretilemez|Standard export is not safe/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /İndir|Download/ })).toBeDisabled();
});

test("real bold exports one searchable text item", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("mobile"), "Desktop authoring regression");
  await uploadFixture(page);
  const thumbnail = page.getByRole("button", { name: /^(Sayfa|Page) 1$/ }).locator('span[style*="background-image"]');
  await expect.poll(() => thumbnail.getAttribute("style")).not.toBeNull();
  const originalThumbnail = await thumbnail.getAttribute("style");
  await page.getByRole("button", { name: /^(Metin|Text)$/ }).first().click();
  await page.getByRole("textbox", { name: /^Metin$|^Text$/ }).fill("UNIQUE BOLD TEXT");
  await page.getByRole("button", { name: "Kalın / Bold" }).click();
  await expect.poll(() => thumbnail.getAttribute("style")).not.toBe(originalThumbnail);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /İndir|Download/ }).click();
  const download = await downloadPromise;
  const downloadedPath = await download.path();
  if (!downloadedPath) throw new Error("Download path unavailable");
  const bytes = await readFile(downloadedPath);
  if (testInfo.project.name === "chromium") await download.saveAs(path.join(tempDir, "standard-e2e.pdf"));
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loading = pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true });
  const doc = await loading.promise;
  try {
    const items = (await (await doc.getPage(1)).getTextContent()).items;
    const extracted = items.map((item) => "str" in item ? item.str : "").join(" ").replace(/\s+/g, " ");
    expect(extracted).toContain("UNIQUE BOLD TEXT");
    expect(extracted.match(/UNIQUE BOLD TEXT/g) ?? []).toHaveLength(1);
  } finally {
    await loading.destroy();
  }
  const structural = await PDFDocument.load(bytes);
  expect(structural.getTitle()).toBe("Editor structure fixture");
  expect(structural.getAuthor()).toBe("Codex QA");
  expect(structural.getForm().getTextField("candidate.email").getText()).toBe("qa@example.com");
  expect(structural.getPage(0).node.Annots()?.size()).toBeGreaterThanOrEqual(2);
});

test("flattened export is image-only and explicitly drops interactive structure", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One 300 DPI structural regression is sufficient");
  await uploadFixture(page);
  await page.getByText("Original Name", { exact: true }).first().click();
  await page.getByRole("textbox", { name: /^Metin$|^Text$/ }).fill("Flattened replacement");
  await page.getByLabel(/PDF çıktı modu|PDF export mode/).selectOption("flattened");
  await expect(page.getByRole("note")).toContainText(/metin seçilebilirliği|selectable text/);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press("Escape");
  await saveCanvasPreview(page, path.join(tempDir, "flattened-preview.png"));
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /İndir|Download/ }).click();
  const download = await downloadPromise;
  const target = path.join(tempDir, "flattened-e2e.pdf");
  await download.saveAs(target);
  const bytes = await readFile(target);
  const flattened = await PDFDocument.load(bytes);
  expect(flattened.getPageCount()).toBe(1);
  expect(flattened.getForm().getFields()).toHaveLength(0);
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loading = pdfjs.getDocument({ data: new Uint8Array(bytes), useSystemFonts: true });
  const doc = await loading.promise;
  try {
    expect((await (await doc.getPage(1)).getTextContent()).items).toHaveLength(0);
  } finally {
    await loading.destroy();
  }
});

test("page add, duplicate, delete and history produce a valid PDF", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Desktop page authoring regression");
  await uploadFixture(page);
  await page.getByRole("button", { name: /^(Ekle|Add)$/ }).click();
  await expect(page.getByRole("button", { name: /^(Sayfa|Page) 2$/ })).toBeVisible();
  await page.getByRole("button", { name: /Sayfayı yukarı taşı|Move page up/ }).click();
  await page.getByRole("button", { name: /^(Sayfa|Page) 2$/ }).click();
  await expect(page.getByText("Original Name", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: /^(Çoğalt|Duplicate)$/ }).click();
  await expect(page.getByRole("button", { name: /^(Sayfa|Page) 3$/ })).toBeVisible();
  await page.getByRole("button", { name: /^(Sil|Delete)$/ }).click();
  await expect(page.getByRole("button", { name: /^(Sayfa|Page) 3$/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Geri al|Undo/ }).click();
  await expect(page.getByRole("button", { name: /^(Sayfa|Page) 3$/ })).toBeVisible();
  await page.getByRole("button", { name: /İleri al|Redo/ }).click();
  await expect(page.getByRole("button", { name: /^(Sayfa|Page) 3$/ })).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /İndir|Download/ }).click();
  const target = await (await downloadPromise).path();
  if (!target) throw new Error("Download path unavailable");
  const output = await PDFDocument.load(await readFile(target));
  expect(output.getPageCount()).toBe(2);
  expect(output.getTitle()).toBe("Editor structure fixture");
  expect(output.getForm().getTextField("candidate.email").getText()).toBe("qa@example.com");
});

test("390px surface does not overflow horizontally", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only regression");
  await uploadFixture(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
