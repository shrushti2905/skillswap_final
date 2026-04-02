# SkillSwap Platform

## Overview

A full-stack peer-to-peer skill exchange platform. Users offer skills they have and request skills they want to learn. No money involved — pure knowledge exchange.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 20+
- **Frontend**: React 18 + Vite + Tailwind CSS (dark navy/purple theme)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)

## Structure

```
├── artifacts/
│   ├── api-server/     # Express API server
│   └── skillswap/      # React + Vite frontend
├── lib/
│   ├── api-spec/       # OpenAPI spec + codegen config
│   ├── api-client-react/ # Generated React Query hooks
│   └── db/             # Drizzle ORM schema
├── scripts/
│   └── src/seed.ts     # Database seeder
└── README.md           # Local setup guide
```

## Pages / Routes

- `/` — Public landing page (hero, how it works, features, testimonials)
- `/discover` — Browse users with search/filter (auth required)
- `/profile` — Profile management
- `/requests` — Swap request management
- `/notifications` — Notification center
- `/admin` — Admin panel (admin only)

## Admin Accounts

- **Shrushti**: shrushtipatil2905@gmail.com / Admin@123
- **Roshni**: roshroshi778@gmail.com / Admin@123

## Sample Users (from seed)

All sample users have password: `password123`
- priya.sharma@example.com (Python, ML)
- rohan.mehta@example.com (React, TypeScript)
- aisha.khan@example.com (Graphic Design, Branding)
- vikram.singh@example.com (Digital Marketing, SEO)
- sneha.patel@example.com (Photography, Video Editing)

## Key Design Decisions

- No animated background (removed canvas starfield) — subtle CSS grid + gradient
- Landing page is public; auth modal pops up when user clicks CTA
- After login/signup, users are redirected to `/discover`
- After logout, users are redirected to `/` (landing)
- All Replit-specific plugins removed from vite.config.ts
- PORT and BASE_PATH are optional with defaults (3000 and /)

## Run Commands

```bash
pnpm install
pnpm --filter @workspace/db run push
pnpm --filter @workspace/scripts run seed
PORT=8080 pnpm --filter @workspace/api-server run dev
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/skillswap run dev
```

See README.md for full local setup guide.
