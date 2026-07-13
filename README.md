# Flash-Sale Frontend (Angular)

Lightweight Angular SPA for a ticket flash-sale — a client for `sale-service` (:8080).
It visualizes Self-Redis ephemeral state: holds with TTL, 201/409 counters, hit-rate,
and the 429/410/409 codes. All business logic lives on the backend; the frontend only
displays it.

Stack: Angular 20 (standalone + signals), provideRouter (lazy), HttpClient +
functional interceptors. No NgRx / no UI kits. Styling — plain CSS.

Docs: `flash-sale-frontend-claude-plan.txt`, `flash-sale-frontend-claude-todo-list.txt`
(written in Ukrainian).

## Prerequisites

- Node LTS (tested on v20), npm.
- A running `sale-service` backend on :8080 (+ Postgres :5432, Self-Redis :8840)
  for real data. Without it the UI still boots, but requests return errors.

## Run (dev)

```bash
npm install        # if not installed yet
npm start          # = ng serve; the /api -> :8080 proxy is already configured
```

Open `http://localhost:4200/`. Requests go to `/api/*` and are proxied to
`http://localhost:8080` (see `proxy.conf.json`) — this works around the missing CORS.

## Check (FE-0 smoke)

On the home page (Catalog) there is a "Connectivity check" block: enter an Event ID and
click "Check" — this is a GET /events/:id through the proxy. Success -> green toast + JSON;
error (e.g. 404) -> toast via error.interceptor. The X-User-Id switcher in the header
changes the header sent with /orders requests.

## Structure

```
src/app/
  core/       api.service, user.service, toast.service, models,
              interceptors/ (user-id, error)
  features/   catalog, event-detail, orders, admin, demo   (lazy routes)
  shared/     user-switcher, toaster
  app.ts, app.config.ts, app.routes.ts
proxy.conf.json     dev proxy /api -> :8080 (apiBaseUrl='/api' hardcoded in ApiService)
```

## Commands

```bash
npm start     # dev server with proxy
npm run build # production build
npm test      # unit tests (Karma/Jasmine)
```
