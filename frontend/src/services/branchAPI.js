import api from './api';
export const branchAPI = {
  getAll:        (projectId)       => api.get(`/projects/${projectId}/branches`),
  getTimeline:   (projectId)       => api.get(`/projects/${projectId}/branches/timeline`),
  createFeature: (projectId, name) => api.post(`/projects/${projectId}/branches?name=${encodeURIComponent(name)}`),
};
