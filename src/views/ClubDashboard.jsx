import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../../services/apiService.js';
import {
  Check, X, User as UserIcon, Clock, Camera, Settings,
  RefreshCw, Pencil, Send, SendHorizontal, Award, Trophy
} from 'lucide-react';

const BADGES = [
  { name: 'Most Active Member', icon: '🔥' },
  { name: 'Top Contributor', icon: '🌟' },
  { name: 'Rising Star', icon: '✨' },
  { name: 'Leadership Award', icon: '👑' },
  { name: 'Elite Member', icon: '💎' },
  { name: 'Event Pro', icon: '🎫' },
];

const ClubDashboard = () => {
  const { user, logout } = useAuth();
  const [club, setClub] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [newManagerId, setNewManagerId] = useState('');

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const [isAwardingBadge, setIsAwardingBadge] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(BADGES[0]);

  const [notifMessage, setNotifMessage] = useState('');
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    if (user) {
      const managedClubId = await api.getManagedClub(user.id);
      if (managedClubId.id) {
        const [clubData, usersData] = await Promise.all([
          api.getClubById(managedClubId.id),
          api.getUsers()
        ]);

        if (clubData) {
          setClub(clubData);
          setEditName(clubData.name);
          setEditDesc(clubData.description);
          const regs = await api.getClubRegistrations(clubData.id);
          setRegistrations(regs);
          setAllUsers(usersData.filter(u => u.id !== user.id && u.role !== 'admin'));
          if (usersData.length > 0) setNewManagerId(usersData[0].id);
        }
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    try {
      formData.append('description', editDesc);
      formData.append('name', editName);
      formData.append('category', editCategory || 'General');

      await api.updateClub(club.id, formData);

      fetchData();
      setIsEditingInfo(false);
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();

    if (!notifMessage.trim()) {
      alert("Please enter a message.");
      return;
    }

    setIsSendingNotif(true);

    try {
      let recipientList = [];

      recipientList = registrations
        .filter(r => r.status === 'accepted')
        .map(r => r.student.id);

      if (recipientList.length === 0) {
        alert("No recipients found for the selected category.");
        setIsSendingNotif(false);
        return;
      }

      await api.addNotifications(
        'info',
        user.id,
        recipientList,
        notifMessage
      );

      setNotifMessage('');
      alert(`Broadcast successful! Sent to ${recipientList.length} user(s).`);

    } catch (error) {
      console.error("Broadcast error:", error);
      alert("Failed to send broadcast. Please check your connection.");
    } finally {
      setIsSendingNotif(false);
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedStudentId || !club || !user) return;

    await api.awardBadge(selectedStudentId, {
      name: selectedBadge.name,
      icon: selectedBadge.icon,
      ClubId: club.id,
      ClubName: club.name
    });

    await api.addNotifications(
      'success',
      user.id,
      selectedStudentId,
      `Congratulations! You've been awarded the "${selectedBadge.name}" badge by ${club.name}.`
    );

    setIsAwardingBadge(false);
    setSelectedStudentId(null);
    alert(`Badge awarded !`);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (file && club) {
      try {
        const imageData = new FormData();
        imageData.append('file', file);
        imageData.append('upload_preset', "club_management");
        imageData.append('cloud_name', "dfnaghttm");

        const cloudRes = await fetch(import.meta.env.VITE_ASSETS_URL, {
          method: "POST",
          body: imageData
        });

        const cloudData = await cloudRes.json();

        if (!cloudRes.ok) throw new Error("Cloudinary upload failed");

        const imageUrl = cloudData.secure_url;

        const formData = new FormData();
        formData.append('description', club.description);
        formData.append('name', club.name);
        formData.append('category', club.category || 'General');
        formData.append('image', imageUrl);

        await api.updateClub(club.id, formData);

        fetchData();
        alert("Profile picture updated!");
      } catch (error) {
        console.error("Error updating image:", error);
        alert("Failed to update image.");
      }
    }
  };

  const handleStatusUpdate = async (regId, studentId, clubId, status) => {
    try {
      await api.updateRegistrationStatus(studentId, clubId, status);
      const msg = status === 'accepted'
        ? `Congratulations! You have been accepted into ${club.name}.`
        : `Your request to join ${club.name} was declined.`;

      await api.addNotifications(
        status === 'accepted' ? 'success' : 'info',
        club.id,
        studentId,
        msg
      );

      setRegistrations(regs => regs.map(r => r.id === regId ? { ...r, status } : r));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteMember = async (studentId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await api.deleteRegistration(studentId, club.id);

      setRegistrations(prev => prev.filter(reg => reg.student.id !== studentId));

      alert('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Error removing member. Please try again.');
    }
  };

  const handleTransferManagement = async () => {
    if (!club || !newManagerId) return;

    const targetUser = allUsers.find(u => u.id === newManagerId);
    if (!targetUser) {
      alert('Selected user not found.');
      return;
    }

    const confirmTransfer = confirm(
      `Are you sure you want to transfer management to ${targetUser.name}? You will lose access to this dashboard.`
    );
    if (!confirmTransfer) return;

    try {
      await api.transfereManager(club.id, newManagerId);
      alert('Management transferred successfully. You will now be signed out.');
      logout();
    } catch (error) {
      console.error('Failed to transfer management:', error);
      alert('Failed to transfer management. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading club details...</div>;
  if (!club) return <div className="p-8 text-center text-gray-500">You do not manage any club. Contact Admin.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <img src={club.image} alt={club.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg group-hover:brightness-75 transition-all" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white w-6 h-6" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div className="text-center md:text-left flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
              <p className="text-gray-500 mt-1">{club.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsEditingInfo(true)} className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all">
                <Pencil className="w-4 h-4" /> Edit Info
              </button>
              <button onClick={() => setIsTransferring(!isTransferring)} className="flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                <Settings className="w-4 h-4" /> Transfer
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
            <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
              {registrations.filter(r => r.status === 'accepted').length} Active Members
            </div>
            <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
              {registrations.filter(r => r.status === 'pending').length} Pending Requests
            </div>
          </div>
        </div>
      </div>

      {isAwardingBadge && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Badges</h2>
              <button onClick={() => setIsAwardingBadge(false)} className="p-2 bg-slate-50 rounded-2xl"><X className="w-8 h-8" /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Select Award Template</label>
                <div className="grid grid-cols-2 gap-3">
                  {BADGES.map(template => (
                    <button
                      key={template.name}
                      onClick={() => setSelectedBadge(template)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedBadge.name === template.name ? 'border-indigo-600 bg-indigo-50' : 'border-slate-50 bg-slate-50 hover:border-slate-200'
                        }`}
                    >
                      <span className="text-2xl">{template.icon}</span>
                      <span className="text-[10px] font-black text-slate-700 uppercase">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAwardBadge}
                className="w-full py-4 bg-indigo-600 text-white font-black uppercase text-xs rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
              >
                Confirm Award <Trophy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditingInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Update Club</h2>
              <button onClick={() => { setIsEditingInfo(false); }} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateInfo} className="space-y-6">
              <div className="flex-1 flex-col w-full gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Name / Title</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder='Club name'
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => { setIsEditingInfo(false); }}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isTransferring && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 animate-in slide-in-from-top-4">
          <div className="flex items-start gap-4">
            <RefreshCw className="w-6 h-6 text-amber-600" />
            <div className="flex-grow">
              <h2 className="text-lg font-bold text-amber-900">Transfer Management</h2>
              <div className="flex flex-col md:flex-row items-end gap-4 mt-4">
                <select
                  value={newManagerId}
                  onChange={(e) => setNewManagerId(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none"
                >
                  {allUsers.filter(u => u.role === 'student').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <button onClick={handleTransferManagement} className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700">Confirm</button>
                <button onClick={() => setIsTransferring(false)} className="px-6 py-2 text-amber-700">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
              <Send className="w-5 h-5 text-indigo-600" /> Announcement
            </h2>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="relative">
                <textarea required value={notifMessage} onChange={(e) => setNotifMessage(e.target.value)} placeholder="Message your members..." className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none text-sm h-32 resize-none" />
                <button disabled={isSendingNotif || !notifMessage} className="absolute bottom-4 right-4 bg-indigo-600 text-white p-2.5 rounded-xl transition-all disabled:opacity-20"><SendHorizontal className="w-5 h-5" /></button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> Admissions</h2>
            <div className="space-y-4">
              {registrations.filter(r => r.status === 'pending').length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No pending requests</div>
              ) : (
                registrations.filter(r => r.status === 'pending').map(reg => (
                  <div key={reg.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                        <UserIcon color="#ff7d37ff" className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reg.student?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{reg.joinedAt}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusUpdate(reg.id, reg.student.id, reg.clubId, 'accepted')}
                        className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(reg.id, reg.student.id, reg.clubId, 'rejected')}
                        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50"><h2 className="text-xl font-black text-slate-900">Active Membership</h2></div>
            <div className="bg-white rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm text-gray-500">
                <thead className="text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Joined Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrations.filter(r => r.status === 'accepted').map(reg => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center gap-3 text-gray-900 font-medium">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                          <UserIcon color="#00ba19ff" className="w-5 h-5" />
                        </div>
                        {reg.student?.name}
                      </td>
                      <td className="px-6 py-4">{reg.student?.email}</td>
                      <td className="px-6 py-4">{reg.joinedAt}</td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button
                          onClick={() => { setSelectedStudentId(reg.student.id); setIsAwardingBadge(true); }}
                          className="px-3 py-1.5 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase rounded-lg hover:bg-yellow-600 hover:text-white transition-all inline-flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />Badge
                        </button>
                        <button
                          onClick={() => handleDeleteMember(reg.student.id)}
                          className="text-red-600 hover:text-red-900 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;
