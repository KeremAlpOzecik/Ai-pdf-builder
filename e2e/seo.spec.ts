import { test, expect } from "@playwright/test";
import { TOOL_SLUGS } from "../src/lib/tools";

test("all tool pages ship unique titles, canonical metadata and valid JSON-LD", async ({ request }) => {
  const titles = new Set<string>();
  for (const slug of TOOL_SLUGS) {
    const response = await request.get(`/tools/${slug}`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    const title = html.match(/<title>([\s\S]*?)<\/title>/)![1];
    expect(title.match(/EkoPDF/g)).toHaveLength(1);
    expect(titles.has(title)).toBe(false);
    titles.add(title);
    expect(html).toContain(`href="https://ekopdf.com/tools/${slug}"`);
    expect(html).toContain('name="robots" content="index, follow"');
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
    expect(schemas.some(schema => schema["@type"] === "FAQPage")).toBe(true);
    expect(schemas.some(schema => schema["@type"] === "WebApplication" && schema.url.endsWith(`/tools/${slug}`))).toBe(true);
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/guides/pdf-belge-karsilastirma');
  expect(sitemap).toContain('/guides/toplu-pdf-isleme');
});

test("hydration, language toggle and client navigation preserve route metadata", async ({ page }) => {
  await page.goto('/tools/compare-pdf');
  await expect(page.getByRole('heading', { name: 'PDF Belge Karşılaştırma', exact: true })).toBeVisible();
  const description = await page.locator('meta[name="description"]').getAttribute('content');
  await expect(page).toHaveTitle('PDF belge karşılaştırma | Metin farklarını gör | EkoPDF');
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Compare PDF documents', exact: true })).toBeVisible();
  await expect(page).toHaveTitle('PDF belge karşılaştırma | Metin farklarını gör | EkoPDF');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description!);
  const faq = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.map(script => JSON.parse(script.textContent!)).find(schema => schema['@type'] === 'FAQPage'));
  expect(faq.inLanguage).toBe('en');
  const guide = page.getByRole('region', { name: 'Tool guide', exact: true });
  for (const question of faq.mainEntity) {
    await expect(guide.getByRole('heading', { name: question.name, exact: true })).toBeVisible();
    await expect(guide.getByText(question.acceptedAnswer.text, { exact: true })).toBeVisible();
  }
  await page.locator('footer a[href="/tools/compress"]').click();
  await expect(page).toHaveURL(/\/tools\/compress$/);
  await expect(page).toHaveTitle('PDF sıkıştır | Dosya boyutunu küçült | EkoPDF');
  await expect(page.getByRole('region', { name: 'Tool guide' })).toContainText('ZIP');
  await page.getByRole('button', { name: 'TR', exact: true }).click();
  const turkishFaq = await page.locator('script[type="application/ld+json"]').evaluateAll(scripts => scripts.map(script => JSON.parse(script.textContent!)).find(schema => schema['@type'] === 'FAQPage'));
  expect(turkishFaq.inLanguage).toBe('tr-TR');
  expect(turkishFaq.mainEntity.some((item: { name: string }) => item.name.includes('ZIP'))).toBe(true);
});

test("a selected file is visibly acknowledged in both PDF comparison fields", async ({ page }) => {
  await page.goto('/tools/compare-pdf');
  const file = { name: 'document.pdf', mimeType: 'application/pdf', buffer: Buffer.from('selection-only fixture') };
  await page.locator('input[type="file"]').nth(0).setInputFiles(file);
  await page.locator('input[type="file"]').nth(1).setInputFiles(file);
  await expect(page.locator('button[data-has-files="true"]')).toHaveCount(2);
  await expect(page.locator('button[data-has-files="true"]').nth(0)).toContainText('document.pdf');
  await expect(page.getByRole('button', { name: 'Belgeleri karşılaştır', exact: true })).toBeEnabled();
});
