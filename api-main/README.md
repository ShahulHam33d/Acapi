# Alpha Connect

Alpha Connect is a clean, multi-workspace SaaS foundation for WhatsApp Business customer communication.

## Implemented now

- Login and signup UI with isolated development session behavior, validation, loading/error states, and password visibility controls.
- Dashboard shell, responsive sidebar, workspace profile area, empty-state metrics, and WhatsApp onboarding configuration state.
- Contacts and conversations are read through API/database boundaries; seed data remains in Prisma seed.
- Three-panel Chats inbox with real Active, Requesting, and Intervened filters plus Intervene ownership behavior.
- Prisma schema for users, workspaces, connections, contacts, conversations, and messages.
- Meta Embedded Signup configuration boundary and webhook verification skeleton. No fake connection or delivery is performed.

## Stack and structure

Next.js App Router, TypeScript, React, Tailwind CSS, Prisma/PostgreSQL, Zod-ready validation boundaries, and Lucide icons. UI is under `app/` and `components/`; persistence and provider boundaries are under `lib/` and `services/`; database schema and seed are under `prisma/`.

## Setup

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `npm install`.
4. Run `npx prisma generate`.
5. Run `npx prisma migrate dev --name init`.
6. Run `npm run seed` for fake local data.
7. Run `npm run dev`, then open `http://localhost:3000`.

Meta Embedded Signup requires a Meta app, configuration ID, and server-side app secret. Set `NEXT_PUBLIC_META_APP_ID`, `NEXT_PUBLIC_META_CONFIG_ID`, `META_APP_SECRET`, and `META_GRAPH_API_VERSION` in `.env`. The app secret is server-only; tokens must be encrypted or stored in a secrets vault when the exchange flow is completed.

AI Agents, Campaigns, WA Payments, Ads Manager, Manage, Integrations, and Developer are intentionally placeholder screens. Team permissions, billing, templates, campaigns, AI, payments, provider webhooks, and production authentication are not implemented yet.
