import { expect, test, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts } from "pdf-lib";

const tempDir = path.join(process.cwd(), "tmp", "pdfs");
const fixturePath = path.join(tempDir, "simple-editor.pdf");
test.beforeAll(async () => {
  await mkdir(tempDir, { recursive: true });
  const pdf = await PDFDocument.create();
  pdf.setTitle("Simple editor fixture");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < 2; index++) {
    const page = pdf.addPage([420, 594]);
    page.drawText(`Original page ${index + 1}`, {
      x: 48,
      y: 520,
      size: 22,
      font,
    });
  }
  const field = pdf.getForm().createTextField("email");
  field.setText("qa@example.com");
  field.addToPage(pdf.getPage(1), { x: 48, y: 420, width: 180, height: 24 });
  await writeFile(fixturePath, await pdf.save());
});
async function upload(page: Page) {
  await page.goto("/tools/edit-pdf");
  await page.getByRole("button", { name: "TR", exact: true }).click();
  await page
    .locator('input[type="file"][accept="application/pdf,.pdf"]')
    .setInputFiles(fixturePath);
  await expect(
    page.getByRole("button", { name: "PDF indir", exact: true }),
  ).toBeEnabled();
}
async function download(page: Page) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "PDF indir", exact: true }).click();
  const file = await pending;
  return readFile((await file.path())!);
}
test("no changes preserves the original PDF exactly", async ({ page }) => {
  await upload(page);
  expect(
    Buffer.compare(await download(page), await readFile(fixturePath)),
  ).toBe(0);
});
test("new Turkish text preserves original forms and metadata", async ({
  page,
}) => {
  await upload(page);
  await page.getByRole("button", { name: "Yazı ekle", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Yazı", exact: true })
    .fill("İstanbul Şişli öğrencisi");
  await page.getByRole("button", { name: "Kalın", exact: true }).click();
  const pdf = await PDFDocument.load(await download(page));
  expect(pdf.getTitle()).toBe("Simple editor fixture");
  expect(pdf.getPageCount()).toBe(2);
  expect(pdf.getForm().getTextField("email").getText()).toBe("qa@example.com");
});
test("cover only rasterizes its page and retains a form on another page", async ({
  page,
}) => {
  await upload(page);
  await page.getByRole("button", { name: "Alanı kapat", exact: true }).click();
  await expect(
    page
      .locator(".simple-pdf-editor")
      .getByText(/Alan kapatılan sayfalar görüntü olarak kaydedilir/),
  ).toBeVisible();
  const pdf = await PDFDocument.load(await download(page));
  expect(pdf.getPageCount()).toBe(2);
  expect(pdf.getForm().getTextField("email").getText()).toBe("qa@example.com");
  expect(pdf.getPage(0).node.Resources()?.toString()).toContain("XObject");
});
test("undo, redo and delete operate on added objects", async ({ page }) => {
  await upload(page);
  await page.getByRole("button", { name: "Yazı ekle", exact: true }).click();
  await page.getByRole("button", { name: "Geri al", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Yazı", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "İleri al", exact: true }).click();
  await page
    .getByRole("button", { name: "Yeni yazı", exact: true })
    .press("Enter");
  await page.getByRole("button", { name: "Sil", exact: true }).click();
  expect(
    Buffer.compare(await download(page), await readFile(fixturePath)),
  ).toBe(0);
});
test("invalid PDF stays in upload view with a visible error", async ({
  page,
}) => {
  await page.goto("/tools/edit-pdf");
  await page.getByRole("button", { name: "TR", exact: true }).click();
  await page
    .locator('input[type="file"][accept="application/pdf,.pdf"]')
    .setInputFiles({
      name: "invalid.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.7\nnot a valid document"),
    });
  await expect(page.getByRole("alert")).toContainText("PDF açılamadı");
  await expect(
    page.getByRole("button", { name: "PDF indir", exact: true }),
  ).toHaveCount(0);
});
