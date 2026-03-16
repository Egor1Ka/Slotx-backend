# BackendTemplate — Claude Code Guide

## Stack

- **Runtime:** Node.js (ES modules, `"type": "module"`)
- **Framework:** Express 5
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + OAuth 2.0 (cookie-based)
- **Functional utils:** Ramda

## Project Structure

```
src/
├── app.js                        — Express entry point
├── db.js                         — MongoDB connection
├── constants/validation.js       — Regex patterns (RE_EMAIL, RE_PHONE)
├── models/                       — Mongoose schemas (User, RefreshToken)
├── repository/                   — DB access layer (raw Mongoose calls only)
├── services/                     — Business logic (userServices, authServices)
├── controllers/                  — HTTP handlers (userController, authController)
├── middleware/auth.js            — JWT verification (Bearer header OR cookie)
├── routes/
│   ├── routes.js                 — Main router
│   └── subroutes/                — userRoutes, authRoutes
├── providers/auth/               — OAuth provider HTTP integrations (one file per provider)
│   ├── google.js
│   └── index.js                  — Provider registry: PROVIDERS = { google, ... }
├── dto/                          — Response shape transformers
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
