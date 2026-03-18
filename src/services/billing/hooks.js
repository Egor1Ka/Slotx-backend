// ── Product lifecycle hooks ──────────────────────────────────────────────────
// Add business logic per plan here.
// Each hook receives (user, subscription) and runs after a state transition.

const PRODUCT_HOOKS = {
  starter: {
    onActivate:   async (_user, _subscription) => {},
    onDeactivate: async (_user, _subscription) => {},
    onRenew:      async (_user, _subscription) => {},
  },
  pro: {
    onActivate:   async (_user, _subscription) => {},
    onDeactivate: async (_user, _subscription) => {},
    onRenew:      async (_user, _subscription) => {},
  },
};

const getHooksForPlan = (planKey) => PRODUCT_HOOKS[planKey];

export default { PRODUCT_HOOKS, getHooksForPlan };
