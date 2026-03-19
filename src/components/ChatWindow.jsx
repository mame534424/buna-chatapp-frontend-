import React, { useMemo } from "react";
import { useState, useRef, useEffect } from "react";
import { Coffee, Send, Plus, UserPlus} from "lucide-react";
import AddParticipantsModal from "../components/AddParticipantsModal";
import { MessageBubble } from "../features/components/messageBubble";
import SelectedFilePreview from "../features/components/SelectedFilePreview";
import { getSignedViewUrl } from "../features/api/storageApi";
import { toast } from "react-toastify";

export default function ChatWindow({
  selectedConversation,
  onParticipantsAdded,
  currentUserId,
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
  messageReads,
    setSelectedFile,
    fileInputRef,
    selectedFile,
    avatarUrls
}) {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatUserId = selectedConversation?.participants
  ?.find((p) => p.userId !== currentUserId)?.userId;

  const chatAvatarUrl = avatarUrls?.[chatUserId];
  

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sort messages safely
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages]);

  // Get sender name (for group chats)
  const getSenderName = (senderId) => {
    const user = selectedConversation?.participants?.find(
      (p) => p.userId === senderId
    );
    return user?.username || user?.email || "Unknown";
  };

  // Get sender avatar color based on user ID
  const getAvatarColor = (userId) => {
    const colors = [
      "from-amber-500 to-amber-700",
      "from-amber-600 to-orange-600",
      "from-yellow-600 to-amber-600",
      "from-orange-500 to-amber-600",
      "from-amber-700 to-brown-600",
    ];
    return colors[userId % colors.length];
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  
  // file choose is handled by the hidden file input, triggered by the attachment button
  const handleChooseFile=() => {
    fileInputRef.current.click();
  }

  // handle file change 
  const handleFileChange=(e) => {
    const file=e.target.files[0];
    if(!file) return;
    setSelectedFile(file);
  };
  // remove file from file peaker 
  const handleRemoveFile=()=>{
    setSelectedFile(null);
    if(fileInputRef.current){
      fileInputRef.current.value="";
    }
  }
  console.log("Selected file in ChatWindow:", selectedFile);
  // handle open attachment file 
  const handleOpenAttachment=async (attachmentId)=>{
    try {
      const response=await getSignedViewUrl(attachmentId);
      const signedUrl=response.url;

      if(!signedUrl){
        throw new Error("Failed to get signed URL for attachment");
      }
      window.open(signedUrl, "_blank");
      
    } catch (error) {
      console.error("Error opening attachment:", error);
      toast.error("Failed to open attachment. Please try again.");
      
    }
  } 

 if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 mx-auto flex items-center justify-center">
              <Coffee className="h-20 w-20 text-amber-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <Send className="h-6 w-6 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-amber-900 mb-2">
              Welcome to Bunna Chat!
            </h3>
            <p className="text-gray-600">
              Select a conversation from the sidebar or search for someone to
              start chatting. Share stories over a virtual coffee ☕
            </p>
          </div>
        </div>
      </div>
    );}

  
  const otherParticipants = selectedConversation?.participants?.filter(
    (p) => p.userId !== currentUserId
  );

 return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
                    {chatAvatarUrl ? (
            <img
              src={chatAvatarUrl}
              alt="User"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                selectedConversation.group
                  ? "from-amber-600 to-amber-800"
                  : getAvatarColor(chatUserId || 0)
              } flex items-center justify-center text-white font-bold`}
            >
              {selectedConversation.group
                ? selectedConversation.name?.[0]?.toUpperCase() || "#"
                : selectedConversation?.participants
                    ?.find((p) => p.userId !== currentUserId)
                    ?.username?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          <div>
            <h2 className="font-bold text-gray-900">
              {selectedConversation.group
                ? selectedConversation.name
                : otherParticipants
                    ?.map((p) => p.username || p.email)
                    .join(", ")}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedConversation.group && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
            >
              <UserPlus size={18} />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-amber-50/30 to-white p-4">
        <div className="space-y-3">
          {sortedMessages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                isGroup={selectedConversation.group}
                senderName={getSenderName(message.senderId)}
                avatarColor={getAvatarColor(message.senderId)}
                showAvatar={selectedConversation.group || !isOwnMessage}
                currentUserId={currentUserId}
                messageReads={messageReads}
                onOpenAttachment={handleOpenAttachment}
                formatTime={formatTime}
              />
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <SelectedFilePreview
        file={selectedFile}
        onRemove={handleRemoveFile}
      />

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleChooseFile}
            className="p-2.5 hover:bg-amber-50 rounded-full text-amber-600 transition"
          >
            <Plus size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              type="file"
              ref={fileInputRef}
              hidden
              onChange={handleFileChange}
            />

            <input
              type="text"
              className="w-full pl-5 pr-12 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Write a message..."
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              Enter
            </div>
          </div>

          <button
            className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            onClick={sendMessage}
            disabled={!messageInput.trim() && !selectedFile}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
        <Coffee className="h-32 w-32 text-amber-900 rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-5 pointer-events-none">
        <Coffee className="h-24 w-24 text-amber-900 -rotate-12" />
      </div>

      <AddParticipantsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        conversation={selectedConversation}
        onParticipantsAdded={onParticipantsAdded}
      />
    </div>
  );
}