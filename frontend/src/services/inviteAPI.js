import api from './api';
export const inviteAPI = {
  generate: (projectId, data) => api.post(`/projects/${projectId}/invites`, data),
  list:     (projectId)       => api.get(`/projects/${projectId}/invites`),
  join:     (code)            => api.post('/invites/join', { code }),
};
