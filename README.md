# 🚀 Next.js + Prisma v7 + Neon (JavaScript-Only Setup)

A complete, production-ready guide to setting up **Prisma ORM v7** with **Next.js App Router** and **Neon Serverless PostgreSQL** using **pure JavaScript** (no TypeScript required).

> **Note:** This is a custom, non-standard setup optimized for JavaScript developers. All configuration and code samples are tested and working.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Project Structure](#project-structure)
5. [Key Files Explained](#key-files-explained)
6. [Database Operations](#database-operations)
7. [Testing the API](#testing-the-api)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Common Patterns](#common-patterns)

---

## 🧱 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
├─────────────────────────────────────────────────────────┤
│              app/api/users/route.js (API)               │
├─────────────────────────────────────────────────────────┤
│            lib/prisma.js (Singleton Client)            │
├─────────────────────────────────────────────────────────┤
│   Prisma Client (src/generated/prisma/client.ts)        │
├─────────────────────────────────────────────────────────┤
│         Neon Adapter (@prisma/adapter-neon)            │
├─────────────────────────────────────────────────────────┤
│      Neon Serverless PostgreSQL (Cloud Database)        │
└─────────────────────────────────────────────────────────┘
```

**Why Neon Adapter?**
- Designed for serverless environments (Vercel, Lambda, etc.)
- Connection pooling prevents "too many connections" errors
- WebSocket support for real-time connections

---

## 📦 Tech Stack

| Component | Purpose |
|-----------|---------|
| **Next.js 16** | Full-stack React framework with App Router |
| **Prisma v7** | Type-safe ORM for database operations |
| **Neon** | Serverless PostgreSQL database |
| **@prisma/adapter-neon** | Bridge between Prisma and Neon |
| **@neondatabase/serverless** | Neon client library |
| **ws** | WebSocket support for Node.js |
| **JavaScript (ESM)** | Pure JS, no TypeScript compilation needed |

---

## ✅ Prerequisites

Before starting, ensure you have:

- **Node.js v18+** ([download](https://nodejs.org))
- **npm** or **yarn** package manager
- **Neon account** ([sign up free](https://neon.tech))
- **Git** (recommended)

---

## 🛠 Step-by-Step Setup

### Step 1: Create a New Next.js Project

```bash
npx create-next-app@latest neon-prisma --javascript --no-typescript --app
cd neon-prisma
```

**Options to select:**
- ✅ Use ESLint? (Yes)
- ✅ Use Tailwind CSS? (Yes/No, optional)
- ✅ TypeScript? (No - we're using JavaScript)

### Step 2: Install Prisma & Neon Dependencies

```bash
# Core packages
npm install @prisma/client @prisma/adapter-neon @neondatabase/serverless

# Dev dependencies for CLI
npm install --save-dev prisma

# Node.js WebSocket support (required for serverless)
npm install ws

# Optional: Buffer utilities (if you get warnings)
npm install -D bufferutil
```

### Step 3: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env.local` - Environment variables file

### Step 4: Configure Neon Connection

**Get your Neon connection string:**

1. Go to [console.prisma.io](https://console.prisma.io)
2. Create a new Prisma Postgres project (or connect existing Neon DB)
3. Copy the **pooled connection string**

**Update `.env.local`:**

```bash
# Pooled connection (for runtime queries in production/serverless)
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx-pooler.neon.tech/db?sslmode=require&channel_binding=require"

# Optional: Direct connection (for migrations only - safer)
DIRECT_URL="postgresql://USER:PASSWORD@ep-xxx.neon.tech/db?sslmode=require&channel_binding=require"
```

> **Pooled vs Direct:**
> - **Pooled** (pooler.neon.tech) - Use for app queries, handles many concurrent connections
> - **Direct** - Use only for migrations, creates fewer connections

### Step 5: Configure Prisma Config File

Create or update `prisma.config.mjs`:

```javascript
import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: env('DATABASE_URL'),
    // Uncomment to use direct connection for migrations only:
    // directUrl: env('DIRECT_URL'),
  },
})
```

### Step 6: Define Your Database Schema

Edit `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

**Key points:**
- `output = "../src/generated/prisma"` - Generates client in custom location
- `@id` - Primary key
- `@unique` - Unique constraint (email can't duplicate)
- `@default(cuid())` - Auto-generate unique ID
- `DateTime @default(now())` - Auto-set current timestamp

### Step 7: Create Prisma Singleton

Create `lib/prisma.js`:

```javascript
// lib/prisma.js
import { PrismaClient } from '../src/generated/prisma/client.ts'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Enable WebSocket for serverless environments
neonConfig.webSocketConstructor = ws

// Create Neon adapter
const connectionString = process.env.DATABASE_URL
const adapter = new PrismaNeon({ connectionString })

// Factory function to create new client
const createClient = () => new PrismaClient({ adapter })

// --- SINGLETON PATTERN: Prevent connection exhaustion ---
// Why? Next.js hot-reloads modules during development, which would create
// multiple PrismaClient instances. Each instance opens DB connections.
// Too many connections = "FATAL: too many connections" error.
// Solution: Reuse single global instance in development.

let prisma

if (process.env.NODE_ENV === 'development') {
  // Persist across hot reloads using globalThis
  if (!globalThis.__prisma) {
    globalThis.__prisma = createClient()
  }
  prisma = globalThis.__prisma
} else {
  // In production, create fresh instance
  prisma = createClient()
}

export default prisma
```

**Critical notes:**
- ✅ `adapter: new PrismaNeon()` - Required for Prisma v7 with serverless
- ✅ `neonConfig.webSocketConstructor = ws` - Required for Node.js environments
- ✅ Singleton pattern prevents connection exhaustion

### Step 8: Generate Prisma Client

```bash
npx prisma generate
```

Output: `src/generated/prisma/client.ts`

### Step 9: Create Database & Run Migrations

```bash
# Create tables in database
npx prisma migrate dev --name init
```

This will:
1. Create the migration file
2. Apply it to your Neon database
3. Regenerate Prisma client

### Step 10: Create API Route

Create `app/api/users/route.js`:

```javascript
// app/api/users/route.js
import prisma from '../../../lib/prisma'

// GET: Fetch all users
export async function GET() {
  const users = await prisma.user.findMany()
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

// POST: Create a new user
export async function POST(req) {
  const body = await req.json()

  // Validate email is provided
  if (!body.email) {
    return new Response(
      JSON.stringify({ error: 'email required' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    )
  }

  // Create user in database
  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name || null,
    },
  })

  return new Response(JSON.stringify(user), {
    status: 201,
    headers: { 'content-type': 'application/json' },
  })
}
```

---

## 📁 Project Structure

```
neon-prisma/
├── app/
│   ├── api/
│   │   └── users/
│   │       └── route.js              # 👈 API endpoints
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── lib/
│   └── prisma.js                     # 👈 Singleton client
│
├── prisma/
│   ├── schema.prisma                 # 👈 Database schema
│   └── migrations/                   # Auto-generated migrations
│
├── src/
│   └── generated/
│       └── prisma/                   # 👈 Generated Prisma client
│           ├── client.ts
│           ├── models.ts
│           ├── index.ts
│           └── ...
│
├── .env.local                        # 👈 Database URL (git-ignored)
├── prisma.config.mjs                 # 👈 Prisma configuration
├── next.config.mjs                   # Next.js configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

---

## 🔑 Key Files Explained

### `prisma/schema.prisma`
Defines your entire database structure. Prisma uses this as the source of truth.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"  # Custom output location
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String   @id @default(cuid())  # Auto-generate ID
  email     String   @unique                # Can't have duplicates
  name      String?                         # Optional field (nullable)
  createdAt DateTime @default(now())       # Auto-set timestamp
}
```

### `lib/prisma.js`
**Most critical file!** Exports a singleton Prisma client.

- **Why singleton?** Prevents connection pool exhaustion during Next.js hot reload
- **Why adapter?** Neon adapter handles serverless connection pooling
- **Why WebSocket?** Required for Node.js serverless environments

### `app/api/users/route.js`
Next.js API route. Handles HTTP requests.

```javascript
// Import the singleton (same instance everywhere)
import prisma from '../../../lib/prisma'

// HTTP GET handler
export async function GET() {
  const users = await prisma.user.findMany()
  return new Response(JSON.stringify(users), { status: 200 })
}

// HTTP POST handler
export async function POST(req) {
  const body = await req.json()
  const user = await prisma.user.create({ data: body })
  return new Response(JSON.stringify(user), { status: 201 })
}
```

### `.env.local`
Store sensitive credentials. **Never commit to git.**

```bash
# Pooled connection (recommended for production/serverless)
DATABASE_URL="postgresql://..."

# Optional: Direct connection for migrations
DIRECT_URL="postgresql://..."
```

---

## 🔄 Database Operations

### Common Prisma Queries

```javascript
import prisma from '@/lib/prisma'

// READ: Get all users
const users = await prisma.user.findMany()

// READ: Get one user
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
})

// CREATE: Add new user
const newUser = await prisma.user.create({
  data: {
    email: 'jane@example.com',
    name: 'Jane Doe'
  }
})

// UPDATE: Modify user
const updated = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Updated Name' }
})

// DELETE: Remove user
const deleted = await prisma.user.delete({
  where: { id: 'user-id' }
})
```

### Schema Changes Workflow

When you update `schema.prisma`:

```bash
# 1. Create migration with descriptive name
npx prisma migrate dev --name add_email_verified_field

# 2. Prisma will:
#    - Detect schema changes
#    - Generate migration file
#    - Apply to database
#    - Regenerate client

# 3. Test your app
npm run dev
```

### Reset Development Database

If database gets corrupted or out of sync:

```bash
# WARNING: This deletes all data in dev database!
npx prisma migrate reset
```

---

## 🧪 Testing the API

### Start the Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Test GET Request

```bash
curl http://localhost:3000/api/users
```

**Response:**
```json
[]  // Empty array if no users yet
```

### Test POST Request

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

**Response:**
```json
{
  "id": "clk1abc2def3ghi4jkl5m6n7o",
  "email": "test@example.com",
  "name": "Test User",
  "createdAt": "2024-01-17T10:30:00.000Z"
}
```

### Using Prisma Studio

Visualize and edit database data:

```bash
npx prisma studio
```

Opens browser at `http://localhost:5555`

---

## 🌱 Optional: Seed Your Database

Create `prisma/seed.js`:

```javascript
import prisma from '../lib/prisma.js'

async function main() {
  console.log('🌱 Seeding database...')

  const user = await prisma.user.create({
    data: {
      email: 'seed@example.com',
      name: 'Seed User'
    }
  })

  console.log(`✅ Created user: ${user.email}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `package.json`:

```json
{
  "scripts": {
    "seed": "node prisma/seed.js"
  }
}
```

Run:

```bash
npm run seed
```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial setup"
git push
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variable: `DATABASE_URL` (from Neon)

3. **Deploy:**
```bash
# Vercel auto-deploys on push
```

### Deploy to Other Platforms

Works with:
- **Heroku** - Set `DATABASE_URL` in config vars
- **Railway** - Connect Neon database, set env vars
- **Fly.io** - Add secrets via Fly CLI
- **AWS Lambda** - Use with API Gateway

**Key requirement:** Set `DATABASE_URL` environment variable pointing to your Neon database.

---

## ❌ Troubleshooting

### Error: "Module not found: Can't resolve '../../lib/prisma'"

**Cause:** Wrong import path from API route

**Fix:** Import path must have correct number of `../` based on file location:

```
API Route: app/api/users/route.js
Prisma:   lib/prisma.js

Path: ../../../lib/prisma  ✅ (3 levels up)
```

---

### Error: "FATAL: too many connections"

**Cause:** Multiple PrismaClient instances created

**Fix:** Ensure singleton pattern in `lib/prisma.js`:

```javascript
if (process.env.NODE_ENV === 'development') {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createClient()
  }
  prisma = globalThis.__prisma
}
```

---

### Error: "PrismaClient requires adapter or accelerateUrl"

**Cause:** Prisma v7 needs adapter for serverless

**Fix:** Ensure adapter is configured in `lib/prisma.js`:

```javascript
const adapter = new PrismaNeon({ connectionString })
const createClient = () => new PrismaClient({ adapter })
```

---

### Error: "Could not find Generated client"

**Cause:** Client not generated yet

**Fix:**
```bash
npx prisma generate
```

---

### Error: "Cannot find module 'ws'"

**Cause:** Missing WebSocket dependency

**Fix:**
```bash
npm install ws
npm install -D bufferutil  # Optional, prevents warnings
```

---

### Database Not Connecting

1. **Verify connection string:**
   ```bash
   echo $DATABASE_URL  # Check it's set
   ```

2. **Test connection:**
   ```bash
   npx prisma db execute --stdin
   SELECT 1;  # Type this, press Enter twice
   ```

3. **Check Neon dashboard:**
   - Verify database is active
   - Confirm IP whitelist (Neon allows all by default)
   - Check credentials

---

## 🎯 Common Patterns

### Validation in API Routes

```javascript
export async function POST(req) {
  const body = await req.json()

  // Validate input
  if (!body.email || typeof body.email !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Invalid email' }),
      { status: 400 }
    )
  }

  // Check if already exists
  const existing = await prisma.user.findUnique({
    where: { email: body.email }
  })

  if (existing) {
    return new Response(
      JSON.stringify({ error: 'Email already registered' }),
      { status: 409 }
    )
  }

  // Create user
  const user = await prisma.user.create({
    data: { email: body.email }
  })

  return new Response(JSON.stringify(user), { status: 201 })
}
```

### Error Handling

```javascript
export async function GET() {
  try {
    const users = await prisma.user.findMany()
    return new Response(JSON.stringify(users), { status: 200 })
  } catch (error) {
    console.error('Database error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    )
  }
}
```

### Filtering & Sorting

```javascript
// Get only verified users, sorted by creation date
const users = await prisma.user.findMany({
  where: {
    email: { endsWith: '@company.com' }
  },
  orderBy: { createdAt: 'desc' },
  take: 10  // Limit to 10 results
})
```

---

## 📚 Resources

| Topic | Link |
|-------|------|
| Prisma Docs | [pris.ly/docs](https://pris.ly/docs) |
| Neon Docs | [neon.tech/docs](https://neon.tech/docs) |
| Next.js App Router | [nextjs.org/docs/app](https://nextjs.org/docs/app) |
| Prisma Adapter Neon | [github.com/prisma/adapter-neon](https://github.com/prisma/adapter-neon) |

---

## ✨ Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Generate Prisma client | `npx prisma generate` |
| Create migration | `npx prisma migrate dev --name <name>` |
| Reset database | `npx prisma migrate reset` |
| View data | `npx prisma studio` |
| Build for production | `npm run build` |
| Start production server | `npm start` |

---

## 🎓 Learning Path

1. **Understand the setup** - Read this README top to bottom
2. **Modify the schema** - Add a new field to User model
3. **Create new API routes** - Add POST/DELETE endpoints
4. **Deploy** - Push to Vercel/Railway
5. **Scale** - Add more models and relationships

---

## 📝 License

MIT - Use freely for personal and commercial projects.

---

**Last Updated:** January 2025  
**Prisma Version:** v7.2.0  
**Next.js Version:** 16.1.3