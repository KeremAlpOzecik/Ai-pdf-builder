import { expect, test } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import sharp from "sharp";

const lines = ["Jane Smith", "Software Engineer", "jane@example.com", "+90 555 123 45 67", "", "Experience", "Engineer", "Acme Ltd", "2020 - 2023", "Built reliable software", "", "Education", "Example University", "BSc Computer Science", "2016 - 2020", "", "Skills", "TypeScript, React"];
test('selectable PDF stays local, preserves source text and exports a draft', async ({page}) => {
  const requests: string[]=[];
  page.on('request', request => {if(request.method()==='POST') requests.push(request.url());});
  await page.goto('/studio');
  const pdf=await PDFDocument.create(); const font=await pdf.embedFont(StandardFonts.Helvetica); const sheet=pdf.addPage();
  lines.forEach((line,index)=>{if(line)sheet.drawText(line,{x:40,y:790-index*22,size:13,font});});
  await page.locator('input[type=file][accept*="application/pdf"]').setInputFiles({name:'cv.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
  await expect(page.getByLabel('Çıkarılan metin')).toHaveValue(/jane@example.com/);
  await expect(page.locator('input[value="Jane Smith"]')).toBeVisible();
  await expect(page.locator('input[value="jane@example.com"]')).toBeVisible();
  if (test.info().project.name === 'mobile-chromium') await page.getByRole('button',{name:'İçe aktarma kontrolü',exact:true}).click();
  await page.getByLabel('Çıkarılan metin').fill(lines.join('\n').replace('Jane Smith','Jane Doe'));
  page.once('dialog',dialog=>dialog.accept());
  await page.getByRole('button',{name:'Metinden taslağı yeniden doldur',exact:true}).click();
  if (test.info().project.name === 'mobile-chromium') await page.getByRole('button',{name:'Düzenle',exact:true}).click();
  await expect(page.locator('input[value="Jane Doe"]')).toBeVisible();
  if (test.info().project.name === 'mobile-chromium') await page.getByRole('button',{name:'Önizleme',exact:true}).click();
  const download=page.waitForEvent('download');
  await page.getByRole('button',{name:'PDF indir',exact:true}).first().click();
  expect((await download).suggestedFilename()).toMatch(/\.pdf$/);
  expect(requests.filter(url=>/\/api\//.test(url))).toEqual([]);
  await expect(page.getByRole('button',{name:'ATS için düzenle',exact:true})).toHaveCount(0);
});

for(const format of ['png','jpeg','webp','scanned-pdf'] as const) test(`real ${format} OCR fills contacts without a document upload`,async({page})=>{
  test.setTimeout(180_000);
  const requests:string[]=[];
  page.on('request', request=>{if(request.method()==='POST'||/^https?:/.test(request.url())&&!request.url().startsWith('http://127.0.0.1:3100'))requests.push(request.url());});
  await page.goto('/studio');
  const sourceLines = format === 'png' ? lines.map(line => ({'Jane Smith':'Ayşe Yılmaz','Experience':'İş Deneyimi','Education':'Eğitim','Skills':'Beceriler'}[line] ?? line)) : lines;
  const png=Buffer.from(await page.evaluate((content)=>{
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1500;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,1200,1500);ctx.fillStyle='black';ctx.font='30px Arial';
    content.forEach((line,index)=>ctx.fillText(line,70,80+index*62));return canvas.toDataURL('image/png').split(',')[1];
  },sourceLines),'base64');
  let buffer:Buffer;let mimeType:string;let name:string;
  if(format==='scanned-pdf'){
    const pdf=await PDFDocument.create();const image=await pdf.embedPng(png);pdf.addPage([600,750]).drawImage(image,{x:0,y:0,width:600,height:750});buffer=Buffer.from(await pdf.save());mimeType='application/pdf';name='scan.pdf';
  }else{buffer=await sharp(png).toFormat(format).toBuffer();mimeType=`image/${format}`;name=`cv.${format}`;}
  await page.locator(`input[type=file][accept*="${format==='scanned-pdf'?'application/pdf':'image/png'}"]`).setInputFiles({name,mimeType,buffer});
  await expect(page.getByLabel('Çıkarılan metin')).toHaveValue(/jane@example.com/,{timeout:150_000});
  await expect(page.locator(`input[value="${format==='png'?'Ayşe Yılmaz':'Jane Smith'}"]`)).toBeVisible();
  expect(requests.filter(url=>/\/api\//.test(url)||/groq|google|jsdelivr|projectnaptha/.test(url))).toEqual([]);
});

test('invalid PDF leaves the editor available and does not create a draft',async({page})=>{
  await page.goto('/studio');
  await page.locator('input[type=file][accept*="application/pdf"]').setInputFiles({name:'broken.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a PDF')});
  await expect(page.getByText('Geçerli bir PDF seç.',{exact:true})).toBeVisible();
  await expect(page.getByLabel('Çıkarılan metin')).toHaveCount(0);
});

test('failed replacement keeps an existing imported CV intact',async({page})=>{
  await page.goto('/studio');
  const pdf=await PDFDocument.create();const font=await pdf.embedFont(StandardFonts.Helvetica);const sheet=pdf.addPage();
  lines.forEach((line,index)=>{if(line)sheet.drawText(line,{x:40,y:790-index*22,size:13,font});});
  await page.locator('input[type=file][accept*="application/pdf"]').setInputFiles({name:'cv.pdf',mimeType:'application/pdf',buffer:Buffer.from(await pdf.save())});
  await expect(page.locator('input[value="Jane Smith"]')).toBeVisible();
  await page.getByRole('tab',{name:'İçe aktar',exact:true}).click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('input[type=file][accept*="application/pdf"]').setInputFiles({name:'broken.pdf',mimeType:'application/pdf',buffer:Buffer.from('invalid')});
  await expect(page.getByText('Geçerli bir PDF seç.',{exact:true})).toBeVisible();
  await page.getByRole('tab',{name:'Kişisel',exact:true}).click();
  await expect(page.locator('input[value="Jane Smith"]')).toBeVisible();
});
