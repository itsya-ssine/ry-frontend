import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../../services/apiService.js';
import { LogOut, School, LogIn, Bell, X, Info, AlertCircle, CheckCircle, User as UserIcon } from 'lucide-react';

const Navbar = ({ onLoginClick, onProfileClick }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const data = await api.getNotifications(user.id);

      const names = {};
      for (const n of data) {
        if (!names[n.senderId]) {
          const res = await api.getSenderName(n.senderId);
          names[n.senderId] = res.name;
        }
      }

      setSenderNames(names);
      setNotifications(data);
    };

    loadNotifications();
  }, [user]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(user.id, id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatNotifDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoleBadge = () => {
    if (!user) return '';
    switch (user.role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'club_manager': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer">
            <School className="w-8 h-8 text-indigo-600" />
            <span className="font-bold text-xl text-gray-900">RY-SYS</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'student' && onProfileClick && (
                  <button
                    onClick={onProfileClick}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                    title="My Profile"
                  >
                    <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                )}

                <div className="relative" ref={dropdownRef}>
                  {user.role !== 'admin' &&
                    <button
                      onClick={() => setShowNotifs(!showNotifs)}
                      className="p-2.5 rounded-xl text-gray-500 hover:bg-slate-50 transition-all relative group"
                    >
                      <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      {notifications.length > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                      )}
                    </button>
                  }

                  {showNotifs && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                      <div className="p-4 border-b border-gray-50 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Notifications</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-[10px] font-black">{notifications.length}</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-400">All caught up!</p>
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-slate-50 transition-colors group relative">
                              <div className="flex gap-3">
                                <div className="mt-0.5 shrink-0">{getNotifIcon(n.type)}</div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{senderNames[n.senderId] || 'System'}</p>
                                  <p className="text-xs font-medium text-slate-800 leading-relaxed pr-6">{n.message}</p>
                                  <p className="text-[9px] text-slate-300 mt-1 font-bold">
                                    {formatNotifDate(n.date)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleClearNotif(n.id, e)}
                                className="absolute top-3 right-3 p-1 rounded-md text-slate-200 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadge()} capitalize`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
