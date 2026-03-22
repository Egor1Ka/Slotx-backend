# Billing Integration Tests — Design Spec

## Goal

Integration tests for the billing module that verify the full webhook-to-database flow:

1. When `checkout.completed` arrives — user gets an active subscription
2. When `subscription.paid` arrives — existing subscription is renewed (not duplicated)
3. When `subscription.canceled` arrives — subscription becomes inactive

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Test runner | `node:test` (built-in) | Zero dependencies, project uses ES modules |
| Database | `mongodb-memory-server` | Real MongoDB queries, no Docker, isolated |
| Test level | HTTP integration (Express + Supertest-like) | Tests the real path: HTTP request → controller → service → DB |
| Signature verification | Mocked out | Focus on business logic, not crypto verification |
| Other mocks | None | Real DB, real services, real repositories, real hooks |

## Infrastructure

### Dependencies

```
mongodb-memory-server  — in-memory MongoDB instance
```

No test runner packages needed — `node:test` + `node:assert` are built-in.

### File Structure

```
src/modules/billing/
└── __tests__/
    ├── setup.js           — MongoMemoryServer lifecycle, Express app assembly
    ├── helpers.js          — webhook payload factories, HTTP helper, test user creation
    └── billing.test.js     — all test cases
```

### Setup Lifecycle

- `before()` — start MongoMemoryServer, connect mongoose, build Express app with billing routes
- `afterEach()` — drop all collections between tests
- `after()` — stop MongoMemoryServer, disconnect mongoose

### Express App Assembly

Build a minimal Express app for tests (not the full `app.js`):

- `express.raw({ type: "application/json" })` on `/billing/webhook` (matches production config)
- `express.json()` for other routes
- Mount billing routes on `/billing`
- No CORS, no cookie-parser (not needed for webhook tests)

### Provider Mock

The only mock: replace `parseWebhookEvent` to skip HMAC signature verification.

The mocked version:
1. Ignores the `signature` parameter
2. Parses JSON body
3. Runs the same normalizer logic as the real provider

Implementation: use `node:test` `mock.fn()` or module-level replacement before importing the controller.

## Test Cases

### Group 1: New Subscription (`checkout.completed`) — 3 tests

**1.1 Creates subscription with active status**
- Send webhook `checkout.completed` with a subscription product ID
- Assert: Subscription document exists in DB with `status: "active"`, correct `planKey: "pro"`, correct `providerSubscriptionId`

**1.2 Creates payment record**
- Send webhook `checkout.completed`
- Assert: Payment document exists with `type: "subscription"`, `eventType: "checkout.completed"`, correct `amount` and `currency`

**1.3 Handles unknown user gracefully**
- Send webhook `checkout.completed` with an email that has no matching user
- Assert: Subscription created with `userId: null`, no error thrown

### Group 2: Renewal (`subscription.paid`) — 3 tests

**2.1 Updates existing subscription (no duplication)**
- Pre-create an active subscription in DB
- Send webhook `subscription.paid` with same `subscription_id`
- Assert: Still only 1 Subscription document in DB, status remains `active`

**2.2 Updates billing period**
- Pre-create an active subscription
- Send webhook `subscription.paid` with new `current_period_start` and `current_period_end`
- Assert: Subscription's period dates updated to new values

**2.3 Creates renewal payment**
- Pre-create an active subscription
- Send webhook `subscription.paid`
- Assert: New Payment document created with `eventType: "subscription.paid"`

### Group 3: Cancellation (`subscription.canceled`) — 3 tests

**3.1 Sets status to canceled**
- Pre-create an active subscription
- Send webhook `subscription.canceled`
- Assert: Subscription status is `canceled`

**3.2 Scheduled cancel → canceled flow**
- Pre-create an active subscription
- Send webhook `subscription.scheduled_cancel` → assert status `scheduled_cancel` (still access-granting)
- Send webhook `subscription.canceled` → assert status `canceled` (no longer access-granting)

**3.3 Canceled subscription not returned as active**
- Pre-create an active subscription, cancel it via webhook
- Query `getActiveSubscriptionByUserId(userId)`
- Assert: returns `null`

## Helpers

### `createTestUser(email)`

Creates a User document directly in MongoDB. Returns the user object with `_id`. Needed because `processSubscriptionCheckout` looks up users by email via `getUser({ email })`.

### `buildWebhookPayload(eventType, data)`

Builds a Creem-like webhook envelope:

```js
{ eventType: "checkout.completed", object: { ...data } }
```

### `sendWebhook(app, eventType, data)`

Sends `POST /billing/webhook` with:
- Header: `creem-signature: "test"`
- Header: `Content-Type: application/json`
- Body: raw JSON string (matches `express.raw()` middleware)

Returns the HTTP response for status code assertions.

### `createActiveSubscription(userId, overrides)`

Inserts a Subscription document directly in MongoDB with `status: "active"` and sensible defaults. Used by renewal and cancellation tests to avoid repeating the checkout flow.

## npm Script

Add to `package.json`:

```json
"scripts": {
  "test": "node --test src/modules/billing/__tests__/billing.test.js",
  "test:billing": "node --test src/modules/billing/__tests__/billing.test.js"
}
```

## What Is NOT Tested

- HMAC signature verification (excluded by user decision)
- One-time product purchases (out of scope — focus on subscriptions)
- Auth-protected endpoints like `GET /billing/plan` (out of scope)
- Creem SDK calls for cancellation (`provider.cancelSubscription`) — would require mocking external API
- Frontend behavior
