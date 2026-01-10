import React, { useEffect, useState } from "react";
import API from "../chatapp-frontend/src/utils/axiosInstance";
import { useAuth } from "../chatapp-frontend/src/context/AuthContext";
import { useWebSocket } from "../chatapp-frontend/src/context/WebSocketProvider";
import { getAllUsers, getCurrentUser } from "../chatapp-frontend/src/api/userApi";

export default function Dashboard() {
  const { user } = useAuth(); // user ID from /users/me
  const { stompClient, connected } = useWebSocket();

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupParticipants, setGroupParticipants] = useState([]);

  // const currentUserId = user;
  // console.log("Current User ID in Dashboard:", currentUserId);

  /** Fetch all users */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);
  console.log("All users in Dashboard:", users);

  /** Fetch current user object */
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userObj = await getCurrentUser();
        console.log("Current user in Dashboard:", userObj);
        setCurrentUser(userObj);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);
  const currentUserId = currentUser?.id;
  console.log("Current User ID in Dashboard:", currentUserId);

  /** Fetch conversations */
  const fetchConversations = async () => {
    if (!currentUserId) return;
    try {
      const res = await API.get(`/conversations/user/${currentUserId}`);
      setConversations(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    }
  };

  /** Fetch messages */
  const fetchMessages = async (convId) => {
    try {
      const res = await API.get(`/messages/conversation/${convId}`);
      setMessages(res.data.data?.content || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };
console.log("Messages received:", messages.map(m => m.createdAt));
const sortedMessages = [...messages].sort(
  (a, b) => new Date(a.createdAt) - new Date(b.createdAt));


  /** Send message */
  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversation || !stompClient?.connected) return;

    const payload = {
      conversationId: selectedConversation.id,
      senderId: currentUserId,
      text: messageInput.trim(),
    };

    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(payload),
    });

    setMessageInput("");
  };
useEffect(() => {
  if (!stompClient || !connected || !currentUserId) return;

  const subscription = stompClient.subscribe(
    `/topic/users/${currentUserId}/conversations`, // Note: backend sends to this topic for conversation updates
    (msg) => {
      try {
        const message = JSON.parse(msg.body);

        // If the message belongs to the selected conversation, append to chat window
        if (selectedConversation?.id === message.conversationId) {
          setMessages((prev) => [...prev, message]);
        }

        // Update lastMessage in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === message.conversationId ? { ...c, lastMessage: message } : c
          )
        );
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    }
  );

  return () => subscription.unsubscribe();
}, [stompClient, connected, currentUserId, selectedConversation]);



  /** Create private conversation */
  const createPrivateConversation = async (otherUserId) => {
    if (!currentUserId) return;
    try {
      const res = await API.post(
        `/conversations/private?user1Id=${currentUserId}&user2Id=${otherUserId}`
      );
      fetchConversations();
      setSelectedConversation(res.data.data);
      fetchMessages(res.data.data.id);
    } catch (err) {
      console.error("Failed to create private conversation:", err);
    }
  };

  const createGroupConversation = async () => {
  if (!groupName || groupParticipants.length === 0 || !currentUserId) return;

  try {
    // Send groupName as query param and participantIds as body
    const res = await API.post(
      `/conversations/group?groupName=${encodeURIComponent(groupName)}`,
      groupParticipants
    );

    // Update conversation list and select new conversation
    fetchConversations();
    setSelectedConversation(res.data.data);
    fetchMessages(res.data.data.id);

    // Reset inputs
    setGroupName("");
    setGroupParticipants([]);
  } catch (err) {
    console.error("Failed to create group:", err);
  }
};



  /** Initial fetch of conversations */
  useEffect(() => {
    if (currentUserId) fetchConversations();
  }, [currentUserId]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 flex flex-col">
        {/* Top bar */}
        <div className="p-4 border-b flex items-center space-x-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {currentUser?.firstName?.[0] || "U"}
          </div>
          <div>
            <div className="font-bold text-lg">Bunna Chat</div>
            <div className="text-sm text-gray-500">
              {currentUser?.username || currentUser?.email || "You"}
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <h2 className="font-bold text-lg">Users</h2>
          <div className="flex flex-col space-y-2">
            {users
              .filter((u) => u.id !== currentUser?.id)
              .map((u) => (
                <button
                  key={u.id}
                  className="text-left p-2 bg-white rounded hover:bg-gray-200 flex items-center space-x-2"
                  onClick={() => createPrivateConversation(u.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                    {u.firstName?.[0] || "U"}
                  </div>
                  <div>{u.username || u.email || `User ${u.id}`}</div>
                </button>
              ))}
          </div>

          {/* Conversations */}
          <h2 className="font-bold text-lg mt-6">Conversations</h2>
          <div className="flex flex-col space-y-2">
            {conversations.map((c) => (
              <button
                key={c.id}
                className={`text-left p-2 rounded hover:bg-gray-200 flex flex-col ${
                  selectedConversation?.id === c.id ? "bg-gray-300" : "bg-white"
                }`}
                onClick={() => {
                  setSelectedConversation(c);
                  fetchMessages(c.id);
                }}
              >
                <div className="font-medium">
                  {c.group
                    ? c.name
                    : c.participants
                        ?.filter((p) => p.userId !== currentUserId)
                        .map((p) => p.username || p.email)
                        .join(", ")}
                </div>
                {c.lastMessage && (
                  <div className="text-sm text-gray-500 truncate">
                    {c.lastMessage.text || c.lastMessage.content}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Create Group */}
<div className="mt-6">
  <h2 className="font-bold text-lg">Create Group</h2>
  <input
    type="text"
    placeholder="Group Name"
    className="w-full p-2 border rounded mt-2"
    value={groupName}
    onChange={(e) => setGroupName(e.target.value)}
  />
  <select
    multiple
    className="w-full p-2 border rounded mt-2 h-24"
    value={groupParticipants}
    onChange={(e) => {
      // Convert selected options to numbers (user IDs)
      const selected = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
      setGroupParticipants(selected);
    }}
  >
    {users
      .filter((u) => u.id !== currentUserId)
      .map((u) => (
        <option key={u.id} value={u.id}>
          {u.username || u.email || `User ${u.id}`}
        </option>
      ))}
  </select>
  <button
    className="w-full mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
    onClick={createGroupConversation}
    disabled={!groupName || groupParticipants.length === 0}
  >
    Create Group
  </button>
</div>

        </div>
      </div>
      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b font-bold">
              {selectedConversation.group
                ? selectedConversation.name
                : selectedConversation.participants
                    ?.filter((p) => p.userId !== currentUserId)
                    .map((p) => p.username || p.email)
                    .join(", ")}
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-2">
              {sortedMessages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg max-w-[70%] ${
                    m.senderId === currentUserId
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 text-gray-800 self-start"
                  }`}
                >
                  <div className="mb-1">{m.text || m.content}</div>
                  <div className="text-xs opacity-75">
                    {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>

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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
