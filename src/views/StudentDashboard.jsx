import { useEffect, useState } from 'react';
import { api } from '../../services/apiService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Calendar, Search, ArrowRight, CheckCircle, Clock, XCircle } from 'lucide-react';

const StudentDashboard = ({ onGuestJoin }) => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      const [c, a] = await Promise.all([api.getClubs(), api.getActivities()]);
      setClubs(c);
      setActivities(a);
    };
    loadContent();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchStatus = async () => {
      try {
        const regs = await api.getStudentRegistrations(user.id);
        setMyRegistrations(regs);
      } catch (err) {
        console.error("Status sync error:", err);
      }
    };

    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 4000);

    return () => clearInterval(statusInterval);
  }, [user]);

  const handleJoin = async (clubId) => {
    if (!user) {
      if (onGuestJoin) onGuestJoin();
      return;
    }
    const reg = await api.registerStudent(user.id, clubId);
    setMyRegistrations(prev => [...prev, reg]);
  };

  const getRegistrationStatus = (clubId) => {
    return myRegistrations.find(r => r.clubId === clubId)?.status;
  };

  const filteredClubs = clubs.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Upcoming Activities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map(activity => (
            <div key={activity.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img src={activity.image} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" alt={activity.title} />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                <span className="inline-block px-2 py-1 bg-indigo-600 rounded text-xs font-bold mb-2">
                  {activity.date}
                </span>
                <h3 className="text-xl font-bold mb-1">{activity.title}</h3>
                <p className="text-gray-200 text-sm line-clamp-2">{activity.description}</p>
                <div className="mt-3 flex items-center text-xs text-gray-300">
                  <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                    {activity.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Discover Clubs</h2>
            <p className="text-gray-500 mt-1">Join clubs that match your passion</p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => {
            const status = getRegistrationStatus(club.id);
            return (
              <div key={club.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-200 transition-colors flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <img src={club.image} alt={club.name} className="w-12 h-12 rounded-lg object-cover" />
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                    {club.category}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{club.name}</h3>
                <p className="text-gray-500 text-sm flex-grow mb-6">{club.description}</p>

                <div className="mt-auto">
                  {!status && (
                    <button
                      onClick={() => handleJoin(club.id)}
                      className="w-full py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                    >
                      {user ? 'Join Club' : 'Login to Join'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {status === 'pending' && (
                    <div className="w-full py-2 bg-amber-50 text-amber-700 font-medium rounded-lg flex items-center justify-center gap-2 cursor-default">
                      <Clock className="w-4 h-4" />
                      Pending Approval
                    </div>
                  )}
                  {status === 'accepted' && (
                    <div className="w-full py-2 bg-green-50 text-green-700 font-medium rounded-lg flex items-center justify-center gap-2 cursor-default">
                      <CheckCircle className="w-4 h-4" />
                      Member
                    </div>
                  )}
                  {status === 'rejected' && (
                    <div className="w-full py-2 bg-red-50 text-red-700 font-medium rounded-lg flex items-center justify-center gap-2 cursor-default">
                      <XCircle className="w-4 h-4" />
                      Declined
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
