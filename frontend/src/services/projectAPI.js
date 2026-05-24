import api from './api';
export const projectAPI = {
  create:    (data) => api.post('/projects', data),
  getAll:    ()     => api.get('/projects'),
  getById:   (id)   => api.get(`/projects/${id}`),
  delete:    (id)   => api.delete(`/projects/${id}`),
  dashboard: (id)   => api.get(`/projects/${id}/dashboard`),
};
