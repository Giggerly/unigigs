# CampusGig 🎓

> A campus-native gig marketplace. Post or find paid campus gigs in minutes — without the chaos of WhatsApp groups.

---

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)
- npm or pnpm

---

### 1. Clone & Install

```bash
git clone <your-repo>
cd campusgig
npm install
```

---

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/campusgig"
JWT_SECRET="your-super-secret-min-32-chars-change-this-now"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
NODE_ENV="development"
```

---

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

---

### 4. Run the App

```bash
npm run dev
```

App runs at **http://localhost:3000**

> **Important:** The app runs via a custom Node.js server (`server.ts`) — NOT `next dev`. This is required for Socket.io real-time chat.

---

## Demo Accounts

| Role  | Phone       | Password     |
|-------|-------------|--------------|
| Admin | 9999999999  | admin123     |
| User  | 9876543210  | password123  |
| User  | 9876543211  | password123  |
| User  | 9876543212  | password123  |

---

## Tech Stack

| Layer       | Tech                                    |
|-------------|----------------------------------------|
| Framework   | Next.js 14 (App Router)                |
| Language    | TypeScript                             |
| Styling     | Tailwind CSS + shadcn/ui               |
| Animations  | Framer Motion                          |
| Database    | PostgreSQL + Prisma ORM                |
| Auth        | Custom JWT + bcrypt + httpOnly cookies |
| Real-time   | Socket.io on custom Node server        |
| State       | Zustand + TanStack Query               |
| Forms       | React Hook Form + Zod                  |

---

## Project Structure

```
campusgig/
├── app/                  # Next.js App Router pages + API routes
│   ├── login/
│   ├── register/
│   ├── gigs/             # Feed, create, detail, my-gigs
│   ├── messages/         # Chat inbox + threads
│   ├── profile/          # Public profile + edit
│   ├── my-work/          # Worker's applied/completed gigs
│   ├── admin/            # Admin dashboard
│   └── api/              # All API route handlers
├── components/           # React components
│   ├── ui/               # Base design system components
│   ├── gigs/             # Gig-specific components
│   ├── chat/             # Chat components
│   ├── profile/          # Profile components
│   ├── admin/            # Admin components
│   └── layout/           # App shell, Navbar, BottomNav
├── lib/                  # Utilities, auth, DB, validation
├── services/             # Business logic layer
├── store/                # Zustand stores
├── hooks/                # Custom React hooks
├── prisma/               # Schema + migrations + seed
└── server.ts             # Custom server with Socket.io
```

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
```

---

## Production Deployment

1. Set `NODE_ENV=production` in environment
2. Set a strong `JWT_SECRET` (32+ chars)
3. Point `DATABASE_URL` to your production PostgreSQL
4. Run `npm run build && npm run start`

For file storage in production, replace the local upload handler (`app/api/profile/upload/route.ts`) with an S3-compatible upload service.

---

## Architecture Notes

- **Modular monolith:** All business logic lives in `/services`, API routes are thin controllers
- **Auth:** JWT stored in httpOnly cookie, verified at edge via Next.js middleware
- **Real-time:** Socket.io runs on the same port as Next.js via custom `server.ts`
- **Moderation:** AI flags content for admin review — nothing is auto-banned
- **Mobile-first:** UI designed for thumb reach, bottom navigation, fast scrolling

---

Built with ❤️ for students, by students.
