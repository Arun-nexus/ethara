import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user:    JSON.parse(localStorage.getItem('tf_user') || 'null'),
  token:   localStorage.getItem('tf_token') || null,
  loading: false,

  signup: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/signup', data);
      const { access_token, user } = res.data;
      localStorage.setItem('tf_token', access_token);
      localStorage.setItem('tf_user', JSON.stringify(user));
      set({ user, token: access_token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: err.response?.data?.detail || 'Signup failed' };
    }
  },

  login: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', data);
      const { access_token, user } = res.data;
      localStorage.setItem('tf_token', access_token);
      localStorage.setItem('tf_user', JSON.stringify(user));
      set({ user, token: access_token, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Login failed';
      return { success: false, error: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_user');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;