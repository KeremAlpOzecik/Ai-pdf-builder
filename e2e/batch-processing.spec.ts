import { test, expect } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
import { Document, Packer, Paragraph } from "docx";

async function pdfBuffer() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf.addPage([200, 300]).drawText("Batch document", { x: 20, y: 200, font, size: 12 });
  return Buffer.from(await pdf.save());
}

test("word-to-pdf: batch DOCX conversion produces downloadable PDFs", async ({ page }) => {
  const buffer = await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph("Batch DOCX document")] }] }));
  await page.goto("/tools/word-to-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "one.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer },
    { name: "two.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer },
  ]);
  await page.getByRole("button", { name: "Dosyaları işle", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "2 tamamlandı · 0 hata · 0 kalan" })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tümünü ZIP Olarak İndir", exact: true }).click();
  const path = await (await downloadPromise).path();
  const zip = await JSZip.loadAsync(await readFile(path!));
  expect(Object.keys(zip.files)).toEqual(["one.pdf", "two.pdf"]);
  expect((await PDFDocument.load(await zip.file("one.pdf")!.async("uint8array"))).getPageCount()).toBeGreaterThan(0);
});

test("17 files: append, reorder, isolated error, duplicate-safe ZIP and clear", async ({ page }) => {
  const buffer = await pdfBuffer();
  await page.goto("/tools/split");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles(Array.from({ length: 15 }, (_, i) => ({ name: i < 2 ? "same.pdf" : `document-${i}.pdf`, mimeType: "application/pdf", buffer })));
  const queue = page.getByRole("list", { name: "İşlem kuyruğu" });
  await expect(queue.locator(":scope > li")).toHaveCount(15);
  await input.setInputFiles([
    { name: "last.pdf", mimeType: "application/pdf", buffer },
    { name: "broken.pdf", mimeType: "application/pdf", buffer: Buffer.from("invalid pdf") },
  ]);
  await expect(queue.locator(":scope > li")).toHaveCount(17);
  await queue.getByRole("button", { name: "document-2.pdf: Yukarı taşı" }).click();
  await expect(queue.locator(":scope > li").nth(1)).toContainText("document-2.pdf");
  await page.getByLabel("Aynı anda işlenecek dosya sayısı").selectOption("3");
  await page.getByRole("button", { name: "Dosyaları işle", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "16 tamamlandı · 1 hata · 0 kalan" })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Tümünü ZIP Olarak İndir", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  const zip = await JSZip.loadAsync(await readFile(path!));
  const names = Object.keys(zip.files);
  expect(names).toHaveLength(16);
  expect(names).toContain("same-p1-1.pdf");
  expect(names).toContain("same-p1-1 (2).pdf");
  const pdf = await PDFDocument.load(await zip.file(names[0])!.async("uint8array"));
  expect(pdf.getPageCount()).toBe(1);
  await page.getByRole("button", { name: "Tümünü Temizle", exact: true }).click();
  await expect(queue).toHaveCount(0);
});

for (const slug of ["compress", "pdf-to-word", "jpg-pdf"] as const) {
  test(`${slug}: two files complete using actual client libraries`, async ({ page }) => {
    const buffer = await pdfBuffer();
    await page.goto(`/tools/${slug}`);
    if (slug === "jpg-pdf") await page.getByRole("button", { name: "PDF → JPG", exact: true }).click();
    // Wait for the new mode to mount before using its file input.
    await expect(page.getByRole("button", { name: "Dosyaları işle", exact: true })).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles([
      { name: "one.pdf", mimeType: "application/pdf", buffer },
      { name: "two.pdf", mimeType: "application/pdf", buffer },
    ]);
    await expect(page.getByRole("list", { name: "İşlem kuyruğu" }).locator(":scope > li")).toHaveCount(2);
    await page.getByRole("button", { name: "Dosyaları işle", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "2 tamamlandı · 0 hata · 0 kalan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tümünü ZIP Olarak İndir", exact: true })).toBeEnabled();
  });
}
