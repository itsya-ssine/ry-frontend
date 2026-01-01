import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, Shield, BookOpen, KeyRound, ArrowLeft, UserPlus, Mail, User as UserIcon, Eye, EyeOff, Lock } from 'lucide-react';

const Login = ({ onBack }) => {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          setError('Please fill in all fields');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const result = await signup(name, email, password);
        
        if (!result.success) {
          setError(result.message);
        }
      } else {
        const success = await login(email, password);
        if (!success) {
          setError('Invalid email or password');
        }
      }
    } catch (error) {
      setError(`An unexpected error occurred. Please try again.`);
    }
  };

  const quickLogin = (role) => {
    const emails = {
      admin: 'naoki@gmail.com',
      club: 'openmind@gmail.com',
      student: 'rihab@gmail.com'
    };
    const password = {
      admin: 'naoki123',
      club: 'qwe123',
      student: 'qwe123'
    }
    login(emails[role], password[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 relative border border-white/50">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        )}

        <div className="text-center mb-8 pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl text-white mb-4 shadow-lg shadow-indigo-200">
            {isSignUp ? <UserPlus className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isSignUp ? 'Join your university community today' : 'Manage your clubs and activities'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  placeholder="Enter your full name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                placeholder="university@example.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setPassword(''); setConfirmPassword(''); }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {!isSignUp && (
          <>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-2 bg-white text-gray-400">Quick Access Roles</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button type="button" onClick={() => quickLogin('admin')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:bg-red-50 hover:border-red-100 transition-all group">
                <Shield className="w-6 h-6 text-red-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Admin</span>
              </button>
              <button type="button" onClick={() => quickLogin('club')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-100 transition-all group">
                <Users className="w-6 h-6 text-purple-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Club Mgr</span>
              </button>
              <button type="button" onClick={() => quickLogin('student')} className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all group">
                <BookOpen className="w-6 h-6 text-blue-500 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Student</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
