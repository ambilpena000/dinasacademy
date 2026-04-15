// Ambil URL backend dari environment variable, fallback ke localhost
const BASE_URL = 'http://localhost:3000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Terjadi kesalahan' }));
    throw new Error(error.message || 'Terjadi kesalahan');
  }

  return response.json();
}

export const api = {
  // ── Auth ──────────────────────────────────────────
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  getMe: () => request('/auth/me'),

  changePassword: (oldPassword: string, newPassword: string) =>
    request('/auth/change-password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),

  // ── Profile ───────────────────────────────────────
  getProfile: () => request('/users/profile/me'),
  updateProfile: (data: any) =>
    request('/users/profile/me', { method: 'PUT', body: JSON.stringify(data) }),

  // ── Orders ────────────────────────────────────────
  createOrder: (data: any) =>
    request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request('/orders/my'),
  getAllOrders: () => request('/orders'),
  activateOrder: (id: string) => request(`/orders/${id}/activate`, { method: 'PUT' }),
  rejectOrder: (id: string) => request(`/orders/${id}/reject`, { method: 'PUT' }),

  // ── Try Outs ──────────────────────────────────────
  getTryouts: () => request('/tryouts'),
  getTryout: (id: string) => request(`/tryouts/${id}`),

  // ── Questions ─────────────────────────────────────
  getQuestions: (tryoutId: string) => request(`/questions/tryout/${tryoutId}`),
  getAllQuestions: (tryoutId?: string) =>
    request(`/questions${tryoutId ? `?tryoutId=${tryoutId}` : ''}`),
  createQuestion: (data: any) =>
    request('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion: (id: string, data: any) =>
    request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion: (id: string) => request(`/questions/${id}`, { method: 'DELETE' }),

  // ── Exam ──────────────────────────────────────────
  getDraft: (tryoutId: string) => request(`/exam/${tryoutId}/draft`),
  saveDraft: (tryoutId: string, answers: any, currentSubtest: number) =>
    request(`/exam/${tryoutId}/draft`, {
      method: 'PUT', body: JSON.stringify({ answers, currentSubtest }),
    }),
  submitExam: (tryoutId: string, answers: any, subScores: any[]) =>
    request(`/exam/${tryoutId}/submit`, {
      method: 'POST', body: JSON.stringify({ answers, subScores }),
    }),

  // ── Results ───────────────────────────────────────
  getResults: () => request('/results'),
  getResult: (tryoutId: string) => request(`/results/${tryoutId}`),
  getRanking: (tryoutId: string) => request(`/results/${tryoutId}/ranking`),

  // ── Admin ─────────────────────────────────────────
  getAllUsers: () => request('/users'),
};