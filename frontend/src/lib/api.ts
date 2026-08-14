const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

// Core function — all API calls go through this
export async function apiCall<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // If a token is provided, add it to the Authorization header
  // The backend's requireAuth middleware reads this
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  // If the response wasn't successful, throw an error
  // with the message from the backend
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

// ─── Submission API calls ───────────────────────────────

export const submissionsApi = {
  // Get public feed — no token needed
  getAll: (params?: { search?: string; tech?: string; page?: number }, token?: string) => {
    const query = new URLSearchParams()
    if (params?.search) query.set('search', params.search)
    if (params?.tech) query.set('tech', params.tech)
    if (params?.page) query.set('page', String(params.page))
    const queryStr = query.toString()
    return apiCall(
      `/api/submissions${queryStr ? `?${queryStr}` : ''}`,
      { token }
    )
  },

  // Get one submission by ID — no token needed
  getById: (id: string) =>
    apiCall(`/api/submissions/${id}`),

  // Get current user's own submissions — token required
  getMine: (token: string) =>
    apiCall('/api/submissions/my/list', { token }),

  // Create a new submission — token required
  create: (data: {
    title: string
    description: string
    githubUrl: string
    techTags: string[]
    criteria: string[]
  }, token: string) =>
    apiCall('/api/submissions', { method: 'POST', body: data, token }),
}

// ─── Review API calls ───────────────────────────────────

export const reviewsApi = {
  // Submit a review — token required
  create: (submissionId: string, data: {
    strengths: string
    improvements: string
    resources?: string
    criterionRatings: { criterionId: string; score: number }[]
  }, token: string) =>
    apiCall(`/api/submissions/${submissionId}/reviews`, {
      method: 'POST',
      body: data,
      token,
    }),

  // Get reviews the current user has written
  getGiven: (token: string) =>
    apiCall('/api/reviews/given', { token }),

  // Get reviews received on the current user's submissions
  getReceived: (token: string) =>
    apiCall('/api/reviews/received', { token }),
}

// ─── User API calls ─────────────────────────────────────

export const usersApi = {
  // Get current logged-in user's profile
  getMe: (token: string) =>
    apiCall('/api/users/me', { token }),

  // Get any user's public profile by username
  getByUsername: (username: string) =>
    apiCall(`/api/users/${username}`),

  // Update current user's profile
  updateMe: (data: {
    username?: string
    bio?: string
    githubUrl?: string
    techStack?: string[]
  }, token: string) =>
    apiCall('/api/users/me', { method: 'PATCH', body: data, token }),
}

// ─── Auth API calls ──────────────────────────────────────

export const authApi = {
  // Syncs the Clerk user to our database after sign-in
  sync: (token: string) =>
    apiCall('/api/auth/sync', { method: 'POST', token }),
}