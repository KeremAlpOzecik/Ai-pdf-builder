let PDFDocument,rgb,degrees,pushGraphicsState,popGraphicsState,concatTransformationMatrix,fontkit,JSZip,libraries;
// Keep export libraries off the initial editor path, too.
function loadLibraries(){return libraries??=Promise.all([import('pdf-lib'),import('@pdf-lib/fontkit'),import('jszip')]).then(([pdf,font,zip])=>{({PDFDocument,rgb,degrees,pushGraphicsState,popGraphicsState,concatTransformationMatrix}=pdf);fontkit=font.default;JSZip=zip.default;}).catch(error=>{libraries=undefined;throw error;});}
import {safeName} from './document-tools.js';
let worker,serial=0;const jobs=new Map();
// Download the PDF engine only when a document operation needs it.
function getWorker(){if(worker)return worker;worker=new Worker('/pdf-studio/engine.js',{type:'module'});
worker.onmessage=({data})=>{const j=jobs.get(data.id);if(j){jobs.delete(data.id);data.error?j.reject(Error(data.error)):j.resolve(data.result);}};
worker.onerror=e=>{for(const j of jobs.values())j.reject(Error(e.message||'PDF motoru başlatılamadı.'));jobs.clear();worker.terminate();worker=undefined;};return worker;}
export function engine(op,args={}){if(op==='open'||op==='close')fontCache.clear();return new Promise((resolve,reject)=>{const active=getWorker(),id=++serial;jobs.set(id,{resolve,reject});active.postMessage({id,op,...args});});}
export const uid=()=>crypto.randomUUID();
const fontCache=new Map();
function fontRequest(o){return {font:o.nativeFont,object:{text:o.text,size:o.size,w:o.w,h:o.h,color:o.color,opacity:o.opacity,align:o.align}};}
const fontKey=o=>{const request=fontRequest(o);if(request.font.upload)request.font={...request.font,upload:{id:request.font.upload.id,name:request.font.upload.name}};return JSON.stringify(request);};
export function peekFontText(o){return fontCache.get(fontKey(o))?.result;}
export function fontText(o){const key=fontKey(o);if(fontCache.has(key))return fontCache.get(key).promise;const item={};item.promise=engine('font-text',{sourceId:o.nativeFont.sourceId,...fontRequest(o)}).then(r=>{if(r.png){let binary='';for(let i=0;i<r.png.length;i+=8192)binary+=String.fromCharCode(...r.png.subarray(i,i+8192));r.preview='data:image/png;base64,'+btoa(binary);}item.result=r;return r;}).catch(e=>{item.result={reason:e.message,missing:[]};return item.result;});fontCache.set(key,item);if(fontCache.size>60)fontCache.delete(fontCache.keys().next().value);return item.promise;}
export function download(bytes,name,type){const u=URL.createObjectURL(new Blob([bytes],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
const hex=c=>{const n=parseInt(c.replace('#',''),16);return rgb((n>>16&255)/255,(n>>8&255)/255,(n&255)/255);};
let fontBytes;
async function fonts(){if(!fontBytes)fontBytes=Promise.all(['regular','bold','italic','bolditalic'].map(async n=>{const r=await fetch('/pdf-studio/fonts/'+n+'.ttf');if(!r.ok)throw Error('Yazı tipi yüklenemedi');return r.arrayBuffer();}));return fontBytes;}
export function removals(p){return [...(p.removed||[]),...p.objects.filter(o=>o.type==='redact').map(o=>({kind:'redact',rect:[o.x,o.y,o.x+o.w,o.y+o.h]}))];}
export async function renderBase(p,scale=1){if(!p.sourceId)return null;const {png}=await engine('render',{sourceId:p.sourceId,index:p.index,scale,removals:removals(p)});return new Blob([png],{type:'image/png'});}
export async function buildPDF(pages,title,{numbers=false}={}){await loadLibraries();const out=await PDFDocument.create();out.registerFontkit(fontkit);const fs=await Promise.all((await fonts()).map(b=>out.embedFont(b,{subset:true})));
for(let i=0;i<pages.length;i++){const p=pages[i];let page;if(p.sourceId){const {bytes}=await engine('export',{sourceId:p.sourceId,index:p.index,removals:removals(p)});const src=await PDFDocument.load(bytes);[page]=await out.copyPages(src,[0]);out.addPage(page);}else page=out.addPage([p.w,p.h]);
const crop=page.getCropBox(),r=((page.getRotation().angle%360)+360)%360;const maps={0:[1,0,0,1,crop.x,crop.y],90:[0,1,-1,0,crop.x+crop.width,crop.y],180:[-1,0,0,-1,crop.x+crop.width,crop.y+crop.height],270:[0,-1,1,0,crop.x,crop.y+crop.height]};page.pushOperators(pushGraphicsState(),concatTransformationMatrix(...maps[r]));
for(const o of p.objects){const x=o.x,y=p.h-o.y-o.h,color=hex(o.color||'#202620'),opacity=o.opacity??1;page.pushOperators(pushGraphicsState());if(o.angle){const a=o.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),px=o.x,py=p.h-o.y;page.pushOperators(concatTransformationMatrix(c,-s,s,c,px-c*px-s*py,py+s*px-c*py));}
if(o.type==='text'&&o.nativeFont&&o.fontMode!=='noto'){const native=await fontText(o);if(native.reason)throw Error(native.reason+' Öğe: '+o.text.slice(0,30));const fontPDF=await PDFDocument.load(native.bytes);const embedded=await out.embedPage(fontPDF.getPage(0));page.drawPage(embedded,{x:o.x,y:p.h-o.y-native.height,width:native.width,height:native.height});}
else if(o.type==='text'||o.type==='note'){const f=fs[(o.bold?1:0)+(o.italic?2:0)],size=o.size||16;const lines=o.text.split('\n');if(o.type==='note')page.drawRectangle({x,y,width:o.w,height:o.h,color:hex('#fff3b0'),opacity});for(let k=0;k<lines.length;k++){const width=f.widthOfTextAtSize(lines[k],size);const tx=x+(o.align==='center'?(o.w-width)/2:o.align==='right'?o.w-width:0);page.drawText(lines[k],{x:tx,y:p.h-o.y-size-k*size*1.35,size,font:f,color,opacity});}}
if(o.type==='rect'||o.type==='highlight'||o.type==='redact')page.drawRectangle({x,y,width:o.w,height:o.h,color:o.fill!==false?color:undefined,borderColor:color,borderWidth:o.stroke||0,opacity,borderOpacity:opacity});
if(o.type==='ellipse')page.drawEllipse({x:x+o.w/2,y:y+o.h/2,xScale:o.w/2,yScale:o.h/2,color:o.fill!==false?color:undefined,borderColor:color,borderWidth:o.stroke||1,opacity,borderOpacity:opacity});
if(o.type==='line'||o.type==='arrow'){const a={x,y:p.h-o.y},b={x:x+o.w,y:p.h-o.y-o.h};page.drawLine({start:a,end:b,thickness:o.stroke||2,color,opacity});if(o.type==='arrow'){const angle=Math.atan2(b.y-a.y,b.x-a.x);for(const sign of [-1,1])page.drawLine({start:b,end:{x:b.x-12*Math.cos(angle+sign*.45),y:b.y-12*Math.sin(angle+sign*.45)},thickness:o.stroke||2,color,opacity});}}
if(o.type==='draw'){for(let k=1;k<o.points.length;k++)page.drawLine({start:{x:o.x+o.points[k-1][0],y:p.h-o.y-o.points[k-1][1]},end:{x:o.x+o.points[k][0],y:p.h-o.y-o.points[k][1]},thickness:o.stroke||2,color,opacity});}
if(o.type==='image'){const raw=await fetch(o.src).then(r=>r.arrayBuffer());const img=o.src.startsWith('data:image/jpeg')?await out.embedJpg(raw):await out.embedPng(raw);page.drawImage(img,{x,y,width:o.w,height:o.h,opacity});}page.pushOperators(popGraphicsState());}
if(numbers)page.drawText(`${i+1} / ${pages.length}`,{x:p.w/2-15,y:16,font:fs[0],size:9,color:hex('#52645a')});page.pushOperators(popGraphicsState());page.setRotation(degrees((r+(p.rotation||0))%360));}
out.setTitle(title);out.setProducer('ekoPDF');out.setCreator('ekoPDF');return out.save();}
export async function imageExport(bytes,format,scale=2){await loadLibraries();const sourceId=uid(),{pages}=await engine('open',{sourceId,bytes});try{const zip=new JSZip();for(let i=0;i<pages.length;i++){const {png}=await engine('render',{sourceId,index:i,scale});let data=png;if(format==='jpg'){const bitmap=await createImageBitmap(new Blob([png]));const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;c.getContext('2d').drawImage(bitmap,0,0);data=new Uint8Array(await(await new Promise(r=>c.toBlob(r,'image/jpeg',.92))).arrayBuffer());bitmap.close();}zip.file(`sayfa-${i+1}.${format}`,data);}return zip.generateAsync({type:'uint8array'});}finally{await engine('close',{sourceId});}}
export async function splitPDF(pages,title,groups,onProgress=()=>{}){await loadLibraries();
  const zip=new JSZip(),name=safeName(title),pad=n=>String(n).padStart(3,'0');
  for(let i=0;i<groups.length;i++){
    onProgress(i+1,groups.length);
    const indices=groups[i];
    const bytes=await buildPDF(indices.map(n=>pages[n]),`${title} — Bölüm ${i+1}`);
    zip.file(`${name}-${pad(i+1)}.pdf`,bytes);
  }
  return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
export async function compressPDF(bytes,mode='lossless',onProgress=()=>{}){await loadLibraries();
  let optimized;
  if(mode==='lossless')optimized=(await engine('optimize',{bytes})).bytes;
  else{
    const sourceId=uid(),opened=await engine('open',{sourceId,bytes}),out=await PDFDocument.create();
    try{for(let i=0;i<opened.pages.length;i++){
      onProgress(i+1,opened.pages.length);
      const p=opened.pages[i],scale=mode==='small'?96/72:2,quality=mode==='small'?.62:.8;
      const maxScale=Math.min(scale,6000/p.w,6000/p.h);
      const {png}=await engine('render',{sourceId,index:i,scale:maxScale});
      const bitmap=await createImageBitmap(new Blob([png]));
      const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));
      if(!blob)throw Error('Sayfa sıkıştırılamadı.');
      const image=await out.embedJpg(await blob.arrayBuffer());
      out.addPage([p.w,p.h]).drawImage(image,{x:0,y:0,width:p.w,height:p.h});
      canvas.width=canvas.height=1;
    }optimized=await out.save();}finally{await engine('close',{sourceId});}
  }
  const usedOriginal=optimized.length>=bytes.length;
  return {bytes:usedOriginal?bytes:optimized,originalSize:bytes.length,resultSize:usedOriginal?bytes.length:optimized.length,usedOriginal,mode};
}
