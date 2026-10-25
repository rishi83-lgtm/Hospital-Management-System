import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(window.localStorage.getItem('hospital-token')));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!window.localStorage.getItem('hospital-token')) return undefined;
    let active = true;
    getCurrentUser()
      .then(currentUser => { if (active) setUser(currentUser); })
      .catch(loadError => {
        logoutRequest();
        if (active) setError(loadError.message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const login = useCallback(async credentials => {
    setError('');
    try {
      const currentUser = await loginRequest(credentials);
      setUser(currentUser);
      return currentUser;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const register = useCallback(async details => {
    setError('');
    try {
      const currentUser = await registerRequest(details);
      setUser(currentUser);
      return currentUser;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, []);

  const logout = useCallback(() => {
    logoutRequest();
    setUser(null);
    setError('');
  }, []);

  const value = useMemo(() => ({ user, loading, error, login, register, logout }), [user, loading, error, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}