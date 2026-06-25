# Ibrahim | Full Stack Developer Portfolio

Personal portfolio website showcasing projects, certificates, and skills. Built with React, Node.js/Express, and SQLite (via libSQL/Turso).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 7, Tailwind CSS, Framer Motion, Vite |
| Backend | Node.js, Express |
| Database | SQLite via libSQL (local dev) / Turso (production) |
| Auth | JWT (admin panel) |

## Project Structure

```
/
├── src/                   # React frontend source
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route pages (Home, Projects, Admin, etc.)
│   ├── data/              # API client & static fallback data
│   └── hooks/             # Custom React hooks
├── server/                # Express backend
│   ├── routes/            # API route handlers (auth, projects, certificates, cv)
│   ├── db.js              # Database client & schema initialization
│   ├── data/              # Local SQLite database file (gitignored)
│   └── uploads/           # CV upload directory
├── public/                # Static assets
├── dist/                  # Production build (gitignored)
├── .env                   # Frontend env vars (gitignored)
├── .env.example           # Frontend env template (committed)
├── server/.env            # Backend env vars (gitignored)
└── server/.env.example    # Backend env template (committed)
```

## Running Locally

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone <repo-url>
cd opencode

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment variables

**Frontend** — create `./.env`:

```
VITE_API_URL=/api
```

> For local dev, create `.env.local` with `VITE_API_URL=http://localhost:3001/api`

**Backend** — create `./server/.env`:

```
PORT=3001
CORS_ORIGIN=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
JWT_SECRET=generate-a-random-secret-here
```

> Copy from `.env.example` files. The backend will refuse to start if `JWT_SECRET`, `ADMIN_USERNAME`, or `ADMIN_PASSWORD` are not set.

By default, the server uses a local SQLite file at `server/data/portfolio.db`. No additional config needed for local development.

### 3. Start development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd opencode
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Admin panel: http://localhost:5173/admin

### 4. Production build

```bash
npm run build
```

The server automatically serves the built frontend at `dist/` when it exists.

## Deployment

### Deploy to Render (single service)

This project is configured for Render as a single Web Service. The backend serves both the API and the built frontend static files.

**Build command on Render:** `npm run build`
**Start command:** `node index.js`
**Root directory:** `server`

The build script installs frontend dependencies and builds the React app into `../dist`.

### Environment variables for Render

| Variable | Required | Description |
|----------|----------|-------------|
| `CORS_ORIGIN` | Yes | Your Render frontend URL (e.g., `https://myapp.onrender.com`) |
| `ADMIN_USERNAME` | Yes | Admin panel login |
| `ADMIN_PASSWORD` | Yes | Admin panel password (strong) |
| `JWT_SECRET` | Yes | Random hex string for JWT signing |
| `TURSO_DATABASE_URL` | No | Turso remote DB URL (for persistent storage) |
| `TURSO_AUTH_TOKEN` | No | Turso auth token (required with TURSO_DATABASE_URL) |

### ⚠️ Render free tier: data persistence warning

**Render's free tier does not provide a persistent disk.** The local SQLite file (`server/data/portfolio.db`) will be **deleted every time the service restarts** (deploys, crashes, or Render's weekly recycle).

**For persistent data in production, you have two options:**

#### Option A: Turso (recommended — free tier available)

1. [Sign up for Turso](https://turso.tech) and create a database
2. Install the Turso CLI and authenticate
3. Get your database URL and auth token
4. Set these environment variables on Render:

```
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=eyJ...
```

With Turso set, the server ignores the local SQLite file and connects to Turso's edge database. Data survives all restarts.

#### Option B: Render Disk ($9/month)

1. Add a Render Disk to your Web Service
2. Mount it at a path like `/opt/render/data`
3. Set env var: `TURSO_DATABASE_URL=file:/opt/render/data/portfolio.db`
4. Data persists across restarts (but not across region migrations)

### Admin Panel

After deploy, visit `/admin` and log in with the credentials set in environment variables. Use the panel to manage projects, certificates, and CV uploads.

The frontend includes static fallback data, so the portfolio displays content even before adding data through the admin panel.

## Migrating from JSON files

If you had existing data in `server/data/*.json`, run:

```bash
cd server
node migrate-json-to-db.js
```

This one-time script reads the old JSON files and inserts the data into SQLite.

## License

Private — All rights reserved.
