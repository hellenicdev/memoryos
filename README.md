# MemoryOS

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/S6S31XB030)

A personal "second brain": capture memories, organise them into projects, browse them on a timeline and as a knowledge graph, and chat with an AI assistant that knows your notes.

**Live:** https://hellenicdev.eu/memoryos/

## Features

- **Memories:** create, search and tag notes, with importance scoring
- **Projects:** group memories and tasks into projects
- **Timeline:** a chronological view of your activity
- **Knowledge graph:** an interactive force-directed graph of how your memories relate
- **AI chat:** ask questions about your memories (Groq LLM)
- **Files:** upload attachments, with file-type validation
- Notifications, settings, and plans/billing UI
- JWT auth, protected by Cloudflare Turnstile
- Helmet, CORS allow-list, rate limiting and compression on the API
- Cookie-consent banner, responsive layout and a mobile navbar

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Framer Motion, lucide-react, react-force-graph-2d, Axios
- **Backend:** Node.js, Express, TypeScript, Mongoose, Helmet, Multer
- **Database:** MongoDB
- **AI:** Groq API
- **Hosting:** GitHub Pages (frontend, `gh-pages` branch), Render (API)

## Setup

```bash
git clone https://github.com/hellenicdev/memoryos.git
cd memoryos

# Frontend
npm install
npm run dev        # Vite dev server
npm run build      # type-check + production build
npm run lint       # oxlint

# Backend
cd backend
npm install
npm run dev
```

### Environment variables

**Frontend** (`.env` / `.env.production`):

| Name | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the backend API |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |

**Backend:**

| Name | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `GROQ_API_KEY` | Groq API key for AI chat |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `ALLOWED_ORIGINS` | Optional comma-separated CORS origins (replaces the defaults) |
| `FRONTEND_URL` | Optional extra CORS origin added to the defaults (ignored when `ALLOWED_ORIGINS` is set) |
| `PORT` | HTTP port (default 5000) |

## Project structure

```
├── src/                  # React frontend
│   ├── pages/            # Dashboard, Memories, Projects, Timeline, AI chat…
│   ├── components/       # UI components (cards, navbars, modals, toasts…)
│   ├── context/          # Auth context
│   ├── services/api.ts   # Axios API client
│   └── styles/
├── public/
├── scripts/postbuild.cjs # gh-pages SPA fallback
└── backend/
    ├── src/
    │   ├── server.ts     # Express entry point
    │   ├── routes/       # auth, memories, projects, ai, files, timeline…
    │   ├── controllers/
    │   ├── models/       # Mongoose models
    │   ├── middleware/   # auth, rate limit, uploads, errors
    │   ├── services/     # AI, search, importance, files, Turnstile
    │   └── config/       # DB, CORS, uploads
    └── test/
```

## License

All rights reserved © HellenicDev.

---

Made by [HellenicDev](https://hellenicdev.eu).
