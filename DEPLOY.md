# Deploying for QA (free)

Three services, all on free tiers, no card required.

| Piece | Host | Free tier |
| --- | --- | --- |
| Database | MongoDB Atlas **M0** | 512MB, stays free |
| API | Render **free** web service | Sleeps after 15 min idle (~50s cold start) |
| Storefront + Admin | Vercel **Hobby** | Two projects |

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
2. Root directory `backend`, build `npm ci && npm run build`, start `npm start`.
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

`backend/render.yaml` describes all of this if you prefer a blueprint deploy.

## 3. Storefront and Admin — Vercel

Two separate projects from the same repository.

**Storefront** — root directory `frontend`:

| Key | Value |
| --- | --- |
| `API_ORIGIN` | `https://attume-api.onrender.com` (no trailing slash, no `/api/v1`) |
| `NEXT_PUBLIC_API_URL` | `/api/v1` |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` | `attume.official` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://www.instagram.com/attume.official` |

**Admin** — root directory `admin`:

| Key | Value |
| --- | --- |
| `API_ORIGIN` | the same API URL |
| `NEXT_PUBLIC_API_URL` | `/api/v1` |

Then go back to Render and set `CORS_ORIGINS` to both Vercel URLs.

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
- Admin: sign in, change stock, move the order forward
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
