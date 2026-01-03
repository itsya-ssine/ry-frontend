import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../../services/apiService.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const storedUserId = localStorage.getItem('ry_userId');

    if (storedUserId) {
      api.getUser(storedUserId)
        .then(u => {
          if (isMounted) {
            if (u) setUser(u);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, []);

  const updateUser = (newData) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...newData };
    });
  };

  const login = async (email, password) => {
    setIsAuthenticating(true);
    try {
      const foundUser = await api.login(email, password);
      if (!foundUser || foundUser.error) return false;

      setUser(foundUser);
      localStorage.setItem('ry_userId', foundUser.id);
      return true;
    } catch (error) {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const signup = async (name, email, password) => {
    setIsAuthenticating(true);
    try {
      const response = await api.registerUser(name, email, password);

      if (response?.error) {
        return { success: false, message: response.error };
      }

      setUser(response);
      localStorage.setItem('ry_userId', response.id.toString());
      return { success: true };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, message: "Server connection failed" };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ry_userId');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticating, login, signup, logout, updateUser }}>
      {!isLoading && children} 
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
