  import React, { useEffect, useState } from "react";
  import API from "../utils/axiosInstance";
  import { useAuth} from "../context/AuthContext";
  import { useWebSocket } from "../context/WebSocketProvider";
  import { getAllUsers, getCurrentUser } from "../api/userApi";
  import ChatWindow from "../components/ChatWindow";
  import UserSearch from "../components/UserSearch";
  import AvatarUploader from "../features/components/AvatarUploader";
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
import { useAvatarUpload } from "../features/hooks/useAvatarUpload";


 

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

    
  const [activeTab, setActiveTab] = useState("chats"); 
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

   

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
    

    const {previewUrl,avatarUrl}=useAvatarUpload(currentUserId);
    
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

    
    useEffect(() => {
      if (!stompClient || !connected || !currentUserId) return;

      const subscription = stompClient.subscribe(
        `/topic/users/${currentUserId}/conversations`, 
        (msg) => {
          try {
            const message = JSON.parse(msg.body);
            if (selectedConversation?.id === message.conversationId) {
              setMessages((prev) => [...prev, message]);
              if (message.senderId !== currentUserId) {
              API.post(`/messages/${message.id}/read?userId=${currentUserId}`);
            }
            }

            setConversations((prev) => {
            const exists = prev.find((c) => c.id === message.conversationId);

            if (exists) {
              return prev.map((c) =>
                c.id === message.conversationId ? { ...c, lastMessage: message } : c
              );
            } else {
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
      const participantIds = [currentUserId, ...selectedUserIds];
      const res = await API.post(
        `/conversations/group?groupName=${encodeURIComponent(groupName)}`,
        participantIds
      );
      setConversations((prev) => [res.data.data, ...prev]);
      setSelectedConversation(res.data.data);
      setMessages([]);
      setGroupName("");
      setSelectedUserIds([]);
    } catch (err) {
      console.error("Failed to create group conversation:", err);
    }
  };

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
  useEffect(() => {
      if (currentUserId) fetchConversations();
    }, [currentUserId]);
  
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">

              {/* Avatar Container */}
              <div className="relative w-12 h-12 rounded-full overflow-hidden 
                  ring-2 ring-amber-600 shadow-md 
                  hover:ring-amber-700 transition-all duration-200">

                {avatarUrl || previewUrl ? (
                  <img
                    src={avatarUrl || previewUrl}
                    alt="Profile avatar"
                    className="w-full h-full object-cover" />
                    ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 
                      flex items-center justify-center text-white font-bold text-sm">
                      {(currentUser?.firstName?.charAt(0)?.toUpperCase() || "B")}
                    </div>
                     )}

              </div>

              {/* Name Section */}
              <div className="flex flex-col">
                <div className="font-semibold text-amber-900 text-lg leading-none">
                  Bunna Chat
                </div>

                <span className="text-xs text-gray-500">
                  Online
                </span>
              </div>

          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowNewGroup(!showNewGroup)}
              className="p-2 hover:bg-amber-50 rounded-full text-amber-700 transition-colors"
              title="New Group"
            >
              <UserPlus size={20} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-amber-50 rounded-full text-amber-700 transition-colors"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-3">
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === "chats" 
                ? "text-amber-700 border-b-2 border-amber-600" 
                : "text-gray-500 hover:text-amber-600"
            }`}
            onClick={() => setActiveTab("chats")}
          >
            <MessageSquare size={18} />
            <span>Chats</span>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === "groups" 
                ? "text-amber-700 border-b-2 border-amber-600" 
                : "text-gray-500 hover:text-amber-600"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            <Users size={18} />
            <span>Groups</span>
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${
              activeTab === "contacts" 
                ? "text-amber-700 border-b-2 border-amber-600" 
                : "text-gray-500 hover:text-amber-600"
            }`}
            onClick={() => setActiveTab("contacts")}
          >
            <User size={18} />
            <span>Contacts</span>
          </button>
        </div>

        {/* Content Area based on Active Tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "chats" && (
            <div className="p-2">
              {/* User Search for New Chats */}
              <div className="mb-4">
                <UserSearch 
                  onUserSelect={(selectedUser) => handleUserSelectFromSearch(selectedUser)}
                />
              </div>

              {/* Conversations List */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recent Conversations
                </div>
                {conversations.filter(c => !c.group).map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                      selectedConversation?.id === c.id 
                        ? "bg-amber-50 border-l-4 border-amber-500" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedConversation(c);
                      fetchMessages(c.id);
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold mr-3 shadow">
                      {c.participants
                        ?.filter(p => p.userId !== currentUserId)
                        .map(p => p.firstName?.[0] || p.username?.[0] || "U")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {c.participants
                            ?.filter(p => p.userId !== currentUserId)
                            .map(p => p.username || p.email)
                            .join(", ")}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {c.lastMessage && new Date(c.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {c.lastMessage?.content || "Start a conversation..."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "groups" && (
            <div className="p-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Your Groups</h3>
                <button
                  onClick={() => setShowNewGroup(true)}
                  className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors flex items-center space-x-2"
                >
                  <PlusCircle size={16} />
                  <span>New Group</span>
                </button>
              </div>

              {/* Groups List */}
              <div className="space-y-2">
                {conversations.filter(c => c.group).map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      selectedConversation?.id === c.id 
                        ? "bg-amber-50 border-l-4 border-amber-500" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setSelectedConversation(c);
                      fetchMessages(c.id);
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold mr-3 shadow">
                      <Hash size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      <p className="text-sm text-gray-500">
                        {c.lastMessage?.content || `${c.participants?.length || 0} members`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                All Contacts
              </div>
              <div className="space-y-1">
                {users
                  .filter(u => u.id !== currentUser?.id)
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => createPrivateConversation(u.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold mr-3">
                        {u.firstName?.[0] || u.username?.[0] || "U"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {u.firstName} {u.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">@{u.username || "user"}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Footer */}
        <div 
          className="p-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
          onClick={() => setShowProfile(true)}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold mr-3">
              {currentUser?.firstName?.[0] || "U"}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {currentUser?.firstName} {currentUser?.lastName}
              </h3>
              <p className="text-sm text-gray-500">{currentUser?.email}</p>
            </div>
            <MoreVertical size={18} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
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

      {/* Settings Panel (Right Sidebar) */}
      {showSettings && (
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-amber-900">Settings</h2>
            <button 
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account</h3>
              <div className="space-y-3">
                <button 
                onClick={
                  () => setShowProfile(true)
                }
                className="w-full flex items-center p-3 rounded-lg hover:bg-amber-50 text-left">
                  <User size={18} className="text-amber-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Edit Profile</div>
                    <div className="text-sm text-gray-500">Update your personal information</div>
                  </div>
                </button>
                <button className="w-full flex items-center p-3 rounded-lg hover:bg-amber-50 text-left">
                  <Lock size={18} className="text-amber-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Change Password</div>
                    <div className="text-sm text-gray-500">Update your login password</div>
                  </div>
                </button>
                <button className="w-full flex items-center p-3 rounded-lg hover:bg-amber-50 text-left">
                  <Shield size={18} className="text-amber-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900">Privacy & Security</div>
                    <div className="text-sm text-gray-500">Manage your privacy settings</div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Appearance</h3>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="font-medium text-gray-900 mb-2">Theme</div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm">Light</button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">Dark</button>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">System</button>
                </div>
              </div>
            </div>

             
          </div>
        </div>
      )}

      {/* Profile Modal */}
        {showProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`flex items-start transition-all duration-300 ${
                showEditProfile ? "gap-20" : ""
              }`}
            >
              {/* Main Profile Card */}
              <div className="bg-white rounded-2xl w-96 max-w-full shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-amber-900">Your Profile</h2>
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        setShowEditProfile(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <div
                      className="relative w-20 h-20 rounded-full overflow-hidden 
                                ring-2 ring-amber-600 shadow-md 
                                hover:ring-amber-700 transition-all duration-200 mx-auto"
                    >
                      {avatarUrl || previewUrl ? (
                        <img
                          src={avatarUrl || previewUrl}
                          alt="Profile avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 
                                    flex items-center justify-center text-white font-bold text-xl"
                        >
                          {currentUser?.firstName?.charAt(0)?.toUpperCase() || "B"}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col mt-3">
                      <div className="font-semibold text-amber-900 text-lg leading-none">
                        Bunna Chat
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mt-4">
                      {currentUser?.firstName} {currentUser?.lastName}
                    </h3>
                    <p className="text-gray-500">{currentUser?.email}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <User size={16} className="text-amber-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Username</span>
                      </div>
                      <div className="font-medium">{currentUser?.userName || "Not set"}</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Mail size={16} className="text-amber-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Email</span>
                      </div>
                      <div className="font-medium">{currentUser?.email}</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => setShowEditProfile(true)}
                      className="w-full flex items-center justify-center p-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <Edit3 size={16} className="mr-2" />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowProfile(false);
                        setShowSettings(true);
                        setShowEditProfile(false);
                      }}
                      className="w-full flex items-center justify-center p-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <Settings size={16} className="mr-2" />
                      Account Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Separate Edit Profile Card */}
              {showEditProfile && (
                <div className="bg-white rounded-2xl w-96 max-w-full shadow-xl p-6">
                  <h3 className="text-lg font-bold text-amber-900 mb-4">Edit Profile</h3>

                  <AvatarUploader userId={currentUser?.id} />

                  <button
                    onClick={() => setShowEditProfile(false)}
                    className=" mt-4 w-full  p-3 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      { /* Edit Profile Section */}
        

      {/* New Group Modal */}
      {showNewGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-96 max-w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-amber-900 mb-6">Create New Group</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                  <input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {users
                      .filter((u) => u.id !== currentUserId)
                      .map((u) => (
                        <label
                          key={u.id}
                          className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
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
                            className="mr-3"
                          />
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold mr-3">
                            {u.firstName?.[0] || "U"}
                          </div>
                          <div>
                            <div className="font-medium">{u.firstName} {u.lastName}</div>
                            <div className="text-sm text-gray-500">@{u.username}</div>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowNewGroup(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      createGroupConversation();
                      setShowNewGroup(false);
                    }}
                    disabled={!groupName || selectedUserIds.length === 0}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:opacity-50"
                  >
                    Create Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}