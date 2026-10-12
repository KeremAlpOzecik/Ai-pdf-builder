import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

for (const output of ['JPEG','WebP']) test(`photo is below 100 KB with valid ${output} bytes and stays local`,async({page})=>{
  const uploads:string[]=[];
  page.on('request',request=>{if(request.method()==='POST'&&!request.url().includes('/_vercel/insights/')) uploads.push(request.url());});
  await page.goto('/tools/compress-image');
  const bytes=Buffer.from(await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=700;const ctx=canvas.getContext('2d')!;const image=ctx.createImageData(1000,700);let seed=42;
    for(let i=0;i<image.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;image.data[i]=seed&255;image.data[i+1]=(seed>>>8)&255;image.data[i+2]=(seed>>>16)&255;image.data[i+3]=255;}ctx.putImageData(image,0,0);return canvas.toDataURL().split(',')[1];
  }),'base64');
  await page.locator('input[type=file]').setInputFiles({name:'photo.png',mimeType:'image/png',buffer:bytes});
  await expect(page.locator('button[data-has-files="true"]')).toContainText('1 dosya seçildi');
  await expect(page.locator('button[data-has-files="true"]')).toContainText('photo.png');
  await expect(page.getByRole('img',{name:'Orijinal',exact:true})).toBeVisible();
  await expect.poll(()=>page.getByRole('img',{name:'Orijinal',exact:true}).evaluate(image=>(image as HTMLImageElement).naturalWidth)).toBe(1000);
  await expect(page.getByRole('button',{name:'Fotoğrafı indir',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'100 KB',exact:true}).click();
  await page.getByLabel('Çıktı biçimi').selectOption(output==='JPEG'?'image/jpeg':'image/webp');
  await page.getByRole('button',{name:'Fotoğrafı küçült',exact:true}).click();
  await expect(page.getByText('Hedef sınırın altında.',{exact:false})).toBeVisible();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Fotoğrafı indir',exact:true}).click();
  const downloaded=await download;const result=await readFile((await downloaded.path())!);
  expect(result.length).toBeLessThanOrEqual(100000);
  const metadata=await sharp(result).metadata();expect(metadata.format).toBe(output==='JPEG'?'jpeg':'webp');expect(metadata.width!).toBeLessThanOrEqual(1000);
  expect(uploads).toEqual([]);
  await page.getByRole('button',{name:'500 KB',exact:true}).click();await expect(page.getByRole('button',{name:'Fotoğrafı indir',exact:true})).toHaveCount(0);
  await expect(page.getByRole('img',{name:'Orijinal',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Fotoğrafı kaldır',exact:true}).click();
  await expect(page.locator('button[data-has-files="true"]')).toHaveCount(0);
  await expect(page.getByRole('img',{name:'Orijinal',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Fotoğrafı küçült',exact:true})).toBeDisabled();
});
test('invalid content reports an error and never enables a download',async({page})=>{
  await page.goto('/tools/compress-image');await page.locator('input[type=file]').setInputFiles({name:'bad.jpg',mimeType:'image/jpeg',buffer:Buffer.from('invalid')});
  await page.getByRole('button',{name:'Fotoğrafı küçült',exact:true}).click();await expect(page.getByRole('alert').filter({hasText:'Görsel işlenemedi'})).toBeVisible();await expect(page.getByRole('button',{name:'Fotoğrafı indir',exact:true})).toHaveCount(0);
});
