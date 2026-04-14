import { describe, it, before, afterEach, mock } from "node:test";
import assert from "node:assert/strict";

const membershipRepoPath = "../../repository/membershipRepository.js";

// Mutable admin list — tests swap this before each assertion
let adminIds = [];
const getOrgAdminUserIds = async () => adminIds;

describe("collectRecipientUserIds", () => {
  let collectRecipientUserIds;

  before(async () => {
    mock.module(membershipRepoPath, {
      namedExports: { getOrgAdminUserIds },
    });
    ({ collectRecipientUserIds } = await import("../notificationServices.js"));
  });

  afterEach(() => {
    adminIds = [];
  });

  it("returns only lead host when org has no admins", async () => {
    adminIds = [];
    const booking = {
      orgId: "org1",
      hosts: [{ userId: "u-lead", role: "lead" }],
    };
    const result = await collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String), ["u-lead"]);
  });

  it("returns lead host + admins (no overlap)", async () => {
    adminIds = ["u-owner", "u-admin"];
    const booking = {
      orgId: "org1",
      hosts: [{ userId: "u-lead", role: "lead" }],
    };
    const result = await collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String).sort(), ["u-admin", "u-lead", "u-owner"]);
  });

  it("dedupes when lead host is also owner of the org", async () => {
    adminIds = ["u-lead", "u-admin"];
    const booking = {
      orgId: "org1",
      hosts: [{ userId: "u-lead", role: "lead" }],
    };
    const result = await collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String).sort(), ["u-admin", "u-lead"]);
  });

  it("returns admins only when no lead host exists", async () => {
    adminIds = ["u-admin"];
    const booking = { orgId: "org1", hosts: [] };
    const result = await collectRecipientUserIds(booking);
    assert.deepEqual(result.map(String), ["u-admin"]);
  });
});
