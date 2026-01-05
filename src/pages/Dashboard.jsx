import { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, Smile, Phone, Video, MoreVertical, 
  Image as ImageIcon, Mic, Search, Users, MessageSquare, 
  Settings, Menu, X, LogOut, Coffee, User 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../api/userApi';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Current user (from auth context or local storage)
  const currentUser = authUser || {
    id: 'current-user',
    firstName: 'User',
    lastName: '',
    userName: 'user',
    email: localStorage.getItem('userEmail') || 'user@example.com'
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllUsers();
        
        if (response.data && Array.isArray(response.data)) {
          // Filter out password field for security and filter out current user
          const filteredUsers = response.data
            .filter(user => {
              // Skip current user
              const isCurrentUser = user.email === currentUser.email || 
                                   user.userName === currentUser.userName;
              return !isCurrentUser;
            })
            .map(user => {
              // Remove password and other sensitive fields
              const { password, verificationCode, verificationCodeExpiresAt, ...safeUser } = user;
              return safeUser;
            });
          
          setUsers(filteredUsers);
          
          // Set first user as current chat if available
          if (filteredUsers.length > 0) {
            handleSelectChat(filteredUsers[0]);
          }
        }
      } catch (error) {
        console.error('Failed to load users:', error);
        toast.error('Failed to load users');
        
        // Use mock users if API fails
        const mockUsers = [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            userName: 'johndoe',
            email: 'john@example.com',
            dateOfBirth: '1990-01-01',
            isVerified: true
          },
          {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            userName: 'janesmith',
            email: 'jane@example.com',
            dateOfBirth: '1992-05-15',
            isVerified: true
          },
          {
            id: 3,
            firstName: 'Bob',
            lastName: 'Johnson',
            userName: 'bobj',
            email: 'bob@example.com',
            dateOfBirth: '1988-11-30',
            isVerified: true
          }
        ];
        setUsers(mockUsers);
        if (mockUsers.length > 0) {
          handleSelectChat(mockUsers[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser.email, currentUser.userName]);

  // Mock chat history function
  const fetchChatHistory = (userId) => {
    // Mock chat history
    const mockMessages = [
      { 
        id: 1, 
        senderId: userId, 
        text: 'Hello! How are you?', 
        timestamp: '10:00 AM',
        read: true
      },
      { 
        id: 2, 
        senderId: currentUser.id, 
        text: 'I\'m good! Just enjoying some coffee ☕', 
        timestamp: '10:05 AM',
        read: true
      },
      { 
        id: 3, 
        senderId: userId, 
        text: 'That sounds perfect! Want to grab a virtual coffee?', 
        timestamp: '10:10 AM',
        read: true
      },
      { 
        id: 4, 
        senderId: currentUser.id, 
        text: 'Absolutely! Let\'s chat over Bunna Talk ☕', 
        timestamp: '10:15 AM',
        read: false
      },
    ];
    setMessages(mockMessages);
  };

  const handleSelectChat = (selectedUser) => {
    setCurrentChat(selectedUser);
    fetchChatHistory(selectedUser.id);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      senderId: currentUser.id,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Avatar color based on user ID or name
  const getAvatarColor = (userId) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-orange-400 to-orange-600',
      'from-teal-400 to-teal-600',
    ];
    
    // Generate a consistent index from the userId
    let index = 0;
    if (typeof userId === 'string') {
      for (let i = 0; i < userId.length; i++) {
        index += userId.charCodeAt(i);
      }
    } else if (typeof userId === 'number') {
      index = userId;
    }
    
    return colors[index % colors.length];
  };

  // Get user initials
  const getUserInitials = (user) => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 
           user.userName?.[0]?.toUpperCase() || 
           'U';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format date of birth for display
  const formatDateOfBirth = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brown-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-brown-900 font-semibold">Brewing your chat experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-brown-900 text-white shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transform transition-transform duration-300 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-amber-200 shadow-xl`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-amber-200">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAvatarColor(currentUser.id)} flex items-center justify-center text-white font-bold text-xl`}>
              {getUserInitials(currentUser)}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-brown-900">BUNNA TALK</h2>
              <p className="text-sm text-brown-600">@{currentUser.userName}</p>
              <p className="text-xs text-brown-500">{currentUser.email}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-amber-200 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-brown-500 text-brown-900"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-200">
          {[
            { id: 'chats', icon: MessageSquare, label: 'Chats' },
            { id: 'contacts', icon: Users, label: 'Contacts' },
            { id: 'profile', icon: User, label: 'Profile' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 ${activeTab === tab.id ? 'text-brown-900 border-b-2 border-brown-900' : 'text-brown-500'}`}
            >
              <tab.icon size={20} />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        <div className="overflow-y-auto h-[calc(100vh-240px)]">
          {activeTab === 'chats' ? (
            // Chat List
            users.length > 0 ? (
              users.map((chatUser) => (
                <div
                  key={chatUser.id}
                  onClick={() => handleSelectChat(chatUser)}
                  className={`p-4 border-b border-amber-100 hover:bg-amber-50 cursor-pointer transition-colors ${currentChat?.id === chatUser.id ? 'bg-amber-50' : ''}`}
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAvatarColor(chatUser.id)} flex items-center justify-center text-white font-bold`}>
                      {getUserInitials(chatUser)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-brown-900">
                          {chatUser.firstName} {chatUser.lastName}
                        </h4>
                        <span className="text-xs text-brown-500">10:30 AM</span>
                      </div>
                      <p className="text-sm text-brown-600 truncate">
                        @{chatUser.userName}
                      </p>
                    </div>
                    <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-brown-300 mx-auto mb-4" />
                <p className="text-brown-500 mb-2">No users found</p>
                <p className="text-brown-400 text-sm">Other users will appear here once they join</p>
              </div>
            )
          ) : activeTab === 'contacts' ? (
            // Contacts List
            users.length > 0 ? (
              users.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 border-b border-amber-100 hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAvatarColor(contact.id)} flex items-center justify-center text-white font-bold`}>
                      {getUserInitials(contact)}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="font-semibold text-brown-900">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-sm text-brown-600">@{contact.userName}</p>
                      <p className="text-xs text-brown-500">{contact.email}</p>
                      {contact.dateOfBirth && (
                        <p className="text-xs text-brown-400 mt-1">
                          🎂 {formatDateOfBirth(contact.dateOfBirth)}
                        </p>
                      )}
                    </div>
                    <div className="ml-auto">
                      <span className={`text-xs px-2 py-1 rounded-full ${contact.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {contact.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <User className="w-12 h-12 text-brown-300 mx-auto mb-4" />
                <p className="text-brown-500 mb-2">No contacts available</p>
                <p className="text-brown-400 text-sm">Other users will appear here once they register</p>
              </div>
            )
          ) : (
            // Profile Tab - Show current user info
            <div className="p-6">
              <div className="text-center mb-6">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${getAvatarColor(currentUser.id)} flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4`}>
                  {getUserInitials(currentUser)}
                </div>
                <h3 className="text-xl font-bold text-brown-900">
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <p className="text-brown-600">@{currentUser.userName}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-brown-800 mb-2">Account Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-brown-600">Email</p>
                      <p className="text-brown-900">{currentUser.email}</p>
                    </div>
                    {currentUser.dateOfBirth && (
                      <div>
                        <p className="text-sm text-brown-600">Date of Birth</p>
                        <p className="text-brown-900">{formatDateOfBirth(currentUser.dateOfBirth)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-brown-800 mb-2">Account Status</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-brown-700">Verification Status</span>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      Verified
                    </span>
                  </div>
                </div>
                
                <button className="w-full py-3 rounded-lg border-2 border-brown-900 text-brown-900 font-semibold hover:bg-brown-50 transition-colors">
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAvatarColor(currentUser.id)} flex items-center justify-center text-white`}>
                {getUserInitials(currentUser)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-brown-900">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-xs text-brown-500">Online</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full hover:bg-amber-100">
                <Settings size={18} className="text-brown-600" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-amber-100"
              >
                <LogOut size={18} className="text-brown-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-amber-200 bg-white/80 backdrop-blur-sm">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAvatarColor(currentChat.id)} flex items-center justify-center text-white font-bold text-xl`}>
                    {getUserInitials(currentChat)}
                  </div>
                  <div className="ml-4">
                    <h2 className="text-lg font-bold text-brown-900">
                      {currentChat.firstName} {currentChat.lastName}
                    </h2>
                    <p className="text-sm text-brown-600">@{currentChat.userName}</p>
                  </div>
                  <div className="ml-2 w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 rounded-full hover:bg-amber-100">
                    <Phone size={20} className="text-brown-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-amber-100">
                    <Video size={20} className="text-brown-600" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-amber-100">
                    <MoreVertical size={20} className="text-brown-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-amber-50">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="text-center my-6">
                  <div className="inline-block px-4 py-2 rounded-full bg-amber-100">
                    <p className="text-sm text-brown-600">
                      Start of conversation with {currentChat.firstName}
                    </p>
                  </div>
                </div>
                
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === currentUser.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getAvatarColor(message.senderId)} flex items-center justify-center text-white font-bold text-sm mr-2`}>
                            {getUserInitials(currentChat)}
                          </div>
                        )}
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-2 ${isOwnMessage
                                ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white rounded-tr-none'
                                : 'bg-white text-brown-900 border border-amber-200 rounded-tl-none'
                              }`}
                          >
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <span className={`text-xs mt-1 block ${isOwnMessage ? 'text-right' : 'text-left'} text-brown-500`}>
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-amber-200 bg-white/90 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center space-x-2">
                  <button className="p-3 rounded-full hover:bg-amber-100">
                    <Paperclip size={20} className="text-brown-600" />
                  </button>
                  <button className="p-3 rounded-full hover:bg-amber-100">
                    <ImageIcon size={20} className="text-brown-600" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 pr-24 rounded-3xl border border-amber-200 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-brown-500 text-brown-900 resize-none"
                      rows="1"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <button className="p-2 rounded-full hover:bg-amber-200">
                        <Smile size={20} className="text-brown-600" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-amber-200">
                        <Mic size={20} className="text-brown-600" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`p-3 rounded-full ${newMessage.trim()
                        ? 'bg-gradient-to-r from-brown-900 to-brown-800 text-white hover:from-brown-800 hover:to-brown-700'
                        : 'bg-amber-200 text-brown-400 cursor-not-allowed'
                      } transition-all duration-300`}
                  >
                    <Send size={20} />
                  </button>
                </div>
                <p className="text-xs text-brown-400 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-200 to-amber-400 flex items-center justify-center mx-auto mb-6">
                <Coffee size={64} className="text-brown-900" />
              </div>
              <h3 className="text-3xl font-bold text-brown-900 mb-3">Welcome to BUNNA TALK</h3>
              <p className="text-brown-600 mb-6 text-lg">
                {users.length > 0 
                  ? "Select a contact to start your coffee chat ☕" 
                  : "You're the first one here! Invite friends to start chatting."}
              </p>
              
              {users.length === 0 ? (
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full py-3 bg-gradient-to-r from-brown-900 to-brown-800 text-white rounded-lg hover:from-brown-800 hover:to-brown-700 font-semibold"
                  >
                    Invite Friends to Join
                  </button>
                  <p className="text-sm text-brown-500">
                    Share BUNNA TALK with friends and start brewing conversations!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {users.slice(0, 4).map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleSelectChat(user)}
                      className="p-4 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getAvatarColor(user.id)} flex items-center justify-center text-white font-bold mr-3`}>
                          {getUserInitials(user)}
                        </div>
                        <div>
                          <p className="font-medium text-brown-900">{user.firstName}</p>
                          <p className="text-sm text-brown-600">@{user.userName}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="mt-8 pt-6 border-t border-amber-200">
                <p className="text-sm text-brown-500">
                  ☕ Where conversations brew naturally, like a perfect cup of coffee ☕
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;