# Next.js + Mongoose Boilerplate (App Router, TypeScript)

A pragmatic starter focused on clarity and DX:

- App Router with NextAuth (Credentials) ready
- Mongoose connection helpers (public/private wrappers, transactions)
- Zod validation (query/params) with consistent JSON errors
- Generic pagination utilities reusable across models
- Clean import order, minimal examples, sensible .gitignore

## Requirements

- **Node.js**: 20.x LTS (recommended) or 24.10.0 (tested)
- **npm**: 10.x (with Node 20) or 11.6.1 (tested)

Notes:

- Confirmed working on Node 24.10.0 with npm 11.6.1. If you hit issues on 24.x, switch to Node 20 LTS.
- Suggested with nvm:

```bash
nvm install 20
nvm use 20
```

## Quick start

1. Install

```bash
npm i
```

2. Configure env
   Copy `.env.example` → `.env.local` and set:

- `MONGODB_URI` — Mongo connection string
- `NEXTAUTH_SECRET` — any random string for JWT

Example local MongoDB URIs:

```bash
# Local MongoDB without auth
MONGODB_URI=mongodb://127.0.0.1:27017/ettanfotboll?directConnection=true

# Local MongoDB with Docker (default mongo image)
# docker run -p 27017:27017 --name mongo -d mongo:7
MONGODB_URI=mongodb://127.0.0.1:27017/ettanfotboll?directConnection=true

# Local MongoDB with auth (if you started with MONGO_INITDB_ROOT_USERNAME/PASSWORD)
# docker run -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=example -p 27017:27017 -d mongo:7
MONGODB_URI=mongodb://root:example@127.0.0.1:27017/ettanfotboll?authSource=admin&directConnection=true
```

3. Dev

```bash
npm run dev
```

App: `http://localhost:3000`

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run type-check` — TypeScript check

## Key folders

- `app/` — App Router routes (API + pages)
- `lib/` — framework-agnostic helpers (db wrappers, errors, pagination, auth)
- `models/` — Mongoose models (example: `User`, `AuditLog`)
- `services/` — domain logic (example: `UserService`)
- `validations/` — Zod schemas (e.g., `pagination`, `params`)

## Auth (NextAuth)

- Credentials provider only (lean boilerplate)
- Customize in `lib/auth.ts`
- API route: `app/api/auth/[...nextauth]/route.ts`

## Database helpers

```ts
// Public (no auth check)
import { withDb } from "@/lib/with-db";
export const GET = withDb(async () => {
  /* ... */
});

// Private (requires session)
import { withPrivateDb } from "@/lib/with-db";
export const POST = withPrivateDb(async (req) => {
  /* ... */
});
```

- Both ensure `connectToDatabase()` before your handler
- Private wrapper returns JSON errors if auth fails

## Error format

All errors shape consistently as:

```json
{
  "ok": false,
  "error": { "code": "STRING_CODE", "message": "Human message", "details": [] }
}
```

See `lib/error-handler.ts`.

## Validation

Use Zod directly — we let Zod throw and format errors centrally.

```ts
import { objectIdParamSchema } from "@/validations/params";
const { id } = objectIdParamSchema.parse(context.params);
```

For query params:

```ts
import { paginationSchema } from "@/validations/pagination";
import { parseQuery } from "@/lib/parse-query";
const query = parseQuery(request.url, paginationSchema);
```

## Pagination (generic)

```ts
import { paginate } from "@/lib/paginate";
const result = await paginate<YourDoc>(YourModel, { page: 1, limit: 10 });
// { data, pagination: { page, limit, total, totalPages, hasNext, hasPrev }}
```

Helpers in `lib/pagination.ts`.

## Transactions

```ts
import { runInTransaction } from "@/lib/with-transaction";
await runInTransaction(async (session) => {
  // pass { session } to all writes
});
```

## Examples included

- API routes: `app/api/users` (paginated) and `app/api/users/[id]` (by id)
- Service: `services/UserService.ts` (get by id, paginated)
- Models: `models/User.ts`, `models/AuditLog.ts`

## Conventions

- Third‑party imports first, then local, separated by a blank line
- Keep HTTP handlers thin; move logic to `services/`
- Prefer explicit JSON responses and typed Zod schemas
