import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Chatbot from './components/Chatbot';
import AdminDashboard from './views/AdminDashboard';
import ClubDashboard from './views/ClubDashboard';
import StudentDashboard from './views/StudentDashboard';
import Profile from './views/Profile';

const MainLayout = () => {
  const { user, isLoading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isGuestOrStudent = !user || user.role === 'student';

  if (user) {
    const isProfilePage = user.role === 'student' && currentTab === 'profile';

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar 
          onProfileClick={() => setCurrentTab('profile')} 
          onHomeClick={() => setCurrentTab('home')}
        />
        <main className="flex-grow">
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'club_manager' && <ClubDashboard />}
          {user.role === 'student' && (
            currentTab === 'home' ? <StudentDashboard /> : <Profile onBack={() => setCurrentTab('home')} />
          )}
        </main>
        {isGuestOrStudent && <Chatbot />}
        {!isProfilePage && <Footer />}
      </div>
    );
  }

  if (showLogin) {
    return <Login onBack={() => setShowLogin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar 
        onLoginClick={() => setShowLogin(true)} 
        onHomeClick={() => setCurrentTab('home')}
      />
      <main className="flex-grow">
        <StudentDashboard onGuestJoin={() => setShowLogin(true)} />
      </main>
      <Chatbot />
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
