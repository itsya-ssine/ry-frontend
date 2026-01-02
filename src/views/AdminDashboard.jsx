import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../../services/apiService.js';
import {
  Plus, Trash2, Calendar, Users, Image as ImageIcon, X, MapPin,
  UserCheck, LayoutDashboard, TrendingUp, GraduationCap, FileText,
  CheckCircle2, Clock, XCircle, Trophy, Zap, BarChart3, ChevronRight,
  Send, SendHorizontal, Pencil, Archive
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [reActivities, setReActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [archivedActivities, setArchivedActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [newItemDate, setNewItemDate] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemManagerId, setNewItemManagerId] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const [notifRecipient, setNotifRecipient] = useState('everyone');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const [rawFile, setRawFile] = useState(null);
  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      const [c, a, u, r, ra, ar] = await Promise.all([
        api.getClubs(),
        api.getActivities(),
        api.getUsers(),
        api.getClubsRegistrations(),
        api.getRecentActivities(),
        api.getArchivedActivities(),
      ]);
      
      setClubs(c || []);
      setActivities(a || []);
      setUsers(u || []);
      setRegistrations(r || []);
      setReActivities(ra || []);
      setArchivedActivities(ar || []);
      if (u?.length > 0) setNewItemManagerId(u[0].id);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();

    if (!currentUser || !notifMessage.trim()) {
      alert("Please enter a message.");
      return;
    }

    setIsSendingNotif(true);

    try {
      let recipientList = [];

      if (notifRecipient === 'everyone') {
        recipientList = users
          .filter(u => u.role !== 'admin')
          .map(u => u.id);
      } else {
        recipientList = [notifRecipient];
      }

      if (recipientList.length === 0) {
        alert("No recipients found for the selected category.");
        setIsSendingNotif(false);
        return;
      }

      await api.addNotifications(
        notifType,
        currentUser.id,
        recipientList,
        notifMessage
      );

      setNotifMessage('');
      alert(`Broadcast successful! Sent to ${recipientList.length} users.`);

    } catch (error) {
      console.error("Broadcast error:", error);
      alert("Failed to send broadcast. Please check your connection.");
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (rawFile) {
      const imageData = new FormData();
      imageData.append('file', rawFile);
      imageData.append('upload_preset', "club_management");
      imageData.append('cloud_name', "dfnaghttm");

      const res = await fetch(import.meta.env.VITE_ASSETS_URL, {
        method: "POST",
        body: imageData
      });

      const uploadedImageData = await res.json();
      formData.append('image', uploadedImageData.secure_url);
    }

    formData.append('description', newItemDesc);

    try {
      if (activeTab === 'clubs') {
        formData.append('name', newItemName);
        formData.append('category', newCategory || 'General');
        if (!editingItemId) formData.append('managerId', newItemManagerId);

        if (editingItemId) {
          await api.updateClub(editingItemId, formData);
        } else {
          await api.createClub(formData);
        }
      } else {
        formData.append('title', newItemName);
        formData.append('date', newItemDate || new Date().toISOString().split('T')[0]);
        formData.append('location', newItemLocation || 'ENSA KHOURIBGA');

        if (editingItemId) {
          await api.updateActivity(editingItemId, formData);
        } else {
          await api.createActivity(formData);
        }
      }

      resetForm();
      setRawFile(null);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemDesc('');
    setNewItemImage('');
    setNewItemDate('');
    setNewItemLocation('');
    setEditingItemId(null);
    if (users.length > 0) setNewItemManagerId(users[0].id);
  };

  const handleEditClub = (club) => {
    setEditingItemId(club.id);
    setNewItemName(club.name);
    setNewItemDesc(club.description);
    setNewItemImage(club.image);
    setNewItemManagerId(club.managerId);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity) => {
    setEditingItemId(activity.id);
    setNewItemName(activity.title);
    setNewItemDesc(activity.description);
    setNewItemImage(activity.image || '');
    setNewItemDate(activity.date);
    setNewItemLocation(activity.location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    if (type === 'club') await api.deleteClub(id);
    else await api.deleteActivity(id);
    loadData();
  };

  const stats = useMemo(() => {
    const safeUsers = users || [];
    const safeRegs = registrations || [];
    const safeClubs = clubs || [];
    const recentEvents = reActivities || [];

    const students = safeUsers.filter(u => u.role === 'student');
    const pending = safeRegs.filter(r => r.status === 'pending').length;
    const accepted = safeRegs.filter(r => r.status === 'accepted').length;
    const rejected = safeRegs.filter(r => r.status === 'rejected').length;

    const clubMemberCounts = safeClubs.map(club => ({
      ...club,
      memberCount: safeRegs.filter(r => r.clubId === club.id && r.status === 'accepted').length
    })).sort((a, b) => b.memberCount - a.memberCount);

    const clubCategories = safeClubs.reduce((acc, club) => {
      acc[club.category] = (acc[club.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalStudents: students.length,
      totalClubs: safeClubs.length,
      totalActivities: activities.length,
      totalRegistrations: safeRegs.length,
      pending,
      accepted,
      rejected,
      clubCategories,
      topClubs: clubMemberCounts.slice(0, 3),
      recentEvents
    };
  }, [users, clubs, activities, registrations, reActivities]);

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Students', value: stats.totalStudents, icon: GraduationCap, color: 'blue' },
          { label: 'Clubs', value: stats.totalClubs, icon: Users, color: 'purple' },
          { label: 'Events', value: stats.totalActivities, icon: Calendar, color: 'orange' },
          { label: 'Invitations', value: stats.totalRegistrations, icon: TrendingUp, color: '#13a300ff' },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${stat.color}-50/50 rounded-full blur-3xl group-hover:bg-${stat.color}-100/50 transition-colors`} />
            <div className="flex items-center gap-6 relative z-10">
              <div className={`
                w-16 h-16 
                bg-${stat.color}-50 
                text-${stat.color}-600 
                rounded-[1.5rem] 
                flex items-center justify-center 
                shadow-inner 
                group-hover:scale-110 
                group-hover:rotate-3 
                transition-transform 
                duration-500
              `}>
                <stat.icon className="w-8 h-8" strokeWidth={2.5} color={stat.color} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-1">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-none">
                    {stat.value}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-indigo-600" />
                  Campus Broadcast
                </h2>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Send notifications to students</p>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Audience</label>
                  <select
                    value={notifRecipient}
                    onChange={(e) => setNotifRecipient(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold text-slate-700 text-sm"
                  >
                    <option value="everyone">Campus Wide (Everyone)</option>
                    <optgroup label="Managers">
                      {users.filter(u => u.role === 'club_manager').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Students">
                      {users.filter(u => u.role === 'student').map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Priority Level</label>
                  <div className="flex gap-2">
                    {(['info', 'alert', 'success']).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNotifType(type)}
                        className={`flex-1 py-3 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${notifType === type
                          ? type === 'info' ? 'bg-blue-600 text-white border-blue-600' : type === 'alert' ? 'bg-red-600 text-white border-red-600' : 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea
                  required
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="Type your campus update here..."
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-[1.5rem] outline-none font-medium text-slate-700 text-sm h-28 resize-none"
                />
                <button
                  disabled={isSendingNotif || !notifMessage}
                  className="absolute bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-30 shadow-lg shadow-indigo-100 group"
                >
                  <SendHorizontal className={`w-5 h-5 ${isSendingNotif ? 'animate-pulse' : 'group-hover:translate-x-1 transition-transform'}`} />
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Organization Leaderboard
                </h2>
                <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">Ranked by active members</p>
              </div>
            </div>

            <div className="space-y-4">
              {stats.topClubs.map((club, index) => (
                <div key={club.id} className="group flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all cursor-default">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-slate-200 text-slate-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-white text-slate-400'
                    }`}>
                    {index + 1}
                  </div>
                  <img src={club.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt="" />
                  <div className="flex-grow">
                    <h4 className="font-black text-slate-900 tracking-tight">{club.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{club.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">{club.memberCount}</div>
                    <div className="text-[9px] font-black text-emerald-500 uppercase">Members</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
              {stats.topClubs.length === 0 && (
                <div className="py-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">No data available</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Recent Events
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Latest Activities</p>
            </div>
          </div>

          <div className="space-y-8 relative">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100 rounded-full" />

            {stats.recentEvents.map((event) => {
              const theme = {
                orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
                blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' }
              }[event.displayColor || 'orange'];

              return (
                <div key={event.id} className="relative flex items-start gap-4">
                  <div className={`relative z-10 w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl border ${theme.bg} ${theme.border} ${theme.text}`}>
                    <Calendar className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">
                        {event.title || 'walo'}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase ml-2">
                        {event.date || 'Upcoming'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-500 line-clamp-1 mb-2">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {stats.recentEvents.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm font-bold text-slate-300 italic">No events scheduled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <BarChart3 className="w-40 h-40" />
        </div>

        <div className="max-w-3xl">
          <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-6 h-6 text-indigo-600" />
            Admissions Engagement
          </h2>
          <p className="text-slate-500 font-medium mb-12">
            Tracking the lifecycle of student applications across the entire campus
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                label: 'Accepted',
                count: stats.accepted,
                icon: CheckCircle2,
                styles: {
                  bgLight: 'bg-green-50',
                  text: 'text-green-500',
                  textDark: 'text-green-600',
                  bar: 'bg-green-500'
                }
              },
              {
                label: 'Pending',
                count: stats.pending,
                icon: Clock,
                styles: {
                  bgLight: 'bg-orange-50',
                  text: 'text-orange-500',
                  textDark: 'text-orange-600',
                  bar: 'bg-orange-500'
                }
              },
              {
                label: 'Rejected',
                count: stats.rejected,
                icon: XCircle,
                styles: {
                  bgLight: 'bg-red-50',
                  text: 'text-red-500',
                  textDark: 'text-red-600',
                  bar: 'bg-red-500'
                }
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className={`w-8 h-8 ${item.styles.bgLight} ${item.styles.text} rounded-xl flex items-center justify-center mb-3`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-wider">{item.label}</span>
                  </div>
                  <span className={`text-2xl font-black ${item.styles.textDark}`}>
                    {Math.round((item.count / (stats.totalRegistrations || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.styles.bar} rounded-full transition-all duration-1000`}
                    style={{ width: `${(item.count / (stats.totalRegistrations || 1)) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{item.count} Total Records</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage university activities</p>
        </div>
        {activeTab != 'dashboard' && activeTab != 'archive' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'clubs' ? 'Club' : 'Activity'}
          </button>
        )}
      </div>

      <div className="flex gap-2 bg-gray-100/80 p-1.5 rounded-[1.25rem] w-fit mb-10 border border-gray-200/50">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-2.5 flex items-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('clubs')}
          className={`px-6 py-2.5 flex items-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'clubs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Users className="w-4 h-4" />
          Clubs
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-6 py-2.5 flex items-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'activities' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Calendar className="w-4 h-4" />
          Activities
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-6 py-2.5 flex items-center gap-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'archive' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
          <Archive className="w-4 h-4" />
          Archive
        </button>
      </div>

      <div>
        {activeTab === 'dashboard' ? (
          renderDashboard()
        ) : (
          <div className={`grid animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab === 'archive' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'}`}>
            {activeTab === 'clubs' && (
              clubs.map(club => {
                const manager = users.find(u => u.id === club.managerId);
                return (
                  <div key={club.id} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        src={club.image}
                        alt={club.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => handleEditClub(club)}
                          className="bg-white/95 p-2 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg transition-all">
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(club.id, 'club')}
                          className="bg-white/95 p-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white shadow-lg transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-xl text-gray-900 tracking-tight">{club.name}</h3>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {club.category}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2 font-medium">{club.description}</p>

                      <div className="mt-6 flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manager</span>
                          <span className="text-sm font-bold text-slate-700">{manager?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {activeTab === 'activities' && (
              activities.map(activity => (
                <div key={activity.id} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-44 bg-gray-100 relative">
                    <img src={activity.image} alt={activity.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleEditActivity(activity)}
                        className="bg-white/95 p-2 rounded-xl text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-lg transition-all">
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id, 'activity')}
                        className="bg-white/95 p-2 rounded-xl text-red-500 hover:bg-red-500 hover:text-white shadow-lg transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-xl text-gray-900 tracking-tight">{activity.title}</h3>
                    <p className="text-gray-500 text-sm mt-2 mb-6 line-clamp-2 font-medium">{activity.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <Calendar className="w-4 h-4 text-indigo-500" />
                        <span className="text-[11px] font-black text-slate-700 tracking-tight">{activity.date}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="text-[11px] font-black text-slate-700 tracking-tight line-clamp-1">{activity.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {activeTab === 'archive' && (
              <div className="w-full bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left table-fixed md:table-auto">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="w-[60%] px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity</th>
                        <th className="w-[40%] px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Location & Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {archivedActivities.map(activity => (
                        <tr key={activity.id} className="group hover:bg-slate-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <img src={activity.image} className="w-12 h-12 rounded-xl object-cover shadow-sm transition-all" alt="" />
                              <div className="flex-1">
                                <p className="text-sm font-black text-slate-900">{activity.title}</p>
                                <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-full">
                                  {activity.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">{activity.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold">{activity.location}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {archivedActivities.length === 0 && (
                  <div className="py-20 text-center w-full">
                    <Archive className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records in vault</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{editingItemId ? `Update ${activeTab === 'clubs' ? 'Club' : 'Event'}` : `Create ${activeTab === 'clubs' ? 'Club' : 'Event'}`}</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-6">
              <div className="flex-1 flex-col w-full gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name / Title</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder={activeTab === 'clubs' ? 'Club name' : 'Activity name'}
                    />
                  </div>

                  {activeTab === 'activities' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={newItemDate}
                          onChange={(e) => setNewItemDate(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={newItemLocation}
                          onChange={(e) => setNewItemLocation(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="ENSA KHOURIBGA"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'clubs' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      {!editingItemId &&
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Manager</label>
                          <select
                            value={newItemManagerId}
                            onChange={(e) => setNewItemManagerId(e.target.value)}
                            className="..."
                          >
                            <optgroup label="Individuals">
                              {users.filter(u => u.role === 'student').map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      }
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all"
                    />
                  </div>
                </div>

                {!editingItemId &&
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">Cover Image</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="relative border-2 border-dashed border-gray-300 rounded-2xl min-h-[10px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden"
                    >
                      {newItemImage ? (
                        <img src={newItemImage} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="text-center p-6">
                          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <span className="text-xs font-medium text-gray-500">Click to upload banner</span>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                }
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  {editingItemId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
