
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../../services/apiService';
import {
  Trophy, Mail, Calendar, User as UserIcon, Edit2,
  Check, X, Shield, Star, Award, Users, Camera, ArrowLeft
} from 'lucide-react';

const Profile = ({ onBack }) => {
  const { user } = useAuth();
  const [myClubs, setMyClubs] = useState([]);
  const [badges, setBadges] = useState([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef(null);

  const ASSETS_URL = "https://ry-backend.vercel.app/api/";

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      const [allClubs, registrations, bdgs] = await Promise.all([
        api.getClubs(),
        api.getStudentRegistrations(user.id),
        api.getBadges(user.id),
      ]);

      const joinedClubs = registrations
        .filter(r => r.status === 'accepted')
        .map(r => ({
          reg: r,
          club: allClubs.find(c => c.id === r.clubId),
        }))
        .filter(item => item.club);

      setMyClubs(joinedClubs);
      setBadges(bdgs);
      setIsLoading(false);
    };
    loadProfileData();
  }, [user]);

  const handleUpdateBio = async () => {
    if (!user) return;
    await api.updateBio(user.id, { bio: newBio });
    setIsEditingBio(false);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', user.id);

    try {
      await api.updateUserPfp(formData);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  if (isLoading) return <div className="p-10 text-center text-slate-400 font-bold">Loading Identity...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-500">
      {onBack && (
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="px-10 pb-10 -mt-16 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={`${ASSETS_URL}${user.avatar}`}
              className="w-40 h-40 rounded-[2.5rem] border-[6px] border-white shadow-xl object-cover group-hover:brightness-90 transition-all"
              alt={user?.name}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem] border-[6px] border-transparent">
              <Camera className="w-8 h-8 text-white drop-shadow-md" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex-grow pb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <Mail className="w-4 h-4" /> {user?.email}
              </div>
              <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                <Shield className="w-3 h-3" /> {user?.role.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        <div className="px-10 pb-10 pt-4 border-t border-slate-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">About Me</h3>
            {!isEditingBio && (
              <button onClick={() => setIsEditingBio(true)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {isEditingBio ? (
            <div className="space-y-4">
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl outline-none font-medium text-slate-700 resize-none h-32 border-2 border-transparent focus:border-indigo-600 transition-all"
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setIsEditingBio(false)} className="px-4 py-2 text-xs font-black uppercase text-slate-400 hover:text-slate-600">Cancel</button>
                <button onClick={handleUpdateBio} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-600 leading-relaxed font-medium">
              {user?.bio || "No bio added yet!"}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Achievements
            </h2>
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">
              {badges?.length || 0}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {badges && badges.length > 0 ? (
              badges.map(badge => (
                <div key={badge.id} className="group relative bg-slate-50 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</div>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-tight">{badge.name}</h4>
                  <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{badge.clubName}</p>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center">
                <Trophy className="w-12 h-12 text-slate-100 mx-auto mb-3" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No achievements yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Active Memberships
          </h2>

          <div className="space-y-4">
            {myClubs.length > 0 ? (
              myClubs.map(({ club, reg }) => (
                <div key={club.id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-indigo-200 transition-colors">
                  <img src={`${ASSETS_URL}${club.image}`} className="w-14 h-14 rounded-2xl object-cover" alt="" />
                  <div className="flex-grow">
                    <h4 className="font-black text-slate-900 tracking-tight">{club.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{club.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-600 uppercase">Joined</p>
                    <p className="text-xs font-bold text-slate-500">{reg.joinedAt}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <Star className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">You haven't joined any clubs yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
