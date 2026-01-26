  import React, { useEffect, useState } from "react";
  import API from "../utils/axiosInstance";
  import { useAuth } from "../context/AuthContext";
  import { useWebSocket } from "../context/WebSocketProvider";
  import { getAllUsers, getCurrentUser } from "../api/userApi";
  import ChatWindow from "../components/ChatWindow";
  import UserSearch from "../components/UserSearch";
  import {
  Search,
  MessageSquare,
  Users,
  UserPlus,
  Settings,
  LogOut,
  Lock,
  Mail,
  User,
  MoreVertical,
  Menu,
  ChevronRight,
  Hash,
  PlusCircle,
  Edit3,
  Shield
} from "lucide-react";


 

  export default function Dashboard() {
    const { user } = useAuth(); 
    const { stompClient, connected } = useWebSocket();

    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageReads, setMessageReads] = useState([]);

    const [messageInput, setMessageInput] = useState("");
    const [groupName, setGroupName] = useState("");
    
    
    const [selectedUserIds, setSelectedUserIds] = useState([]); 

    // UI State
  const [activeTab, setActiveTab] = useState("chats"); // 'chats', 'groups', 'contacts'
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);

   

    /** Fetch all users */
    const fetchUsers = async () => {
        try {
          const { data } = await getAllUsers();
          setUsers(data);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
    useEffect(() => {
      
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
  // for testing purpose 
    useEffect(() => {
    console.log("MESSAGES UPDATED:", messages);
  }, [messages]);


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
    console.log("Conversations:", conversations);

    /** Fetch messages */
  const fetchMessages = async (convId) => {
    try {
      const res = await API.get(`/messages/conversation/${convId}`);
      console.log("Fetch messages response:", res);
      
      const msgs = res.data.data?.content || [];
      setMessages(msgs);
      markMessagesAsRead(msgs);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

    console.log(
      "Messages received:",
      messages.map((m) => m.createdAt)
    );
    console.log(messages);
    // const sortedMessages = [...messages].sort(
    //   (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    // );
    /** Mark messages as read */
    const markMessagesAsRead = async (msgs) => {
    if (!currentUserId) return;
    

    for (const m of msgs) {
      if (
        m.senderId !== currentUserId &&
        !m.readBy?.includes(currentUserId)
      ) {
        try {
          await API.post(`/messages/${m.id}/read?userId=${currentUserId}`);
        } catch (err) {
          console.error("Failed to mark read", err);
        }
      }
    }
  };
  /** fetch message read   */

    const fetchReads = async (conversationId) => {
    try {
      const res = await API.get(
        `/messages/conversation/${conversationId}/reads`
      );
      console.log("Fetched Reads:", res.data);
      setMessageReads(res.data);
    } catch (err) {
      console.error("Failed to fetch reads", err);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchReads(selectedConversation.id);
    }
  }, [selectedConversation]);



    /** Send message */
    const sendMessage = () => {
      if (
        !messageInput.trim() ||
        !selectedConversation ||
        !stompClient?.connected
      )
        return;

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

    // Subscribe to WebSocket messages for real-time updates
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
              // update in real time for message read 
              if (message.senderId !== currentUserId) {
              API.post(`/messages/${message.id}/read?userId=${currentUserId}`);
            }
            }

            // Update lastMessage in conversation list
            // setConversations((prev) =>
            //   prev.map((c) =>
            //     c.id === message.conversationId
            //       ? { ...c, lastMessage: message }
            //       : c
            //   )
            // );
            setConversations((prev) => {
            // 1. Check if we already have this conversation in our sidebar
            const exists = prev.find((c) => c.id === message.conversationId);

            if (exists) {
              // 2. If it exists, just update the last message
              return prev.map((c) =>
                c.id === message.conversationId ? { ...c, lastMessage: message } : c
              );
            } else {
              // 3. IF IT IS NEW: We need the full conversation object.
              // Ideally, the backend should send the conversation object with the message,
              // or you can trigger a single one-time fetch here.
              fetchConversations();
              fetchUsers(); 
              return prev;
            }
          });
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        }
      );

      return () => subscription.unsubscribe();
    }, [stompClient, connected, currentUserId, selectedConversation]);

    // for message read updates
    useEffect(() => {
    if (!stompClient || !connected || !selectedConversation) return;

    const readSub = stompClient.subscribe(
      `/topic/conversations/${selectedConversation.id}/reads`,
      (msg) => {
        const readEvent = JSON.parse(msg.body);
        setMessageReads((prev) => [...prev, readEvent]);

        
      }
    );

    return () => readSub.unsubscribe();
  }, [stompClient, connected, selectedConversation]);


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
    if (!groupName || selectedUserIds.length === 0 || !currentUserId) return;

    try {
      // Always include the admin (current user) at first index
      const participantIds = [currentUserId, ...selectedUserIds];

      // Send request to backend
      const res = await API.post(
        `/conversations/group?groupName=${encodeURIComponent(groupName)}`,
        participantIds
      );

      // Update conversations list immediately
      setConversations((prev) => [res.data.data, ...prev]);

      // Set newly created group as selected
      setSelectedConversation(res.data.data);

      // Reset inputs
      setMessages([]);
      setGroupName("");
      setSelectedUserIds([]);
    } catch (err) {
      console.error("Failed to create group conversation:", err);
    }
  };

  // handle submit for user search
  const handleUserSelectFromSearch = async (selectedUser) => {
  if (!currentUserId) return;

  const existingConv = conversations.find(conv => {
    if (!conv.group) {
      return conv.participants.some(p => p.userId === selectedUser.id);
    }
    return false;
  });

  if (existingConv) {
    setSelectedConversation(existingConv);
    fetchMessages(existingConv.id);
    return;
  }

  
  await createPrivateConversation(selectedUser.id);
};


    


    /** Initial fetch of conversations */
    useEffect(() => {
      if (currentUserId) fetchConversations();
    }, [currentUserId]);
  //   useEffect(() => {
  //   if (!currentUserId) return;
    
  //   const interval = setInterval(() => {
  //     fetchConversations();
      
  //   }, 5000);
    
  //   return () => clearInterval(interval);
  // }, [currentUserId]);

    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-1/4 bg-gray-100 flex flex-col">
          {/* Top bar */}
          <div className="p-4 border-b flex items-center space-x-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {currentUser?.firstName?.[0]}
            </div>
            <div>
              <div className="font-bold text-lg">Bunna Chat</div>
              <div className="text-sm text-gray-500">
                {currentUser?.username || currentUser?.email || "You"}
              </div>
            </div>
          </div>
          {/** user search  */}
          <div className="p-4 border-b">
              <UserSearch 
                onUserSelect={(selectedUser) => { handleUserSelectFromSearch(selectedUser);
                }}
              />
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
                      {c.lastMessage.content}
                    </div>
                  )}
                </button>
              ))}
            </div> 

            {/* Create Group */}
            <div className="mt-6 p-4 border-t">
              <h2 className="font-bold text-lg">Create Group</h2>
              <input
                type="text"
                placeholder="Group Name"
                className="w-full p-2 border rounded mt-2"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />

              <div className="mt-2">
                <span className="font-semibold">Select Users:</span>
                <div className="flex flex-col max-h-48 overflow-y-auto mt-1 space-y-1">
                  {users
                    .filter((u) => u.id !== currentUserId) // Don't include admin
                    .map((u) => (
                      <label
                        key={u.id}
                        className="flex items-center space-x-2 p-1 border rounded hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          value={u.id}
                          checked={selectedUserIds.includes(u.id)}
                          onChange={(e) => {
                            const userId = Number(e.target.value);
                            if (e.target.checked) {
                              setSelectedUserIds((prev) => [...prev, userId]);
                            } else {
                              setSelectedUserIds((prev) =>
                                prev.filter((id) => id !== userId)
                              );
                            }
                          }}
                        />
                        <span>{u.username || u.email}</span>
                      </label>
                    ))}
                </div>
              </div>
          

              <button
                className="w-full mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                onClick={createGroupConversation}
                disabled={!groupName || selectedUserIds.length === 0}
              >
                Create Group
              </button>
            </div>
        </div>


        {/* Chat Window */}
        <ChatWindow
    selectedConversation={selectedConversation}
    onParticipantsAdded={setSelectedConversation}
    currentUserId={currentUserId}
    messages={messages}
    messageInput={messageInput}
    setMessageInput={setMessageInput}
    sendMessage={sendMessage}
    messageReads={messageReads}
    
  />

    </div>
      
    );
  } 
