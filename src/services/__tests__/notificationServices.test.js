import { describe, it, before, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

const membershipRepoPath = "../../repository/membershipRepository.js";

const state = { adminIds: [] };
const getOrgAdminUserIds = async () => state.adminIds;

describe("collectRecipientUserIds", () => {
  const ctx = { collectRecipientUserIds: null };

  before(async () => {
    mock.module(membershipRepoPath, {
      namedExports: { getOrgAdminUserIds },
    });
    ({ collectRecipientUserIds: ctx.collectRecipientUserIds } = await import("../notificationServices.js"));
  });

  afterEach(() => {
    state.adminIds = [];
  });

  it("returns only lead host when org has no admins", async () => {
    state.adminIds = [];
    const booking = {
      orgId: "org1",
      hosts: [{ userId: "u-lead", role: "lead" }],
    };
    const result = await ctx.collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String), ["u-lead"]);
  });

  it("returns lead host + admins (no overlap)", async () => {
    state.adminIds = ["u-owner", "u-admin"];
    const booking = {
      orgId: "org1",
      hosts: [{ userId: "u-lead", role: "lead" }],
    };
    const result = await ctx.collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String).sort(), ["u-admin", "u-lead", "u-owner"]);
  });

  it("dedupes when lead host is also owner of the org", async () => {
    state.adminIds = ["u-lead", "u-admin"];
    const booking = {
      orgId: "org1",
      hosts: [{ userId: "u-lead", role: "lead" }],
    };
    const result = await ctx.collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String).sort(), ["u-admin", "u-lead"]);
  });

  it("returns admins only when no lead host exists", async () => {
    state.adminIds = ["u-admin"];
    const booking = { orgId: "org1", hosts: [] };
    const result = await ctx.collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String), ["u-admin"]);
  });
});
