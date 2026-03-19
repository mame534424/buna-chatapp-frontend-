import React from "react";
import { Check,CheckCheck } from "lucide-react";
import AttachmentMessage from "./AttachmentMessage";
import { getDisplayText } from "../utils/attachmentHelper";

export function MessageBubble({
    message,
    isOwnMessage,
    isGroup,
    senderName,
    avatarColor,
    showAvatar,
    currentUserId,
    messageReads,
    onOpenAttachment,
    formatTime
}){
    const textContent=getDisplayText(message)
    const attachments=message?.attachments||[];
    console.log("MessageBubble message:", message);
    console.log("MessageBubble attachments:", attachments);
    
    // function to check if any other user has read the message
    const isMessageReadSomeoneElse=(messageId)=>{
        return messageReads.some((read)=>read.messageId===messageId && read.userId!==currentUserId);
    }

    return(
        <div
      className={`flex items-end space-x-2 ${
        isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {showAvatar && (
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {senderName?.[0]?.toUpperCase() || "U"}
        </div>
      )}

      <div
        className={`max-w-[72%] rounded-2xl p-4 ${
          isOwnMessage
            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-amber-100 shadow-sm rounded-bl-none"
        }`}
      >
        {isGroup && !isOwnMessage && (
          <div className="mb-1 text-xs font-semibold text-amber-700">
            {senderName}
          </div>
        )}

        

        {attachments.length > 0 && (
          <div className={`mb-2 space-y-2`}>
            {attachments.map((attachment) => (
              <AttachmentMessage
                key={attachment.id}
                attachment={attachment}
                isOwnMessage={isOwnMessage}
                onOpenAttachment={onOpenAttachment}
              />
            ))}
          </div>
        )}
        {textContent && (
          <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {textContent}
          </div>
        )}

        <div
          className={`mt-2 flex items-center justify-end space-x-1 text-xs ${
            isOwnMessage ? "text-amber-100" : "text-gray-500"
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>

          {isOwnMessage && (
            <span className="flex items-center">
              {isMessageReadSomeoneElse(message.id) ? (
                <CheckCheck size={16} className="ml-1" />
              ) : (
                <Check size={16} className="ml-1" />
              )}
            </span>
          )}
        </div>
      </div>

      {isOwnMessage && <div className="w-8" />}
    </div>
  );
}