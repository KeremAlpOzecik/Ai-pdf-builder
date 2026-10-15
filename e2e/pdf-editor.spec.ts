import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fontkit from '@pdf-lib/fontkit';

const studio = (page: Page) => page.frameLocator('iframe[title="ekoPDF PDF düzenleyici"]');
async function open(page: Page, embedded=true) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const font = await doc.embedFont(embedded ? await readFile('vendor/pdf-studio/public/fonts/italic.ttf') : StandardFonts.TimesRomanItalic, embedded ? {customName:'NotoSans-Italic'} : {});
  doc.addPage([595, 842]).drawText("Original editable text", {x:60,y:720,size:23,font});
  const bytes=Buffer.from(await doc.save());
  await page.goto("/tools/edit-pdf");
  await studio(page).locator('#file').setInputFiles({name:'test.pdf',mimeType:'application/pdf',buffer:bytes});
  await expect(studio(page).locator('#busy')).toBeHidden();
  await expect(studio(page).locator('#document')).toBeVisible();
  return textInfo(bytes);
}
async function exportPdf(page: Page) {
  await studio(page).locator('#export').click();
  const pending = page.waitForEvent('download');
  await studio(page).locator('#downloadnow').click();
  const file = await pending;
  return readFile((await file.path())!);
}
async function textInfo(bytes: Uint8Array) {
  const mupdf: typeof import('mupdf') = await new Function('return import("mupdf")')();
  const doc=mupdf.Document.openDocument(bytes,'application/pdf'),p=doc.loadPage(0),st=p.toStructuredText('');
  const chars:{char:string,font:string,size:number}[]=[];
  st.walk({onChar(char,origin,font,size){chars.push({char,font:font.getName(),size});}});
  const text=st.asText();st.destroy();p.destroy();doc.destroy();return {text,chars};
}

test('integrated editor replaces native text and preserves original font and size',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  const original=await open(page);
  await studio(page).locator('#edit').click();
  await studio(page).locator('[data-native="0"]').click();
  await expect(studio(page).locator('#propsize')).toHaveValue('23');
  await studio(page).locator('#proptext').fill('Edited native text');
  await studio(page).locator('#proptext').blur();
  await expect(studio(page).locator('#fontstatus')).toContainText('korunuyor');
  await page.screenshot({path:test.info().outputPath('editor.png'),fullPage:true});
  const result=await textInfo(await exportPdf(page));
  expect(result.text).toContain('Edited native text');expect(result.text).not.toContain('Original editable text');
  const clean=(s:string)=>s.replace(/^[A-Z]{6}\+/,'');
  expect(result.chars.map(c=>clean(c.font))).toEqual(result.chars.map(()=>clean(original.chars[0].font)));
  expect(result.chars.every(c=>Math.abs(c.size-23)<.01)).toBe(true);
  expect(errors).toEqual([]);
});

test('missing glyphs block export until full font upload and project round trip',async({page})=>{
  await open(page,false);await studio(page).locator('#edit').click();await studio(page).locator('[data-native="0"]').click();
  await studio(page).locator('#proptext').fill('Çağrı Şen İĞÜŞÖÇ');await studio(page).locator('#proptext').blur();
  await expect(studio(page).locator('#fontstatus')).toContainText('karakterler yok');
  await studio(page).locator('#export').click();await studio(page).locator('#downloadnow').click();
  await expect(studio(page).locator('#toast')).toContainText('karakterler yok');await studio(page).locator('#closemodal').click();
  await studio(page).locator('#fontfile').setInputFiles('vendor/pdf-studio/public/fonts/italic.ttf');
  await expect(studio(page).locator('#fontstatus')).toContainText('Yüklenen font');
  const pending=page.waitForEvent('download');await studio(page).locator('#project').click();const project=await pending;
  const bytes=await readFile((await project.path())!);await page.reload();
  await studio(page).locator('#file').setInputFiles({name:'test.ekopdf',mimeType:'application/json',buffer:bytes});
  await expect(studio(page).locator('#busy')).toBeHidden();await expect(studio(page).locator('#document')).toBeVisible();
  const result=await textInfo(await exportPdf(page));expect(result.text).toContain('Çağrı Şen İĞÜŞÖÇ');
  expect(result.chars.every(c=>c.font.includes('NotoSans-Italic')&&Math.abs(c.size-23)<.01)).toBe(true);
});

test('studio assets, worker and source archive are served locally',async({request})=>{
  for(const file of ['index.html','engine.js','font-engine.js','fonts/regular.ttf','mupdf/mupdf.js','mupdf/mupdf-wasm.wasm','source.zip','LICENSE.txt']){
    const res=await request.get('/pdf-studio/'+file);expect(res.status(),file).toBe(200);
    if(file.endsWith('.wasm'))expect(res.headers()['content-type']).toContain('application/wasm');
  }
});

test('mobile frame fits viewport and editor can export',async({page})=>{
  await page.setViewportSize({width:393,height:852});await open(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const box=await page.locator('iframe').boundingBox();expect(box!.width).toBeLessThanOrEqual(393);
  expect((await PDFDocument.load(await exportPdf(page))).getPageCount()).toBe(1);
});
