# SkillSwap Platform

## Overview

A full-stack skill exchange platform where users can offer skills they have and request skills they want to learn. Built with React + Vite frontend, Express backend, and PostgreSQL database.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (dark navy/purple theme)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, users, requests, notifications, admin)
│   └── skillswap/          # React + Vite frontend (dark UI)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeder
└── ...
```

## Database Models

- **users** — id, name, email, password (hashed), role (admin/user), skillsOffered[], skillsWanted[], bio, location, profileImage, isBlocked, availability[], isPublic, rating, ratingCount, createdAt
- **requests** — id, senderId, receiverId, skillOffered, skillRequested, message, status (pending/accepted/rejected/completed), createdAt
- **notifications** — id, userId, message, isRead, createdAt

## Seed Data

Run: `pnpm --filter @workspace/scripts run seed`

- **Admin**: shrushtipatil2905@gmail.com / Admin@123
- **5 sample users** (priya.sharma@example.com, rohan.mehta@example.com, etc.) / password123
- **5 sample swap requests** + sample notifications

## Pages

- `/` — Discover: hero, platform stats, category filters, user cards grid
- `/auth` — Sign In / Sign Up (with animated starfield background)
- `/profile` — Profile management, skills offered/wanted
- `/requests` — Swap request management (sent/received/all tabs)
- `/notifications` — Notification center
- `/admin` — Admin dashboard (admin only): stats, user management, request management

## API Routes

All routes under `/api`:
- `POST /api/auth/signup` — register
- `POST /api/auth/login` — login
- `GET /api/auth/me` — current user
- `GET /api/users` — discover users
- `PUT /api/users/me/profile` — update profile
- `POST/DELETE /api/users/me/skills/offered` — manage skills
- `POST/DELETE /api/users/me/skills/wanted` — manage skills
- `GET/POST /api/requests` — list/create requests
- `PUT /api/requests/:id/accept|reject|complete` — manage requests
- `GET /api/notifications` — notifications
- `PUT /api/notifications/:id/read` — mark read
- `GET /api/admin/stats` — admin stats
- `GET /api/admin/users` — admin user list
- `PUT /api/admin/users/:id/block|unblock` — manage users
- `DELETE /api/admin/users/:id` — delete user

## Run Commands

```bash
# Install dependencies
pnpm install

# Push DB schema
pnpm --filter @workspace/db run push

# Seed database
pnpm --filter @workspace/scripts run seed

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (uses PORT env var)
pnpm --filter @workspace/skillswap run dev

# Run codegen (after OpenAPI spec changes)
pnpm --filter @workspace/api-spec run codegen
```

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provided)
- `JWT_SECRET` — Optional JWT secret (defaults to built-in key)
- `PORT` — Port for each service (auto-assigned)
