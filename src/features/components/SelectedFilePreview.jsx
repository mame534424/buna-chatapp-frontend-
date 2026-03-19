import React from "react";
import {File,Image as ImageIcon,Music,Video,X} from "lucide-react";
import { getAttachmentKind,formatFileSize } from "../utils/attachmentHelper";

export default function SelectedFilePreview({file,onRemove}){
    if(!file) return null;
    const kind=getAttachmentKind(file.type);
    const renderIcon=()=>{
        if(kind==="image") return <ImageIcon size={18}/>;
        if(kind==="video") return <Video size={18}/>;
        if(kind==="audio") return <Music size={18}/>;

        return <File size={18}/>;
    };
    return(
        <div className="mx-4 mb-2 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
          {renderIcon()}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-800">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {file.type || "Unknown type"} • {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="ml-3 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-red-500 transition"
      >
        <X size={16} />
      </button>
    </div>
    )
}