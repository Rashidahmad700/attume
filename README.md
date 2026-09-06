# attume — Phase 1

Luxury fragrance e-commerce. Two apps, one repo folder.

```
attume/
├── backend/          Express + TypeScript + MongoDB (Mongoose) API
└── frontend/         Next.js 15 App Router + TS + Tailwind v4 + Redux Toolkit
```

## Backend — `/backend`

```
src/
├── config/           env.ts (zod-validated process.env), db.ts (mongoose connect)
├── controllers/      auth.controller.ts — signup, login, logout, refresh, me
├── middleware/       auth (JWT guard), validate (zod), error (central handler), rateLimit
├── models/           user.model.ts — name, email, password hash, phone, addresses[], role
├── routes/           index.ts (/health + mounts), auth.routes.ts
├── utils/            ApiError, asyncHandler, tokens (sign/verify + cookie helpers)
├── validators/       auth.validator.ts — zod schemas
├── app.ts            helmet, cors(credentials), json, cookie-parser, routes, error handlers
└── server.ts         connect DB, listen, graceful shutdown
```

Endpoints (base `/api/v1`):

| Method | Path                  | Auth | Purpose                              |
| ------ | --------------------- | ---- | ------------------------------------ |
| GET    | `/health`             | –    | Liveness                             |
| POST   | `/auth/signup`        | –    | Create account, sets both cookies    |
| POST   | `/auth/login`         | –    | Sign in, sets both cookies           |
| POST   | `/auth/logout`        | –    | Clears cookies                       |
| POST   | `/auth/refresh-token` | cookie | Rotates access + refresh cookies   |
| GET    | `/auth/me`            | cookie | Current user                       |

Auth model: `attume_access` (15m) + `attume_refresh` (30d), both httpOnly. Passwords bcrypt-hashed
(cost 12) in a `pre('save')` hook; `password` is `select: false` so it never leaks through `toJSON`.

Run:

```bash
cd backend
cp .env.example .env      # fill MONGODB_URI + both JWT secrets
npm install
npm run dev               # http://localhost:5000
```

## Frontend — `/frontend`

```
src/
├── app/
│   ├── layout.tsx           fonts, Providers, AnnouncementBar, Header, Footer
│   ├── page.tsx             Hero → Marquee → Featured → BrandStatement → Instagram
│   ├── globals.css          Tailwind v4 @theme design tokens
│   ├── (auth)/              split-screen auth layout + login/ + signup/
│   └── account/             minimal signed-in shell
├── components/
│   ├── layout/              AnnouncementBar, Header, MobileNav, Footer, Newsletter, Logo
│   ├── home/                Hero, Marquee, FeaturedProducts, ProductCard, BrandStatement, InstagramFeed
│   ├── ui/                  Button, Input, Container, SectionHeading, icons
│   └── providers/           StoreProvider, AuthBootstrap
├── store/
│   ├── index.ts             configureStore (api + auth + ui)
│   ├── hooks.ts             typed useAppDispatch / useAppSelector
│   ├── api/                 baseApi (401 → refresh → replay), authApi, mutex
│   └── slices/              authSlice, uiSlice
├── lib/                     site config, placeholder products, cn, apiError parser
└── types/                   shared API + domain types
```

Session persistence: cookies are httpOnly, so `AuthBootstrap` fires `/auth/me` once on mount and the
`authSlice` hydrates from it. A 401 on any request triggers a single serialised refresh, then the
original request replays; a failed refresh dispatches `auth/sessionExpired`.

Run:

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm install
npm run dev                  # http://localhost:3000
```

## Design tokens

| Token       | Value     | Use                          |
| ----------- | --------- | ---------------------------- |
| `ivory`     | `#f7f3e3` | Page ground (packaging cream)|
| `ivory-deep`| `#efe9d4` | Hero / section contrast      |
| `ink`       | `#171613` | Text, header footer ground   |
| `espresso`  | `#4e2a2a` | Accent headline, errors      |
| `olive`     | `#4f5a20` | Brand accent, hover states   |
| `bronze`    | `#a98b5d` | Eyebrows, small accents      |
| `line`      | `#ddd5bd` | Hairline borders             |

Type: Cormorant Garamond (display serif) + Jost (sans). Uppercase `.eyebrow` at 0.18em tracking,
square corners everywhere, hairline rules instead of cards.

## Not in Phase 1

Payments, shipping, transactional email, real product/cart/order models, live Instagram API,
password reset, admin. The Instagram grid and the product grid read from local placeholder data
and swap to real fetches without markup changes.
