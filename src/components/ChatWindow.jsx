import React, { useMemo } from "react";
import { useState } from "react";
import { set } from "react-hook-form";
import { Coffee, LogIn } from "lucide-react";
import AddParticipantsModal from "../components/AddParticipantsModal";



export default function ChatWindow({
  selectedConversation,onParticipantsAdded,
  currentUserId,
  messages,
  messageInput,
  setMessageInput,
  sendMessage,messageReads
}) {
  // Sort messages safely
  const [open, setOpen] = useState(false);

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

  // Tick logic
  const isMessageReadBySomeoneElse = (messageId) => {
  return messageReads.some(
    (r) => r.messageId === messageId && r.userId !== currentUserId
  );
};

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Select a conversation to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* HEADER */}
      <div className="p-4 border-b font-bold flex items-center justify-between">
    
          {/* Conversation Title */}
          <div>
            {selectedConversation.group
              ? selectedConversation.name
              : selectedConversation.participants
                  ?.filter((p) => p.userId !== currentUserId)
                  .map((p) => p.username || p.email)
                  .join(", ")}
          </div>

            {/* Add Participants (GROUP ONLY) */}
            {selectedConversation.group && (
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <span className="text-lg">+</span>
                <span>Add participants</span>
              </button>
            )}

      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
        {sortedMessages.map((m) => {
          const isMe = m.senderId === currentUserId;

          return (
            <div
              key={m.id}
              className={`p-3 rounded-lg max-w-[70%] ${
                isMe
                  ? "bg-blue-500 text-white self-end"
                  : "bg-gray-200 text-gray-800 self-start"
              }`}
            >
              {/* Sender name (group chat only, not me) */}
              {selectedConversation.group && !isMe && (
                <div className="text-xs font-semibold mb-1 text-gray-600">
                  {getSenderName(m.senderId)}
                </div>
              )}

              {/* Content */}
              <div>{m.content}</div>

              {/* Time + ticks */}
              <div className="flex justify-end items-center space-x-1 text-xs opacity-75 mt-1">
                <span>
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {m.senderId === currentUserId && (
                <span>
                  {isMessageReadBySomeoneElse(m.id) ? "✓✓" : "✓"}
                </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t flex space-x-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          onClick={sendMessage}
          disabled={!messageInput.trim()}
        >
          Send
        </button>
      </div>
      <div className="absolute top-10 right-10 opacity-10">
        <Coffee className="h-32 w-32 text-brown-900 transform rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <Coffee className="h-24 w-24 text-brown-900 transform -rotate-12" />
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
