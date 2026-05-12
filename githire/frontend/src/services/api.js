import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (email, password) =>
  api.post('/auth/register', { email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// Projects
export const getProjects = () =>
  api.get('/projects');

export const getProject = (id) =>
  api.get(`/projects/${id}`);

export const createProject = (name, description) =>
  api.post('/projects', { name, description });

export const updateProject = (id, name, description) =>
  api.put(`/projects/${id}`, { name, description });

export const deleteProject = (id) =>
  api.delete(`/projects/${id}`);

// Candidates
export const getCandidates = (projectId) =>
  api.get(`/projects/${projectId}/candidates`);

export const getCandidate = (projectId, candidateId) =>
  api.get(`/projects/${projectId}/candidates/${candidateId}`);

export const addCandidate = (projectId, github_profile_url) =>
  api.post(`/projects/${projectId}/candidates`, { github_profile_url });

export const removeCandidate = (projectId, candidateId) =>
  api.delete(`/projects/${projectId}/candidates/${candidateId}`);

// Analysis
export const saveRequirements = (projectId, requirements_text) =>
  api.post(`/projects/${projectId}/analysis/requirements`, { requirements_text });

export const getRequirements = (projectId) =>
  api.get(`/projects/${projectId}/analysis/requirements`);

export const runAnalysis = (projectId) =>
  api.post(`/projects/${projectId}/analysis/run`);

export const getLatestAnalysis = (projectId) =>
  api.get(`/projects/${projectId}/analysis/latest`);

// Public GitHub (without authentication)
export const getGithubProfile = (username) =>
  axios.get(`${import.meta.env.VITE_API_URL}/github/${username}`);

export default api;