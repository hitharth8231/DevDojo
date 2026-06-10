const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'; 

const api = {
  async request(endpoint, { body, method = 'GET', ...customConfig } = {}) {
    let token = localStorage.getItem('dojo_token');
    const headers = { 'Content-Type': 'application/json' };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      method,
      ...customConfig,
      headers: { ...headers, ...customConfig.headers },
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      let response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle expired token - try to refresh
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken && endpoint !== '/auth/refresh') {
          try {
            // Attempt to refresh the access token
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken })
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              // Store the new access token
              localStorage.setItem('dojo_token', refreshData.access_token);
              
              // Retry the original request with the new token
              token = refreshData.access_token;
              headers.Authorization = `Bearer ${token}`;
              config.headers = { ...headers, ...customConfig.headers };
              response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
              // Refresh failed - user needs to login again
              this.logout();
              return;
            }
          } catch (err) {
            console.error('Token refresh failed:', err);
            // Logout on refresh failure
            this.logout();
            return;
          }
        } else {
          // No refresh token or already at refresh endpoint - logout
          this.logout();
          return;
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Something went wrong');
      }
      return response.status === 204 ? {} : response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  login: (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email.trim().toLowerCase());
    formData.append('password', password);
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }
      return res.json();
    });
  },

  register: (username, email, password) =>
    api.request('/auth/register', {
      method: 'POST',
      body: { username: username.trim(), email: email.trim().toLowerCase(), password },
    }),

  getMe: () => api.request('/auth/me'),

  updateMe: (github_username) =>
    api.request('/auth/me', {
      method: 'PUT',
      body: { github_username },
    }),

  logout: () => {
    localStorage.removeItem('dojo_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  },

  getGroups: () => api.request('/groups/'),

  createGroup: ({ name, description }) =>
    api.request('/groups/', {
      method: 'POST',
      body: { name, description },
    }),

  joinGroup: (groupId) =>
    api.request(`/groups/${groupId}/join`, {
      method: 'POST',
    }),

  getGroupLeaderboard: async (groupId) => {
    const response = await api.request(`/leaderboard/group/${groupId}`);
    return response;
  },

  getGroup: (groupId) => api.request(`/groups/${groupId}`),

  getGroupMembers: (groupId) => api.request(`/groups/${groupId}/members`),

  createChallenge: ({ group_id, topic, difficulty }) =>
    api.request('/challenges/', {
      method: 'POST',
      body: { group_id, topic, difficulty },
    }),

  getPreviousChallenges: (groupId) =>
    api.request(`/challenges/group/${groupId}/previous`),

  getChallenge: (challengeId) =>
    api.request(`/challenges/${challengeId}`),

  deleteChallenge: (challengeId) =>
    api.request(`/challenges/${challengeId}`, {
      method: 'DELETE',
    }),

  submitSolution: ({ user_id, challenge_id, code }) =>
    api.request('/submissions/submit', {
      method: 'POST',
      body: { user_id, challenge_id, code },

    }),
    

  fetchFeedback: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/challenges/feedback/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch feedback");
    return res.json();
  },
};

export default api;
