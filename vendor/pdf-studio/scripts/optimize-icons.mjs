import fs from 'node:fs/promises';
import * as library from 'lucide';
const file='src/main.js',text=await fs.readFile(file,'utf8');
const tokens=[...text.matchAll(/['"]([a-z][a-z0-9-]*)['"]/g)].map(m=>m[1]);
const names=[...new Set(tokens.map(n=>n.split('-').map(p=>p[0].toUpperCase()+p.slice(1)).join('')).filter(n=>library[n]&&Array.isArray(library[n])))].sort();
if(text.includes('import {createIcons,icons}'))await fs.writeFile(file,text.replace("import {createIcons,icons} from 'lucide';",`import {createIcons,${names.join(',')}} from 'lucide';\nconst icons={${names.join(',')}};`));
console.log(`Selected ${names.length} icons.`);
