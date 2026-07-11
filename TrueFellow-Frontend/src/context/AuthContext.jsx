import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import { jwtDecode } from 'jwt-decode';
import { ME_QUERY, LOGIN_MUTATION, REGISTER_MUTATION } from '../graphql/operations';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [loadMe, { refetch: refetchMe }] = useLazyQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      } else {
        setUser(null);
      }
      setLoading(false);
    },
    onError: () => {
      setUser(null);
      setLoading(false);
    },
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);

  // Initialize session on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired, logout
          logout();
        } else {
          loadMe();
        }
      } catch (err) {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await loginMutation({
      variables: { input: { email, password } },
    });
    if (data?.login) {
      localStorage.setItem('token', data.login.accessToken);
      localStorage.setItem('refreshToken', data.login.refreshToken);
      setUser(data.login.user);
      // Fetch full details
      await loadMe();
      return data.login.user;
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
      await loadMe();
      return data.register.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setLoading(false);
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const refreshUser = async () => {
    if (refetchMe) {
      const { data } = await refetchMe();
      if (data?.me) {
        setUser(data.me);
      }
    }
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

export const useAuth = () => useContext(AuthContext);
