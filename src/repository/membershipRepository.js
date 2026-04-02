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

// Находит активные членства организации по списку идентификаторов должностей
const getActiveMembersByPositions = async (orgId, positionIds) => {
  const docs = await Membership.find({
    orgId,
    positionId: { $in: positionIds },
    status: MEMBERSHIP_STATUS.ACTIVE,
  });
  return docs;
};

// Находит активные членства организации по списку идентификаторов пользователей
const getActiveMembersByUserIds = async (orgId, userIds) => {
  const docs = await Membership.find({
    orgId,
    userId: { $in: userIds },
    status: MEMBERSHIP_STATUS.ACTIVE,
  });
  return docs;
};

// Считает активные членства по идентификатору должности
const countByPositionId = async (positionId) => {
  return Membership.countDocuments({
    positionId,
    status: MEMBERSHIP_STATUS.ACTIVE,
  });
};

// Возвращает userId всех членов организации (активных, приглашённых и приостановленных)
const getMemberUserIdsByOrg = async (orgId) => {
  const docs = await Membership.find({
    orgId,
    status: { $in: [MEMBERSHIP_STATUS.ACTIVE, MEMBERSHIP_STATUS.INVITED, MEMBERSHIP_STATUS.SUSPENDED] },
  }).select("userId");
  const toUserId = (doc) => doc.userId;
  return docs.map(toUserId);
};

// Находит членство по userId и orgId (для проверки дубликатов при добавлении)
const getMembershipByUserAndOrg = async (userId, orgId) => {
  return Membership.findOne({ userId, orgId });
};

export { getActiveMembership, getActiveMembersByOrg, getMembershipsByUser, createMembership, getActiveMembersByPositions, getActiveMembersByUserIds, countByPositionId, getMemberUserIdsByOrg, getMembershipByUserAndOrg };
