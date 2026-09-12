import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { jwtDecode } from 'jwt-decode';
import { ME_QUERY, LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/operations';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const client = useApolloClient();

  const fetchMeUser = useCallback(async () => {
    try {
      const { data } = await client.query({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });
      if (data?.me) {
        setUser(data.me);
        return data.me;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      console.error('Failed to fetch me user:', err);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [client]);

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setLoading(false);
    try {
      await client.clearStore();
    } catch (err) {
      console.error('Error clearing Apollo cache:', err);
    }
  }, [client]);

  // Initialize session on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          fetchMeUser();
        }
      } catch {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [fetchMeUser, logout]);

  const login = async (email, password) => {
    const { data } = await loginMutation({
      variables: { input: { email, password } },
    });
    if (data?.login) {
      localStorage.setItem('token', data.login.accessToken);
      localStorage.setItem('refreshToken', data.login.refreshToken);
      setUser(data.login.user);
      const meData = await fetchMeUser();
      return meData || data.login.user;
    }
  };

  const register = async (name, email, password) => {
    const { data } = await registerMutation({
      variables: { input: { name, email, password } },
    });
    if (data?.register) {
      localStorage.setItem('token', data.register.accessToken);
      localStorage.setItem('refreshToken', data.register.refreshToken);
      setUser(data.register.user);
      const meData = await fetchMeUser();
      return meData || data.register.user;
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  const refreshUser = async () => {
    return await fetchMeUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

