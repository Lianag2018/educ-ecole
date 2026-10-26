// Decode and redraw locally: store one reduced JPEG, without the original file
// or camera EXIF. Keep a document-sized image and never upscale small photos.
export const PHOTO_IMAGE_LIMITS=Object.freeze({inputBytes:15000000,pixels:50000000,edge:2000,targetBytes:900000,storedBytes:1200000});
export function photoDimensions(width,height,edge=PHOTO_IMAGE_LIMITS.edge){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>PHOTO_IMAGE_LIMITS.pixels||!Number.isFinite(edge)||edge<1)throw Error('photo_invalid');
 const scale=Math.min(1,edge/Math.max(width,height));return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
export async function prepareSchoolPhoto(file){
 if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type)||!file.size||file.size>PHOTO_IMAGE_LIMITS.inputBytes)throw Error('photo_invalid');
 let image,url;
 // Decode the Blob directly when supported; no object-URL loading is needed.
 if(typeof createImageBitmap==='function'){try{image=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{}}
 if(!image){url=URL.createObjectURL(file);image=new Image();image.src=url;try{await image.decode();}catch{URL.revokeObjectURL(url);throw Error('photo_invalid');}}
 const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 try{
  photoDimensions(width,height);
  let best=null;
  for(const edge of [2000,1700,1445]){
   const size=photoDimensions(width,height,edge),canvas=document.createElement('canvas');Object.assign(canvas,size);
   const context=canvas.getContext('2d');if(!context)throw Error('photo_invalid');
   // A white paper background avoids black pixels when importing a transparent PNG.
   context.fillStyle='#fff';context.fillRect(0,0,size.width,size.height);context.drawImage(image,0,0,size.width,size.height);
   for(const quality of [.82,.72]){
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));if(!blob||blob.type!=='image/jpeg')throw Error('photo_invalid');
    if(!best||blob.size<best.blob.size)best={blob,...size,originalBytes:file.size};
    if(blob.size<=PHOTO_IMAGE_LIMITS.targetBytes)return {blob,...size,originalBytes:file.size};
   }
  }
  if(best?.blob.size<=PHOTO_IMAGE_LIMITS.storedBytes)return best;
  throw Error('photo_too_detailed');
 }finally{if(url)URL.revokeObjectURL(url);image.close?.();}
}
