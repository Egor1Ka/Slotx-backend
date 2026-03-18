---
name: add-billing-product
description: Use when adding a new subscription plan, one-time purchase, or billing product to BackendTemplate. Guides through config, hooks, and verification.
---

Add a new billing product (subscription or one-time payment) to BackendTemplate. Follow the billing architecture strictly.

## Billing Architecture

```
src/
├── constants/billing.js              — PRODUCT_PLANS, PLANS, PLAN_HIERARCHY
├── models/Subscription.js            — subscription state (mutable)
├── models/Payment.js                 — payment history (append-only)
├── services/billing/hooks.js         — product lifecycle hooks (onActivate, onDeactivate, onRenew)
├── services/billingServices.js       — webhook processing, state machine
├── services/planServices.js          — plan resolution (pure + orchestrators)
├── middleware/plan.js                — requireFeature(), requirePlan(), attachPlan()
├── providers/billing/creem.js        — creem SDK wrapper
└── controllers/billingController.js  — webhook endpoint
```

## How It Works

```
Creem webhook → billingController (verify HMAC)
  → billingServices (update Subscription + create Payment)
  → hooks.js (run onActivate / onDeactivate / onRenew per plan)

Protected route → middleware/plan.js
  → planServices.getUserPlan(userId)
  → check Subscription + one-time Payments → resolve best plan from PLANS config
  → allow or block (403 featureLocked)
```

## Step 1 — Gather Info

Ask the user:

1. **Product type:** subscription or one-time purchase?
2. **Product name** (how it appears in creem dashboard, e.g. "Pro Monthly")
3. **Creem product ID** (e.g. `prod_abc123` — from creem dashboard, or placeholder for now)
4. **Plan key:** map to existing plan (`starter`, `pro`) or create a new one?
5. If **new plan:**
   - Plan name (e.g. `enterprise`)
   - Features — which features should be enabled? (list current features from `PLANS` config)
   - Limits — what limits? (list current limits from `PLANS` config)
6. **Business rules for hooks:**
   - What should happen when this product is **activated** (first purchase)?
   - What should happen when it is **deactivated** (canceled/expired)?
   - What should happen on **renewal** (subscription only)?
7. **Protected routes:** any new routes that require this plan/feature?

### Validate Before Proceeding

- If the user specifies a creem product ID that already exists in `PRODUCT_PLANS` — warn about conflict
- If the user wants a new plan key that already exists in `PLANS` — ask if they want to modify existing or pick a different name
- If the user wants a one-time purchase but asks about renewal hooks — explain that one-time purchases have no renewal, only `onActivate`

## Step 2 — Read Current Config

Read `src/constants/billing.js` to understand:
- Current `PRODUCT_PLANS` entries
- Current `PLANS` with features and limits
- Current `PLAN_HIERARCHY`

Read `src/services/billing/hooks.js` to see existing hooks.

## Step 3 — Add Product to Config

In `src/constants/billing.js`:

### 3a. Add to PRODUCT_PLANS

```js
export const PRODUCT_PLANS = {
  // ... existing entries
  "<creem_product_id>": "<plan_key>",    // ← add
};
```

If the product has multiple billing periods (monthly + yearly), add both:

```js
  "<creem_product_id_monthly>": "<plan_key>",
  "<creem_product_id_yearly>":  "<plan_key>",
```

### 3b. Add Plan (if new)

Only if creating a new plan tier. Add to `PLANS`:

```js
export const PLANS = {
  // ... existing plans
  <plan_key>: {
    features: { /* based on user's answers */ },
    limits:   { /* based on user's answers */ },
  },
};
```

**Important:** new plan must have the **same feature AND limit keys** as existing plans. If adding a new key (feature or limit), add it to ALL plans with appropriate values.

### 3c. Update PLAN_HIERARCHY (if new plan)

Insert the new plan at the correct position (weakest → strongest):

```js
export const PLAN_HIERARCHY = ["free", "starter", "pro", "<new_plan>"];
```

## Step 4 — Add Lifecycle Hooks (subscriptions only)

**Hooks are called ONLY for subscription products.** One-time purchases bypass the hook system entirely — they create a `Payment` record and grant plan access through `planServices.resolveBestPlanKey`, but no lifecycle hooks fire.

If the user needs side effects on a one-time purchase (e.g., send welcome email), add custom logic to `processCheckoutCompleted` in `src/services/billingServices.js` inside the `else` branch (when `isSubscriptionProduct` is false).

For **subscription products**, add or update the plan entry in `PRODUCT_HOOKS` in `src/services/billing/hooks.js`:

```js
const PRODUCT_HOOKS = {
  // ... existing hooks
  <plan_key>: {
    onActivate:   async (user, subscription) => {
      // First activation or reactivation after cancellation
    },
    onDeactivate: async (user, subscription) => {
      // Canceled, expired, or paused
    },
    onRenew:      async (user, subscription) => {
      // Recurring payment collected (subscription was already active)
    },
  },
};
```

Hook functions receive:
- `user` — Mongoose User document (`user._id`, `user.email`, `user.name`, `user.avatar`)
- `subscription` — Mongoose Subscription document:
  - `subscription.planKey`, `subscription.status`, `subscription.productId`
  - `subscription.userId`, `subscription.creemSubscriptionId`, `subscription.creemCustomerId`
  - `subscription.currentPeriodStart`, `subscription.currentPeriodEnd`, `subscription.cancelAt`

## Step 5 — Add Protected Routes (if needed)

If the user wants routes gated by the new plan or feature:

```js
import authMiddleware from "../middleware/auth.js";
import { requireFeature, requirePlan, attachPlan } from "../middleware/plan.js";

// Gate by specific feature
router.get("/some-feature", authMiddleware, requireFeature("<feature_name>"), handler);

// Gate by minimum plan
router.get("/premium", authMiddleware, requirePlan("<plan_key>"), handler);

// Attach plan info to req for use in handler
router.get("/dashboard", authMiddleware, attachPlan, handler);
// → req.plan = { key: "pro", features: {...}, limits: {...} }
```

## Step 6 — Verify

1. Read `src/constants/billing.js` — confirm product is mapped, plan exists, hierarchy is correct
2. Read `src/services/billing/hooks.js` — confirm hooks are present for the plan (subscriptions only)
3. If new feature or limit keys were added — verify ALL plans have the new keys
4. If one-time purchase with side effects — verify logic is in `processCheckoutCompleted` in `billingServices.js`
5. If protected routes were added — verify middleware chain is `authMiddleware → requireFeature/requirePlan → handler`
6. Show the final list of created/modified files

## Quick Reference: Adding a Product to Existing Plan

Minimal change — just 1 file:

```
src/constants/billing.js → PRODUCT_PLANS: add "prod_xxx": "pro"
```

## Quick Reference: Adding a New Plan Tier

4 files:

```
src/constants/billing.js    → PRODUCT_PLANS + PLANS + PLAN_HIERARCHY
src/services/billing/hooks.js → PRODUCT_HOOKS entry
(optional) routes file       → requirePlan("<new_plan>") middleware
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| New feature/limit key in one plan but not others | Add the key to ALL plans with appropriate values |
| New plan not in PLAN_HIERARCHY | Always add — `resolveBestPlan` uses this for comparison |
| Adding hooks for one-time products | Hooks only fire for subscriptions. Use `processCheckoutCompleted` for one-time side effects |
| One-time product with onRenew logic | One-time purchases never trigger onRenew or any hook |
| Hook accesses field that doesn't exist on User | Hooks receive raw Mongoose docs, check schema |
| Forgot requireFeature middleware on route | Feature check is skipped, all users get access |
