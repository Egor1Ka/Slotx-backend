# BackendTemplate — Claude Code Guide

## Stack

- **Runtime:** Node.js (ES modules, `"type": "module"`)
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + OAuth 2.0 (cookie-based)
- **Billing:** creem.io (Merchant of Record) + creem SDK
- **Functional utils:** Ramda

## Project Structure

```
src/
├── app.js                        — Express entry point
├── db.js                         — MongoDB connection
├── constants/
│   ├── validation.js             — Regex patterns (RE_EMAIL, RE_PHONE)
│   └── billing.js                — Plans, products, statuses, webhook map
├── models/                       — Mongoose schemas (User, RefreshToken, Subscription, Payment)
├── repository/                   — DB access layer (raw Mongoose calls only)
├── services/                     — Business logic (userServices, authServices, billingServices, planServices)
│   └── billing/hooks.js          — Product lifecycle hooks (onActivate, onDeactivate, onRenew)
├── controllers/                  — HTTP handlers (userController, authController, billingController)
├── middleware/
│   ├── auth.js                   — JWT verification (Bearer header OR cookie)
│   └── plan.js                   — Plan/feature checking (requireFeature, requirePlan, attachPlan)
├── routes/
│   ├── routes.js                 — Main router
│   └── subroutes/                — userRoutes, authRoutes, billingRoutes
├── providers/
│   ├── auth/                     — OAuth provider integrations (google.js + index.js)
│   └── billing/                  — Billing provider integrations (creem.js + index.js)
├── dto/                          — Response shape transformers (userDto, billingDto)
└── utils/
    ├── fp.js                     — asyncPipe, pipe (Ramda)
    ├── cookieOptions.js          — Cookie config + parseDurationMs
    ├── http/                     — httpResponse, httpError, httpStatus, httpUtils
    └── validation/               — Schema validation engine
```

## Auth Module

### How it works

OAuth flow (Google as example):

```
GET /api/auth/google
  → createOauthState() → set state cookie → redirect to Google

GET /api/auth/google/callback?code=...&state=...
  → validate state (CSRF) → exchangeCode → getProfile
  → findOrCreateUser → createSession
  → set accessToken + refreshToken cookies → redirect to FRONTEND_URL

POST /api/auth/refresh
  → read refreshToken cookie → validate in DB → createAccessToken
  → set new accessToken cookie → return { accessToken }

POST /api/auth/logout
  → delete refreshToken from DB → clear cookies → 200
```

### File responsibilities

| File | Responsibility |
|------|----------------|
| `src/providers/auth/google.js` | HTTP calls to Google API — buildAuthUrl, exchangeCode, getProfile |
| `src/providers/auth/index.js` | Provider registry — `PROVIDERS = { google }` |
| `src/models/RefreshToken.js` | Mongoose schema — token, userId, provider, providerUserId, expiresAt |
| `src/repository/refreshTokenRepository.js` | DB access for RefreshToken |
| `src/services/authServices.js` | JWT creation/verification, OAuth state, findOrCreateUser, createSession |
| `src/controllers/authController.js` | HTTP handlers — login, callback, refresh, logout |
| `src/routes/subroutes/authRoutes.js` | Route definitions for /auth/* |
| `src/middleware/auth.js` | JWT verification — reads from Bearer header OR accessToken cookie |
| `src/utils/cookieOptions.js` | Cookie options + parseDurationMs |

### Provider contract

Every provider must export an object with these 3 functions:

```js
{
  buildProviderAuthUrl(state)   → String   // redirect URL for the user
  exchangeProviderCode(code)    → Object   // raw token response from provider
  getProviderProfile(tokens)    → {        // normalized profile — always this shape
    providerUserId: String,
    email: String,
    name: String,
    avatar: String,
  }
}
```

### How to add a new provider

Используй скилл `/add-auth-provider` — он проведёт по всем шагам.

## Billing Module

### How it works

Billing is powered by creem.io (Merchant of Record). Creem handles recurring payments, taxes, and compliance. We react to webhooks.

```
Frontend creates checkout → user pays on creem.io hosted page

POST /api/billing/webhook (creem sends webhooks)
  → verify HMAC signature → route by event_type
  → checkout.completed: find user by email → create Payment + Subscription → run onActivate hook
  → subscription.paid: update Subscription status → create Payment → run onRenew hook
  → subscription.canceled/expired: update status → run onDeactivate hook
```

### Architecture: State Machine + Product Hooks

Two layers:
1. **State machine** — generic webhook processing, updates Subscription status in DB
2. **Product hooks** — per-plan business logic in `src/services/billing/hooks.js`

### File responsibilities

| File | Responsibility |
|------|----------------|
| `src/constants/billing.js` | PLANS, PRODUCT_PLANS, PLAN_HIERARCHY, WEBHOOK_EVENT, statuses, WEBHOOK_STATUS_MAP |
| `src/models/Subscription.js` | Current subscription state (mutable, one per user) |
| `src/models/Payment.js` | Payment history (append-only, idempotent via creemEventId) |
| `src/repository/subscriptionRepository.js` | DB operations for Subscription |
| `src/repository/paymentRepository.js` | DB operations for Payment |
| `src/providers/billing/creem.js` | creem SDK wrapper + HMAC signature verification |
| `src/providers/billing/index.js` | Billing provider registry |
| `src/services/billingServices.js` | Webhook event processing, state transitions |
| `src/services/planServices.js` | Plan resolution (pure functions + DB orchestrators) |
| `src/services/billing/hooks.js` | Product lifecycle hooks (onActivate, onDeactivate, onRenew) |
| `src/controllers/billingController.js` | Webhook endpoint handler |
| `src/routes/subroutes/billingRoutes.js` | POST /billing/webhook |
| `src/middleware/plan.js` | requireFeature(), requirePlan(), attachPlan() |
| `src/dto/billingDto.js` | Subscription/Payment DTO transforms |

### How to add a new product

Используй скилл `/add-billing-product` — он проведёт по всем шагам.

### Plan middleware usage

```js
import { requireFeature, requirePlan, attachPlan } from "../middleware/plan.js";

router.get("/export", authMiddleware, requireFeature("export"), handleExport);
router.get("/dashboard", authMiddleware, attachPlan, handleDashboard);
// req.plan = { key: "pro", features: {...}, limits: {...} }
```

## HTTP Utilities

```js
// Send response
httpResponse(res, generalStatus.SUCCESS, data)
httpResponse(res, generalStatus.UNAUTHORIZED)

// Send error
httpResponseError(res, error)  // handles HttpError, DomainError, or generic

// Status codes
generalStatus.SUCCESS       // 200
generalStatus.BAD_REQUEST   // 400
generalStatus.UNAUTHORIZED  // 401
generalStatus.NOT_FOUND     // 404
generalStatus.ERROR         // 500
```

## Code Rules

- `const` only, no `let`
- Named functions — no inline lambdas in map/filter/reduce
- Pure functions separated from side effects
- Guard clauses at caller level (not inside functions)
- Config objects instead of if/switch
- Ramda for composition (`R.pipe`, `R.curry`)
- Fetch Context7 docs before using any external library
