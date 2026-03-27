import Membership from "../models/Membership.js";
import { MEMBERSHIP_STATUS } from "../constants/booking.js";

const getActiveMembership = async (userId) => {
  const doc = await Membership.findOne({
    userId,
    status: MEMBERSHIP_STATUS.ACTIVE,
  });
  return doc;
};

const getActiveMembersByOrg = async (orgId) => {
  const docs = await Membership.find({
    orgId,
    status: MEMBERSHIP_STATUS.ACTIVE,
  });
  return docs;
};

const getMembershipsByUser = async (userId) => {
  const docs = await Membership.find({ userId });
  return docs;
};

const createMembership = async (data) => {
  const doc = await Membership.create(data);
  return doc;
};

export { getActiveMembership, getActiveMembersByOrg, getMembershipsByUser, createMembership };
