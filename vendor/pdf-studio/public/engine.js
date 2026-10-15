import {createFontService} from './font-engine.js';
let mupdf,fontService;
const ready=import('./mupdf/mupdf.js').then(m=>{mupdf=m;fontService=createFontService(m);});
const docs = new Map();
function open(bytes,password){const d=mupdf.Document.openDocument(new Uint8Array(bytes),'application/pdf');if(d.needsPassword()&&!d.authenticatePassword(password||'')){d.destroy();throw Error('PASSWORD_REQUIRED');}return d.asPDF();}
function redacted(d,index,removals){const out=new mupdf.PDFDocument();out.graftPage(0,d,index);const p=out.loadPage(0);for(const r of removals){const a=p.createAnnotation('Redact');a.setRect(r.rect);p.applyRedactions(false,r.kind==='redact'?2:r.kind==='image'?1:0,r.kind==='redact'?2:0,r.kind==='image'?1:0);a.destroy();}p.destroy();return out;}
self.onmessage=async({data:q})=>{try{await ready;let result;const d=docs.get(q.sourceId);if(q.op==='open'){const doc=open(q.bytes,q.password);fontService.clear(q.sourceId);docs.get(q.sourceId)?.destroy();docs.set(q.sourceId,doc);const pages=[];for(let i=0;i<doc.countPages();i++){const p=doc.loadPage(i),b=p.getBounds();pages.push({index:i,w:b[2]-b[0],h:b[3]-b[1]});p.destroy();}result={pages};}
if(q.op==='close'){fontService.clear(q.sourceId);d?.destroy();docs.delete(q.sourceId);result=true;}
if(q.op==='font-text')result=fontService.render(d,q.font,q.object,q.preview!==false);
if(q.op==='optimize'){const doc=open(q.bytes);try{const buffer=doc.saveToBuffer('garbage=4,compress,compress-images,compress-fonts');result={bytes:buffer.asUint8Array().slice()};buffer.destroy();}finally{doc.destroy();}}
if(q.op==='page'){const p=fontService.inspect(d,q.sourceId,q.index);result={lines:p.lines,images:p.images};}
if(q.op==='render'||q.op==='export'){const tmp=redacted(d,q.index,q.removals||[]);if(q.op==='export'){const b=tmp.saveToBuffer('garbage=4,compress');result={bytes:b.asUint8Array().slice()};b.destroy();}else{const p=tmp.loadPage(0),pix=p.toPixmap(mupdf.Matrix.scale(q.scale,q.scale),mupdf.ColorSpace.DeviceRGB,false);result={png:pix.asPNG().slice()};pix.destroy();p.destroy();}tmp.destroy();}
self.postMessage({id:q.id,result});}catch(e){self.postMessage({id:q.id,error:e.message||String(e)});}};

