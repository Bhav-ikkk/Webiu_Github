import axios from 'axios';

const apiClient = axios.create({
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error || error.message || 'Network error';
    return Promise.reject({ ...error, message });
  }
);

export default apiClient;
