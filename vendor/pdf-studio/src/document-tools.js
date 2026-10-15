export function parsePages(raw,count){
  if(!raw.trim())return Array.from({length:count},(_,i)=>i);
  const pages=[];
  for(const part of raw.split(',')){
    if(!/^\s*\d+(\s*-\s*\d+)?\s*$/.test(part))throw Error('Sayfa aralığı geçersiz. Örnek: 1-3, 5');
    const [start,last]=part.split('-').map(Number),end=last??start;
    if(start<1||end<start||end>count)throw Error('Sayfa aralığı belgenin dışında.');
    for(let n=start;n<=end;n++)if(!pages.includes(n-1))pages.push(n-1);
  }
  return pages;
}
export function splitGroups(count,mode,size=1,raw=''){
  if(!count)throw Error('Önce bir belge açın.');
  if(mode==='custom'){
    if(!raw.trim())throw Error('En az bir bölüm girin. Örnek: 1-2; 3,5');
    return raw.split(';').map(group=>{if(!group.trim())throw Error('Boş bölüm olamaz. Bölümleri noktalı virgülle ayırın.');return parsePages(group,count);});
  }
  const step=mode==='each'?1:Number(size);
  if(!Number.isInteger(step)||step<1||step>count)throw Error('Bölüm boyutu 1 ile sayfa sayısı arasında olmalı.');
  return Array.from({length:Math.ceil(count/step)},(_,i)=>Array.from({length:Math.min(step,count-i*step)},(_,j)=>i*step+j));
}
export function watermarkObject(p,settings,measure){
  const text=settings.text?.trim(),src=settings.src;
  if(!src&&!text)throw Error('Filigran metni yazın veya görsel seçin.');
  const rotation=p.rotation||0,pageWidth=rotation%180?p.h:p.w,pageHeight=rotation%180?p.w:p.h;
  let size=settings.size||44,w,h,type=src?'image':'text';
  if(src){w=pageWidth*.42;h=w/(settings.ratio||1);}else{w=measure(text,size);if(w>pageWidth*.8){size*=pageWidth*.8/w;w=pageWidth*.8;}h=size*1.35;}
  const angle=settings.angle||0,a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  // Anchor the rotated object by its visible bounding box, including on small pages.
  const bw=Math.abs(c*w)+Math.abs(s*h),bh=Math.abs(s*w)+Math.abs(c*h),limit=Math.min(1,(pageWidth-32)/bw,(pageHeight-32)/bh);
  w*=limit;h*=limit;size*=limit;
  const halfW=(Math.abs(c*w)+Math.abs(s*h))/2,halfH=(Math.abs(s*w)+Math.abs(c*h))/2;
  let cx=pageWidth/2,cy=pageHeight/2;
  if(settings.position.includes('left'))cx=20+halfW;
  if(settings.position.includes('right'))cx=pageWidth-20-halfW;
  if(settings.position.includes('top'))cy=20+halfH;
  if(settings.position.includes('bottom'))cy=pageHeight-20-halfH;
  const vx=cx-c*w/2+s*h/2,vy=cy-s*w/2-c*h/2;
  const [x,y]=rotation===90?[vy,p.h-vx]:rotation===180?[p.w-vx,p.h-vy]:rotation===270?[p.w-vy,vx]:[vx,vy];
  return {id:crypto.randomUUID(),type,x,y,w,h,angle:angle-rotation,color:settings.color||'#52645a',opacity:settings.opacity??.18,text:text||'',src,size,bold:true,watermark:true};
}
export const safeName=name=>String(name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').replace(/^\.+|\.+$/g,'').trim().slice(0,100)||'belge';
