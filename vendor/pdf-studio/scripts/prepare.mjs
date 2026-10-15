import fs from 'node:fs/promises';
import JSZip from 'jszip';
import path from 'node:path';
const root=process.cwd();
const zip=new JSZip();
const roots=['src','public','scripts','tests','index.html','vite.config.js','playwright.config.js','package.json','package-lock.json','README.md','.gitignore'];
async function add(file){const stat=await fs.stat(file);if(stat.isDirectory()){for(const f of await fs.readdir(file))await add(path.join(file,f));}else if(!/source\.zip$|\.(png|pdf)$/.test(file)){zip.file(path.relative(root,file).replaceAll('\\','/'),await fs.readFile(file));}}
for(const f of roots)await add(path.join(root,f));
await fs.writeFile('public/source.zip',await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE'}));
console.log('Corresponding source archive prepared.');
