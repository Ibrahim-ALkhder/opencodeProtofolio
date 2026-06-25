# Ibrahim | Full Stack Developer Portfolio

Personal portfolio website showcasing projects, certificates, and skills. Built with React, Node.js/Express, and JSON file storage.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 7, Tailwind CSS, Framer Motion, Vite |
| Backend | Node.js, Express |
| Storage | JSON files (admin CRUD via REST API) |
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
│   ├── data/              # JSON storage files (gitignored)
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
VITE_API_URL=http://localhost:3001/api
```

**Backend** — create `./server/.env`:

```
PORT=3001
CORS_ORIGIN=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
JWT_SECRET=generate-a-random-secret-here
```

> Copy from `.env.example` files. The backend will refuse to start if `JWT_SECRET`, `ADMIN_USERNAME`, or `ADMIN_PASSWORD` are not set.

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

1. Push to GitHub
2. Create a **Web Service** on Render
3. Set **Root Directory** to `server`
4. Build command: `cd .. && npm install && npm run build`
5. Start command: `node index.js`
6. Add environment variables in Render dashboard:

| Variable | Description |
|----------|-------------|
| `PORT` | Set by Render automatically |
| `CORS_ORIGIN` | Your Render frontend URL (e.g., `https://myapp.onrender.com`) |
| `ADMIN_USERNAME` | Admin panel username |
| `ADMIN_PASSWORD` | Admin panel password (strong) |
| `JWT_SECRET` | Random hex string for JWT signing |

### Admin Panel

After deploy, visit `/admin` and log in with the credentials set in environment variables. Use the panel to manage projects, certificates, and CV uploads.

The frontend includes static fallback data, so the portfolio displays content even before adding data through the admin panel.

## License

Private — All rights reserved.
