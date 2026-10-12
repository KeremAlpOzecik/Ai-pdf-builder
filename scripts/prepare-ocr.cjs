/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs/promises');
const path = require('node:path');
async function main() {
  const root = path.resolve('public/ocr');
  await fs.mkdir(path.join(root, 'core'), {recursive:true});
  await fs.mkdir(path.join(root, 'lang'), {recursive:true});
  await fs.copyFile('node_modules/tesseract.js/dist/worker.min.js', path.join(root, 'worker.min.js'));
  await fs.copyFile('node_modules/tesseract.js/LICENSE.md', path.join(root, 'LICENSE-tesseract.txt'));
  await fs.copyFile('node_modules/tesseract.js-core/LICENSE', path.join(root, 'LICENSE-core.txt'));
  for (const name of await fs.readdir('node_modules/tesseract.js-core')) {
    if (name.endsWith('.wasm.js') || name.endsWith('.wasm')) await fs.copyFile(path.join('node_modules/tesseract.js-core',name),path.join(root,'core',name));
  }
  for (const language of ['eng','tur']) {
    const target = path.join(root,'lang',`${language}.traineddata.gz`);
    try { await fs.access(target); continue; } catch { /* Download once. */ }
    const response = await fetch(`https://tessdata.projectnaptha.com/4.0.0/${language}.traineddata.gz`);
    if (!response.ok) throw new Error(`Language download failed: ${response.status}`);
    await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
  }
}
main().catch(error => { console.error(error); process.exitCode=1; });
