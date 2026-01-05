import { useState } from 'react';
import { LogOut, Search, Users, MessageSquare, User, Settings, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-brown-900 text-white"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transform transition-transform duration-300 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-white border-r border-amber-200 shadow-xl`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-amber-200">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brown-700 to-brown-900 flex items-center justify-center text-white font-bold text-xl">
              {user?.firstName?.[0] || 'B'}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-brown-900">BUNNA TALK</h2>
              <p className="text-sm text-brown-600">@{user?.userName || 'user'}</p>
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
            { id: 'groups', icon: Users, label: 'Groups' },
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

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100vh-240px)]">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="p-4 border-b border-amber-100 hover:bg-amber-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                  U{i}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-brown-900">User {i}</h4>
                    <span className="text-xs text-brown-500">10:30 AM</span>
                  </div>
                  <p className="text-sm text-brown-600 truncate">Hello there! How are you doing?</p>
                </div>
                {i === 1 && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brown-700 to-brown-900 flex items-center justify-center text-white">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-brown-900">
                  {user?.firstName} {user?.lastName}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default Layout;