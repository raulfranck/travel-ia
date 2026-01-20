import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redireciona para login se não autorizado
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// API Endpoints
export const tripsApi = {
  getAll: (userId?: string) => api.get('/trips', { params: { userId } }),
  getOne: (id: string) => api.get(`/trips/${id}`),
  create: (data: any) => api.post('/trips', data),
  update: (id: string, data: any) => api.patch(`/trips/${id}`, data),
  generateItinerary: (id: string) => api.post(`/trips/${id}/generate-itinerary`),
};

export const expensesApi = {
  getAll: (tripId?: string) => api.get('/expenses', { params: { tripId } }),
  getOne: (id: string) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post('/expenses', data),
  processOcr: (imageUrl: string, tripId: string) =>
    api.post('/expenses/ocr', { imageUrl, tripId }),
};

export const userApi = {
  getProfile: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  getStats: (id: string) => api.get(`/users/${id}/stats`),
};

export const authApi = {
  login: (whatsappHash: string) => api.post('/auth/login', { whatsappHash }),
  verifyOtp: (whatsappHash: string, otp: string) =>
    api.post('/auth/verify-otp', { whatsappHash, otp }),
};

export const paymentApi = {
  createSubscription: (userId: string, plan: string) =>
    api.post('/payments/create-subscription', { userId, plan }),
  cancelSubscription: (userId: string) =>
    api.post('/payments/cancel-subscription', { userId }),
};

