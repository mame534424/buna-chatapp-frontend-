export const detectMessageType=(file)=>{
    if(file.type.startsWith("image/")){
        return "IMAGE";
    }
    if(file.type.startsWith("video/")){
        return "VIDEO";
    }
    if(file.type.startsWith("audio/")){
        return "AUDIO";
    }
    return "FILE";
}
export const getAttachmentKind=(mimeType="")=>{
    if(mimeType.startsWith("image/")) return "image"
    if(mimeType.startsWith("video/")) return "video"
    if(mimeType.startsWith("audio/")) return "audio"
    return "file"
}
export const formatFileSize=(Bytes=0)=>{
    if(Bytes<1024) return `${Bytes} B`;
    if(Bytes<1024*1024) return `${(Bytes/1024).toFixed(1)} KB`;
    return `${(Bytes/(1024*1024)).toFixed(1)} MB`;}
export const getDisplayText=(message)=>{
    return message?.content||message?.text||"";
}

