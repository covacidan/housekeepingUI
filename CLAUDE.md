# CLAUDE.md — housekeepingUI

React frontend for the housekeeping water-index application.

**Stack:** React 19, Vite 5, Bootstrap 5, Recharts, Keycloak-JS (PKCE), Nginx, Docker

---

## Commands

```bash
# Install dependencies
npm install

# Dev server (proxies /api → 192.168.1.127:8081 — update vite.config.js for local dev)
npm run dev

# Run tests (Vitest + Testing Library)
npm test

# Watch mode
npm run test:watch

# Production build
npm run build

# Preview production build
npm run preview

# Docker build
docker build -t housekeeping-ui:latest .

# Docker compose (requires external housekeeping_net)
docker-compose up -d
```

---

## Source Structure

```
src/
├── main.jsx              Entry point — Keycloak init, token extraction, app mount
├── App.jsx               Router setup, layout wrapper, role-based home redirect
├── keycloak.js           Keycloak client config (PKCE, housekeeping realm)
├── components/
│   ├── NavBar.jsx        Top navigation
│   └── PrivateRoute.jsx  Route guard — checks localStorage token + role
├── pages/
│   ├── MonthlyConsumption.jsx  Admin dashboard: line chart + table (Recharts)
│   ├── LastMonthDelta.jsx      Previous month delta view (read-only)
│   ├── AddRecord.jsx           Form to submit new water index entry
│   └── UserManagement.jsx      Admin: Keycloak user CRUD
└── services/
    └── api.js            Axios client with JWT injection + auto-refresh interceptors
```

---

## Routes

| Route | Required Role | Purpose |
|-------|--------------|---------|
| `/login` | Public | Redirected to Keycloak (no local login page) |
| `/monthly` | ADMIN | Monthly consumption dashboard |
| `/delta` | RECORDER+ | Last-month delta |
| `/add` | RECORDER+ | New water index entry |
| `/users` | ADMIN | User management |

Home (`/`) redirects ADMIN → `/monthly`, others → `/delta`.

---

## Authentication

- **Keycloak PKCE flow** — no client secret; `login-required` on app load
- `main.jsx` initialises Keycloak, extracts JWT claims (role, email), stores to `localStorage`
- Token auto-refreshed 30 s before expiry via `keycloak.onTokenExpired`
- `services/api.js` injects `Authorization: Bearer <token>` on every Axios request
- 401 response → automatic logout and redirect to Keycloak login

**Environment variable:**
```
VITE_KEYCLOAK_URL   Keycloak base URL (default: http://localhost:8180)
```
Realm: `housekeeping` | Client ID: `housekeeping-ui`

---

## Production Serving (Nginx)

`nginx.conf` handles:
- SPA routing: all paths fall back to `/index.html`
- API reverse proxy: `/api/` → `http://api:8080/` (internal Docker DNS)

Keycloak is accessed directly by the browser — not proxied through Nginx.

---

## Tests

Location: `src/test/`

- `setup.js` — mocks `localStorage` for jsdom environment
- `PrivateRoute.test.jsx` — token/role-based access control tests

Test environment: jsdom (configured in `vite.config.js`).

---

## Dev Proxy

`vite.config.js` proxies `/api` to `http://192.168.1.127:8081` (hardcoded).  
Update this IP to point at your local API before running `npm run dev`.

---

## CI/CD — GitHub Actions

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

Triggers on push/PR to `main`.

Steps: Checkout → setup Node 22 → `npm ci` → `npm test --coverage` → SonarCloud analysis

**Required GitHub repository config:**
- Secret: `SONAR_TOKEN`
- Variables: `SONAR_ORGANIZATION`, `SONAR_PROJECT_KEY`

**Deploy manually** after CI passes: `docker compose up -d --build` from the repo root.
