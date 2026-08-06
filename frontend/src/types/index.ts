// Shape of a User from our database
export interface User {
  id: string
  clerkId: string
  username: string
  email: string
  bio?: string
  githubUrl?: string
  avatarUrl?: string
  karma: number
  techStack: string[]
  createdAt: string
  _count?: {
    submissions: number
    reviews: number
  }
}

// A single review criterion defined by the submitter
export interface ReviewCriterion {
  id: string
  label: string
  submissionId: string
}

// A rating given for one criterion inside a review
export interface CriterionRating {
  id: string
  score: number
  criterionId: string
  criterion: ReviewCriterion
}

// A review submitted by one user on another's submission
export interface Review {
  id: string
  strengths: string
  improvements: string
  resources?: string
  submissionId: string
  reviewerId: string
  reviewer: Pick<User, 'id' | 'username' | 'avatarUrl' | 'karma'>
  criterionRatings: CriterionRating[]
  createdAt: string
}

// A submission (review request) posted by a user
export interface Submission {
  id: string
  title: string
  description: string
  githubUrl: string
  techTags: string[]
  status: 'PENDING' | 'REVIEWED'
  authorId: string
  author: Pick<User, 'id' | 'username' | 'avatarUrl' | 'karma'>
  criteria: ReviewCriterion[]
  reviews?: Review[]
  _count?: {
    reviews: number
  }
  createdAt: string
  updatedAt: string
}

// Standard paginated API response shape
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// Standard single-item API response shape
export interface ApiResponse<T> {
  data: T
  message?: string
}