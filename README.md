# SkillSwap Platform

A peer-to-peer skill exchange platform where users offer skills they have and request skills they want to learn — completely free, no money involved.

---

## Features

- **Authentication** — Sign up / sign in with JWT tokens
- **Discover** — Browse and filter users by skill category or search
- **Skill Swap Requests** — Send, accept, reject, and complete swap requests
- **Profile Management** — Manage your bio, skills offered, skills wanted, and availability
- **Notifications** — Real-time notification system for swap activity
- **Admin Panel** — Secure admin dashboard for managing users and platform stats

---

## Admin Accounts

| Name | Email | Password |
|------|-------|----------|
| Shrushti Patil | shrushtipatil2905@gmail.com | Admin@123 |
| Roshni | roshroshi778@gmail.com | Admin@123 |

---

## Local Setup Guide

### Prerequisites

Make sure the following are installed on your PC:

- **Node.js** v20 or higher — https://nodejs.org
- **pnpm** v9 or higher — install via: `npm install -g pnpm`
- **PostgreSQL** v14 or higher — https://www.postgresql.org/download/

---

### Step 1 — Clone the repository

```bash
git clone <your-repo-url>
cd skillswap
```

---

### Step 2 — Install dependencies

```bash
pnpm install
```

---

### Step 3 — Set up the database

1. Start PostgreSQL and create a new database:

```sql
CREATE DATABASE skillswap;
```

2. Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/skillswap
JWT_SECRET=your_super_secret_jwt_key_here
```

Replace `yourpassword` with your PostgreSQL password.

---

### Step 4 — Push the database schema

```bash
pnpm --filter @workspace/db run push
```

This creates all the necessary tables (`users`, `requests`, `notifications`).

---

### Step 5 — Seed the database

```bash
pnpm --filter @workspace/scripts run seed
```

This creates:
- 2 admin accounts (Shrushti and Roshni)
- 5 sample users with skills
- Sample swap requests and notifications

---

### Step 6 — Start the API server

Open a new terminal window:

```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

The API will run at `http://localhost:8080`

---

### Step 7 — Start the frontend

Open another terminal window:

```bash
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/skillswap run dev
```

Open your browser at `http://localhost:3000`

---

## Project Structure

```
skillswap/
├── artifacts/
│   ├── api-server/          # Express 5 API (auth, users, requests, notifications, admin)
│   │   └── src/
│   │       ├── routes/      # API route handlers
│   │       └── middlewares/ # JWT auth middleware
│   └── skillswap/           # React + Vite frontend
│       └── src/
│           ├── pages/       # Page components (landing, discover, profile, requests, etc.)
│           ├── components/  # Shared UI components
│           └── hooks/       # Custom hooks (useAuth)
├── lib/
│   ├── db/                  # Drizzle ORM schema + database connection
│   ├── api-spec/            # OpenAPI spec (openapi.yaml)
│   └── api-client-react/    # Auto-generated React Query hooks (from OpenAPI)
└── scripts/
    └── src/seed.ts          # Database seeder
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register a new user |
| POST | /api/auth/login | Login and get JWT token |
| GET | /api/auth/me | Get current user profile |
| GET | /api/users | List/search users |
| PUT | /api/users/me/profile | Update profile |
| POST | /api/users/me/skills/offered | Add a skill offered |
| DELETE | /api/users/me/skills/offered | Remove a skill offered |
| POST | /api/users/me/skills/wanted | Add a skill wanted |
| DELETE | /api/users/me/skills/wanted | Remove a skill wanted |
| GET | /api/requests | List swap requests |
| POST | /api/requests | Create a swap request |
| PUT | /api/requests/:id/accept | Accept a request |
| PUT | /api/requests/:id/reject | Reject a request |
| PUT | /api/requests/:id/complete | Mark as completed |
| DELETE | /api/requests/:id | Delete a request |
| GET | /api/notifications | List notifications |
| PUT | /api/notifications/:id/read | Mark notification as read |
| PUT | /api/notifications/read-all | Mark all as read |
| GET | /api/admin/stats | Platform stats (admin only) |
| GET | /api/admin/users | All users (admin only) |
| PUT | /api/admin/users/:id/block | Block a user (admin only) |
| PUT | /api/admin/users/:id/unblock | Unblock a user (admin only) |
| DELETE | /api/admin/users/:id | Delete a user (admin only) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| UI Components | shadcn/ui (Radix UI) |
| State / Data | TanStack Query (React Query) |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| API Spec | OpenAPI 3.0 + Orval codegen |

---

## Troubleshooting

**Port already in use**: Change the PORT value or kill the process using that port.

**Database connection failed**: Ensure PostgreSQL is running and the `DATABASE_URL` in `.env` is correct.

**Schema not found**: Run `pnpm --filter @workspace/db run push` to create tables.

**Login fails**: Run the seed script first to create test accounts.
