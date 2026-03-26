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

export { getActiveMembership, getActiveMembersByOrg };
