import { getOrgById, createOrg } from "../repository/organizationRepository.js";
import { getActiveMembersByOrg, getMembershipsByUser, createMembership } from "../repository/membershipRepository.js";
import { getUserById } from "../modules/user/index.js";
import { getPositionById } from "../repository/positionRepository.js";
import { countConfirmedBookings } from "../repository/bookingRepository.js";
import { toOrgStaffDto } from "../dto/staffDto.js";
import { toOrgListItemDto } from "../dto/orgDto.js";
import Organization from "../models/Organization.js";
import { MEMBERSHIP_STATUS } from "../constants/booking.js";

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

  return toOrgStaffDto(user, position, bookingCount);
};

const isNotNull = (item) => item !== null;

const getOrgStaff = async (id, dateStr) => {
  const org = await getOrgById(id);
  if (!org) return { error: "org_not_found" };

  const members = await getActiveMembersByOrg(org.id);
  const dateRange = getDateRange(dateStr);

  const toBuildProfile = (dateRange) => (member) => buildMemberProfile(member, dateRange);
  const profiles = await Promise.all(members.map(toBuildProfile(dateRange)));

  return { staff: profiles.filter(isNotNull) };
};

const createOrganization = async (data, userId) => {
  const orgData = {
    slug: `org-${Date.now()}`,
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

  return org;
};

const getUserOrganizations = async (userId) => {
  const memberships = await getMembershipsByUser(userId);
  const toOrgWithRole = async (membership) => {
    const org = await Organization.findById(membership.orgId);
    if (!org) return null;
    return toOrgListItemDto(org, membership);
  };
  const orgs = await Promise.all(memberships.map(toOrgWithRole));
  return orgs.filter(isNotNull);
};

export { getOrganizationById, getOrgStaff, createOrganization, getUserOrganizations };
