// Ambil URL backend dari environment variable Vite
// Di development: set VITE_API_URL=http://localhost:3000/api di frontend/.env
// Di production : set VITE_API_URL=https://api.yourdomain.com/api
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

// ── FIX #6: Intercept 401 → auto logout + redirect login ──────────
// Dipakai oleh semua request() agar token kadaluarsa langsung ditangani
function handle401() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  // Redirect ke login hanya jika belum di sana
  if (!window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  // FIX #6: token expired / invalid → bersihkan session dan redirect
  if (response.status === 401) {
    handle401();
    throw new Error('Sesi kamu sudah berakhir, silakan login kembali');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Terjadi kesalahan' }));
    throw new Error(error.message || 'Terjadi kesalahan');
  }

  return response.json();
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name: string, email: string, password: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  getMe: () => request('/auth/me'),

  forgotPassword: (email: string) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (token: string, newPassword: string) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

  changePassword: (oldPassword: string, newPassword: string) =>
    request('/auth/change-password', { method: 'PUT', body: JSON.stringify({ oldPassword, newPassword }) }),

  // ── Profile ───────────────────────────────────────────────────────
  getProfile: () => request('/users/profile/me'),
  updateProfile: (data: any) =>
    request('/users/profile/me', { method: 'PUT', body: JSON.stringify(data) }),

  // FIX #5: Upload foto profil ke server (bukan base64 localStorage)
  uploadPhoto: (file: File) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('photo', file);
    return fetch(`${BASE_URL}/users/profile/photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async res => {
      if (res.status === 401) { handle401(); throw new Error('Sesi berakhir'); }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload gagal' }));
        throw new Error(err.message || 'Upload foto gagal');
      }
      return res.json(); // { photoUrl: '/uploads/photos/xxx.jpg' }
    });
  },

  // ── Orders ────────────────────────────────────────────────────────
  createOrder: (data: any) =>
    request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request('/orders/my'),
  getAllOrders: () => request('/orders'),
  activateOrder: (id: string) => request(`/orders/${id}/activate`, { method: 'PUT' }),
  rejectOrder:   (id: string) => request(`/orders/${id}/reject`,   { method: 'PUT' }),

  // ── Try Outs ──────────────────────────────────────────────────────
  getTryouts: () => request('/tryouts'),
  getTryout:  (id: string) => request(`/tryouts/${id}`),

  // ── Questions (FIX #2: support paginasi) ─────────────────────────
  getQuestions: (tryoutId: string) => request(`/questions/tryout/${tryoutId}`),
  getAllQuestions: (tryoutId?: string, page = 1, limit = 50) =>
    request(`/questions?page=${page}&limit=${limit}${tryoutId ? `&tryoutId=${tryoutId}` : ''}`),
  createQuestion:  (data: any) =>
    request('/questions', { method: 'POST', body: JSON.stringify(data) }),
  updateQuestion:  (id: string, data: any) =>
    request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuestion:  (id: string) => request(`/questions/${id}`, { method: 'DELETE' }),

  // ── Exam ──────────────────────────────────────────────────────────
  getDraft: (tryoutId: string) => request(`/exam/${tryoutId}/draft`),
  saveDraft: (tryoutId: string, answers: any, currentSubtest: number) =>
    request(`/exam/${tryoutId}/draft`, {
      method: 'PUT', body: JSON.stringify({ answers, currentSubtest }),
    }),
  submitExam: (tryoutId: string, answers: any, subScores: any[]) =>
    request(`/exam/${tryoutId}/submit`, {
      method: 'POST', body: JSON.stringify({ answers, subScores }),
    }),

  // ── Packages ──────────────────────────────────────────────────────
  getPackages: () => request('/packages'),
  getPackage:  (id: string) => request(`/packages/${id}`),

  // ── Results ───────────────────────────────────────────────────────
  getResults:  () => request('/results'),
  getResult:   (tryoutId: string) => request(`/results/${tryoutId}`),
  getRanking:  (tryoutId: string) => request(`/results/${tryoutId}/ranking`),

  // ── Admin ─────────────────────────────────────────────────────────
  getAllUsers: () => request('/users'),
};

// ── Admin CRUD Tryout + upload soal ───────────────────────────────
export const adminApi = {
  createTryout: (data: any) =>
    request('/tryouts', { method: 'POST', body: JSON.stringify(data) }),
  updateTryout: (id: string | number, data: any) =>
    request(`/tryouts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTryout: (id: string | number) =>
    request(`/tryouts/${id}`, { method: 'DELETE' }),
  toggleTryoutActive: (id: string | number) =>
    request(`/tryouts/${id}/toggle-active`, { method: 'PUT' }),

  getTryoutsAdmin: () => request('/tryouts'),

  getQuestionStats: (tryoutId: string | number) =>
    request(`/results/${tryoutId}/question-stats`),

  uploadQuestions: (file: File) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${BASE_URL}/questions/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async res => {
      if (res.status === 401) { handle401(); throw new Error('Sesi berakhir'); }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Upload gagal' }));
        throw new Error(err.message || 'Upload gagal');
      }
      return res.json();
    });
  },
};
