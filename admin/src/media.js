export async function validateAdminFile(file,{kind='any'}={}) {
 if(!file?.size||file.size>10485760)throw Error('Choose a non-empty file up to 10 MB.');
 if(file.name.length>200||[...file.name].some(char=>char.codePointAt(0)<32||char.codePointAt(0)===127))throw Error('Use a filename under 200 characters without control characters.');
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer()),text=new TextDecoder().decode(bytes);
 const type=text.startsWith('%PDF-')?'pdf':[137,80,78,71,13,10,26,10].every((byte,index)=>bytes[index]===byte)?'png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpeg':text.startsWith('RIFF')&&text.slice(8,12)==='WEBP'?'webp':null;
 const extension=file.name.split('.').at(-1).toLowerCase();
 if(!type||!(type==='jpeg'?['jpg','jpeg']: [type]).includes(extension))throw Error('Choose a PDF, PNG, JPEG, or WebP with matching file content and extension.');
 if(kind==='image'&&type==='pdf')throw Error('This placement needs an image.');
 if(kind==='pdf'&&type!=='pdf')throw Error('Choose a PDF resume.');
 return type;
}
