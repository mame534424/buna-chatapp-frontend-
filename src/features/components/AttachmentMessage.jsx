import React, { useEffect, useState } from "react";
import {
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  ArrowUpRight,
} from "lucide-react";
import {
  getAttachmentKind,
  formatFileSize,
} from "../utils/attachmentHelper";
import { getSignedViewUrl } from "../api/storageApi";

export default function AttachmentMessage({
  attachment,
  isOwnMessage,
  onOpenAttachment,
}) {
  const mimeType = attachment?.mimeType || "";
  const fileName = attachment?.originalName || "Attachment";
  const fileSize = attachment?.sizeBytes || 0;
  const kind = getAttachmentKind(mimeType);

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    let active = true;

    const loadPreview = async () => {
      if (kind !== "image") return;

      try {
        const result = await getSignedViewUrl(attachment.id);
        if (active) {
          setPreviewUrl(result.url);
        }
      } catch (error) {
        console.error("Failed to load image preview:", error);
      }
    };

    loadPreview();

    return () => {
      active = false;
    };
  }, [attachment.id, kind]);

  const renderIcon = () => {
    if (kind === "image") return <ImageIcon size={20} />;
    if (kind === "video") return <Video size={20} />;
    if (kind === "audio") return <Music size={20} />;
    if (kind === "pdf") return <FileText size={20} />;
    return <File size={20} />;
  };

  const renderLabel = () => {
    if (kind === "image") return "Photo";
    if (kind === "video") return "Video";
    if (kind === "audio") return "Audio";
    if (kind === "pdf") return "PDF Document";
    return "File";
  };

  // IMAGE PREVIEW
  if (kind === "image" && previewUrl) {
    return (
      <button
        type="button"
        onClick={() => onOpenAttachment(attachment.id)}
        className="mt-2 block w-full overflow-hidden rounded-2xl"
      >
        <img
          src={previewUrl}
          alt={fileName}
          className="max-h-80 w-full rounded-2xl object-cover border border-amber-200"
        />
      </button>
    );
  }

  // FILE / VIDEO / AUDIO / PDF CARD
  return (
    <button
      type="button"
      onClick={() => onOpenAttachment(attachment.id)}
      className={`mt-2 w-full rounded-2xl border p-3 text-left transition hover:scale-[1.01] ${
        isOwnMessage
          ? "border-amber-300 bg-white/15 hover:bg-white/20"
          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
            isOwnMessage
              ? "bg-white/20 text-white"
              : "bg-white text-amber-700 shadow-sm"
          }`}
        >
          {renderIcon()}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              isOwnMessage ? "text-white" : "text-gray-800"
            }`}
          >
            {fileName}
          </p>
          <p
            className={`text-xs ${
              isOwnMessage ? "text-amber-100" : "text-gray-500"
            }`}
          >
            {renderLabel()} • {formatFileSize(fileSize)}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            isOwnMessage
              ? "bg-white/15 text-white"
              : "bg-white text-gray-600 shadow-sm"
          }`}
        >
          <ArrowUpRight size={16} />
        </div>
      </div>
    </button>
  );
}