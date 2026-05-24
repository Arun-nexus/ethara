import api from './api';
export const taskAPI = {
  create: (projectId, data)         => api.post(`/projects/${projectId}/tasks`, data),
  getAll: (projectId)               => api.get(`/projects/${projectId}/tasks`),
  update: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId)       => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};
