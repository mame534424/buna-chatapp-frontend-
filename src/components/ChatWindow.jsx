import React, { useMemo } from "react";
import { useState, useRef, useEffect } from "react";
import { Coffee, Send, Plus, MoreVertical, Phone, Video, Search, Info, UserPlus, Check, CheckCheck } from "lucide-react";
import AddParticipantsModal from "../components/AddParticipantsModal";

export default function ChatWindow({
  selectedConversation,
  onParticipantsAdded,
  currentUserId,
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
  messageReads
}) {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

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

  // Tick logic
  const isMessageReadBySomeoneElse = (messageId) => {
    return messageReads.some(
      (r) => r.messageId === messageId && r.userId !== currentUserId
    );
  };

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white p-8 ">
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
            <h3 className="text-2xl font-bold text-amber-900 mb-2">Welcome to Bunna Chat!</h3>
            <p className="text-gray-600">
              Select a conversation from the sidebar or search for someone to start chatting.
              Share stories over a virtual coffee ☕
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  const otherParticipants = selectedConversation?.participants?.filter(
    (p) => p.userId !== currentUserId
  );

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
            selectedConversation.group 
              ? "from-amber-600 to-amber-800" 
              : getAvatarColor(otherParticipants?.[0]?.userId)
          } flex items-center justify-center text-white font-bold`}>
            {selectedConversation.group 
              ? selectedConversation.name?.[0]?.toUpperCase() || "#"
              : otherParticipants?.[0]?.username?.[0]?.toUpperCase() 
            }
          </div>
          
          {/* Conversation Info */}
          <div>
            <h2 className="font-bold text-gray-900">
              {selectedConversation.group
                ? selectedConversation.name
                : otherParticipants?.map((p) => p.username || p.email).join(", ")}
            </h2>
            
          </div>
        </div>

        
        <div className="flex items-center space-x-4">
          {selectedConversation.group && (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
            >
              <UserPlus size={30} />
              <span>Add</span>
            </button>
          )}
          
        </div>
      </div>

      
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-amber-50/30 to-white p-4">
      
        {/* Messages */}
        <div className="space-y-3 max-2xl">
          {sortedMessages.map((m) => {
            const isMe = m.senderId === currentUserId;
            const messageTime = formatTime(m.createdAt);

            return (
              <div
                key={m.id}
                className={`flex items-end space-x-2 ${isMe ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {/* Avatar (for group chats or when not me) */}
                {(selectedConversation.group || !isMe) && (
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                    getAvatarColor(m.senderId)
                  } flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {getSenderName(m.senderId)?.[0]?.toUpperCase() || "U"}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    isMe
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-amber-100 shadow-sm rounded-bl-none"
                  }`}
                >
                  {/* Sender name (group chat only, not me) */}
                  {selectedConversation.group && !isMe && (
                    <div className="text-xs font-semibold mb-1 text-amber-700">
                      {getSenderName(m.senderId)}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="text-md">{m.content}</div>

                 
                  <div className={`flex items-center justify-end space-x-2 text-xs mt-2 ${
                    isMe ? "text-amber-100" : "text-gray-500"
                  }`}>
                    <span>{messageTime}</span>
                    {isMe && (
                      <span className="flex items-center">
                        {isMessageReadBySomeoneElse(m.id) ? (
                          <CheckCheck size={20} className="ml-1" />
                        ) : (
                          <Check size={20} className="ml-1" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Spacer for my messages */}
                {isMe && <div className="w-8"></div>}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button className="p-2.5 hover:bg-amber-50 rounded-full text-amber-600">
            <Plus size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full pl-5 pr-12 py-3 bg-gray-100 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message here..."
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              Press Enter to send
            </div>
          </div>
          
          <button
            className="p-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            onClick={sendMessage}
            disabled={!messageInput.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {/* Decorative Coffee Beans */}
      <div className="absolute top-10 right-10 opacity-5 pointer-events-none">
        <Coffee className="h-32 w-32 text-amber-900 transform rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-5 pointer-events-none">
        <Coffee className="h-24 w-24 text-amber-900 transform -rotate-12" />
      </div>

      {/* Add Participants Modal */}
      <AddParticipantsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        conversation={selectedConversation}
        onParticipantsAdded={onParticipantsAdded}
      />
    </div>
  );
}