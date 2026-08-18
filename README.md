# CodeCritic — Peer Code Review Platform

A developer-focused social platform where developers submit projects for
peer code review, receive structured feedback, and earn Karma for contributing.

Built as part of the STEMLink Software Engineering Professionals Programme.

## Live Demo

- Frontend: https://codecritic-dhanuja.vercel.app
- Backend API: https://codecritic-dhanuja.onrender.com

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Shadcn/UI |
| State management | Zustand |
| Authentication | Clerk |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel (frontend), Render (backend) |

## Features

- Public feed of review requests visible to everyone
- Personalised feed for logged-in users (recommendation engine)
- Post review requests with custom criteria (1–5 per submission)
- Submit structured reviews with per-criterion ratings out of 10
- Karma system — earn +2 per review submitted
- Public user profiles with contribution stats
- Search and filter submissions by technology
- Protected routes — posting and reviewing require login
- Self-review and duplicate review prevention
- Submission status: Pending → Reviewed automatically

## Developer

Built solo by Dhanuja Senarathne

## Local Setup

### Prerequisites
- Node.js v20+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/dhanuuj/codecritic-dhanuja.git
cd codecritic-dhanuja
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env` (copy from `backend/.env.example` and fill in values):

DATABASE_URL=your_neon_postgresql_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
PORT=3001
FRONTEND_URL=http://localhost:3000


Run database migrations:

```bash
npx prisma migrate deploy
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (copy from `frontend/.env.example` and fill in values):

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/feed
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/feed


Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`

## Documentation

- [`docs/erd.png`](docs/erd.png) — Database entity relationship diagram
- [`docs/recommendation-engine.md`](docs/recommendation-engine.md) — Recommendation engine design and scoring formula
- [`docs/postman-collection.json`](docs/postman-collection.json) — API test collection
- [`docs/screenshots/`](docs/screenshots/) — UI screenshots of all major pages