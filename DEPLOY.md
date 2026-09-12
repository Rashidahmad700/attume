# Deploying for QA (free)

Three services, all on free tiers, no card required.

| Piece | Host | Free tier |
| --- | --- | --- |
| Database | MongoDB Atlas **M0** | 512MB, stays free |
| API | Render **free** web service | Sleeps after 15 min idle (~50s cold start) |
| Storefront | Vercel **Hobby** | One project |
| Admin | **Stays on your machine** | Not deployed — see below |

## The admin console is not deployed

Run it locally against the QA API:

```bash
cd admin
API_ORIGIN=https://<your-api>.onrender.com npm run dev
```

Because the app proxies `/api/v1` through itself, the admin cookie is set on
`localhost` and remains first-party, so sign-in works exactly as it does now.

This keeps the console off the public internet entirely while a client is
testing the storefront. Deploy it later, when someone other than you needs to
manage stock.

## Why the apps proxy the API

The browser never calls the API host directly. `next.config.ts` in both apps
rewrites `/api/v1/*` to `API_ORIGIN`, so the session cookie is set on the
storefront's own domain.

If the browser called `attume-api.onrender.com` from `attume.vercel.app`, that
cookie would be third-party — **Safari and Brave discard those by default**, so
sign-in would appear to work and then silently fail. The proxy avoids it without
buying a domain.

---

## 1. Database — MongoDB Atlas

1. Create a free **M0** cluster.
2. Database Access → add a user, save the password.
3. Network Access → allow `0.0.0.0/0` (Render's free plan has no fixed IP).
4. Copy the connection string; append the database name:
   `mongodb+srv://USER:PASS@cluster.mongodb.net/attume_qa?retryWrites=true&w=majority`

## 2. API — Render

1. New → Web Service → connect `Rashidahmad700/attume`.
2. Root directory `backend`, build `npm ci --include=dev && npm run build`, start `npm start`.
3. Environment variables:

   | Key | Value |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | the Atlas string from step 1 |
   | `CORS_ORIGINS` | both Vercel URLs, comma separated |
   | `STOREFRONT_URL` | the storefront Vercel URL |
   | `COOKIE_SECURE` | `true` |
   | `COOKIE_SAMESITE` | `lax` |
   | `JWT_ACCESS_SECRET` | generate — `openssl rand -base64 48` |
   | `JWT_REFRESH_SECRET` | generate, different value |
   | `ADMIN_JWT_ACCESS_SECRET` | generate, different value |
   | `ADMIN_JWT_REFRESH_SECRET` | generate, different value |

   All four secrets must differ. The admin pair is what stops a customer token
   from working against admin routes.

4. Health check path `/api/v1/health`.

`--include=dev` in the build command is not optional: `NODE_ENV=production`
makes npm skip devDependencies, and the TypeScript compiler needs `@types/node`
to build. Without it the deploy fails with `TS2688: Cannot find type definition
file for 'node'`.

`backend/render.yaml` describes all of this if you prefer a blueprint deploy.

## 3. Storefront — Vercel

One project, root directory `frontend`:

| Key | Value |
| --- | --- |
| `API_ORIGIN` | `https://attume-api.onrender.com` (no trailing slash, no `/api/v1`) |
| `NEXT_PUBLIC_API_URL` | `/api/v1` |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | `attume.official` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://www.instagram.com/attume.official` |

Then go back to Render and set `CORS_ORIGINS` to the Vercel URL, and
`STOREFRONT_URL` to the same value so sign-in links point at the right place.

## 4. Seed the QA database

Render's free plan has no shell, so run these from your machine pointed at Atlas:

```bash
cd backend
MONGODB_URI='<atlas string>' npm run seed-products
MONGODB_URI='<atlas string>' npm run create-admin -- \
  --email you@example.com --password 'choose a strong one'
```

Use a different admin password from the local one.

## 5. Check it

- `https://<api>/api/v1/health` → `{"success":true,...}`
- Storefront: browse, add to bag, sign up, place a COD order
- Admin (locally, against the QA API): sign in, change stock, move the order
  forward
- **Test in Safari as well as Chrome** — that is the browser the cookie proxy
  exists for

## Known limits on free tiers

- **Cold starts.** The API sleeps after 15 minutes idle; the next request takes
  roughly 50 seconds. Warn your client, or open the health URL a minute before
  a demo.
- **Vercel Hobby is non-commercial.** Fine for QA. A storefront taking real
  money needs Pro, or Cloudflare Pages, which permits commercial use free.
- **Atlas M0** has no automated backups.
- Email links print to the Render logs until `RESEND_API_KEY` is set.
- Product images live in `frontend/public`, so they deploy with the app. Real
  photography at scale wants object storage.
