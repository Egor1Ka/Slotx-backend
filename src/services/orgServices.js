import { getOrgById, getRawOrgById, createOrg } from "../repository/organizationRepository.js";
import { getActiveMembersByOrg, getActiveAndInvitedMembersByOrg, getMembershipsByUser, createMembership, getMembershipByUserAndOrg, acceptInvitation as acceptInvitationRepo, declineInvitation as declineInvitationRepo } from "../repository/membershipRepository.js";
import { getUserById } from "../modules/user/index.js";
import { getPositionById } from "../repository/positionRepository.js";
import { countConfirmedBookings } from "../repository/bookingRepository.js";
import { toOrgStaffDto } from "../dto/staffDto.js";
import { toOrgDto, toOrgListItemDto } from "../dto/orgDto.js";
import { MEMBERSHIP_STATUS } from "../constants/booking.js";
import { createDefaultSchedule } from "./scheduleServices.js";
import Organization from "../models/Organization.js";
import Membership from "../models/Membership.js";
import { HttpError } from "../shared/utils/http/httpError.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { getUserBillingProfile } from "../modules/billing/services/planServices.js";

const getOrganizationById = async (id) => {
  return getOrgById(id);
};

const getDateRange = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const buildMemberProfile = async (member, dateRange) => {
  const user = await getUserById(member.userId.toString());
  if (!user) return null;

  const position = member.positionId
    ? await getPositionById(member.positionId)
    : null;

  const bookingCount = await countConfirmedBookings(
    member.userId,
    dateRange.start,
    dateRange.end,
  );

  return toOrgStaffDto(user, position, bookingCount, member.status, member);
};

const isNotNull = (item) => item !== null;

const getOrgStaff = async (id, dateStr) => {
  const org = await getOrgById(id);
  if (!org) return { error: "org_not_found" };

  const members = await getActiveAndInvitedMembersByOrg(org.id);
  const dateRange = getDateRange(dateStr);

  const toBuildProfile = (dateRange) => (member) => buildMemberProfile(member, dateRange);
  const profiles = await Promise.all(members.map(toBuildProfile(dateRange)));

  return { staff: profiles.filter(isNotNull) };
};

const createOrganization = async (data, userId) => {
  const plan = await getUserBillingProfile(userId);
  const orgLimit = plan.limits.organizations || 0;

  const ownedOrgsCount = await Membership.countDocuments({
    userId,
    role: "owner",
  });

  if (ownedOrgsCount >= orgLimit) {
    throw new HttpError({ statusCode: 402, status: "limitReached" });
  }

  const orgData = {
    name: data.name,
    currency: data.currency || "UAH",
    settings: {
      defaultTimezone: data.defaultTimezone || "Europe/Kyiv",
      defaultCountry: data.defaultCountry || "UA",
      brandColor: data.brandColor || undefined,
      logoUrl: data.logoUrl || undefined,
    },
  };

  const org = await createOrg(orgData);

  await createMembership({
    userId,
    orgId: org.id,
    role: "owner",
    status: MEMBERSHIP_STATUS.ACTIVE,
  });

  await createDefaultSchedule(userId, org.id).catch((err) =>
    console.error("[createDefaultSchedule] org creation failed:", err.message),
  );

  return org;
};

const updateOrganization = async (orgId, data) => {
  const update = {};

  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description;
  if (data.address !== undefined) update.address = data.address;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.website !== undefined) update.website = data.website;
  if (data.logoUrl !== undefined) update["settings.logoUrl"] = data.logoUrl;
  if (data.brandColor !== undefined) update["settings.brandColor"] = data.brandColor;

  if (Object.keys(update).length === 0) {
    throw new HttpError(generalStatus.BAD_REQUEST);
  }

  const org = await Organization.findByIdAndUpdate(orgId, update, { new: true });
  if (!org) {
    throw new HttpError(generalStatus.NOT_FOUND);
  }

  return toOrgDto(org);
};

const updateStaffBio = async (orgId, staffId, bio) => {
  const membership = await Membership.findOneAndUpdate(
    { userId: staffId, orgId, status: "active" },
    { bio: bio !== undefined ? bio : null },
    { new: true },
  );

  if (!membership) {
    throw new HttpError(generalStatus.NOT_FOUND);
  }

  return { bio: membership.bio || null };
};

const updateStaffPosition = async (orgId, staffId, positionId) => {
  const membership = await Membership.findOneAndUpdate(
    { userId: staffId, orgId, status: "active" },
    { positionId: positionId || null },
    { new: true },
  );

  if (!membership) {
    throw new HttpError(generalStatus.NOT_FOUND);
  }

  return { positionId: membership.positionId ? membership.positionId.toString() : null };
};

const getUserOrganizations = async (userId) => {
  const memberships = await getMembershipsByUser(userId);
  const toOrgWithRole = async (membership) => {
    const org = await getRawOrgById(membership.orgId);
    if (!org) return null;
    return toOrgListItemDto(org, membership);
  };
  const orgs = await Promise.all(memberships.map(toOrgWithRole));
  return orgs.filter(isNotNull);
};

const addStaffToOrg = async (orgId, userId, invitedByUserId) => {
  const org = await getOrgById(orgId);
  if (!org) return { error: "org_not_found" };

  const user = await getUserById(userId);
  if (!user) return { error: "user_not_found" };

  const existing = await getMembershipByUserAndOrg(userId, orgId);
  if (existing) return { error: "already_member" };

  const membership = await createMembership({
    userId,
    orgId,
    role: "member",
    status: MEMBERSHIP_STATUS.INVITED,
    invitedBy: invitedByUserId,
  });

  return { staff: { id: user.id, name: user.name, avatar: user.avatar, position: null, bio: null, bookingCount: 0, status: "invited" } };
};

const acceptInvitation = async (orgId, userId) => {
  const result = await acceptInvitationRepo(userId, orgId);
  if (!result) return { error: "invitation_not_found" };

  await createDefaultSchedule(userId, orgId).catch((err) =>
    console.error("[createDefaultSchedule] accept invitation failed:", err.message),
  );

  return { success: true };
};

const declineInvitation = async (orgId, userId) => {
  const result = await declineInvitationRepo(userId, orgId);
  if (!result) return { error: "invitation_not_found" };
  return { success: true };
};

const getMyMembership = async (orgId, userId) => {
  const membership = await getMembershipByUserAndOrg(userId, orgId);
  if (!membership) return null;
  return { role: membership.role, status: membership.status };
};

export { getOrganizationById, getOrgStaff, createOrganization, updateOrganization, updateStaffBio, updateStaffPosition, getUserOrganizations, addStaffToOrg, acceptInvitation, declineInvitation, getMyMembership };
