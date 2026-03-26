import { getOrgBySlug } from "../repository/organizationRepository.js";
import { getActiveMembersByOrg } from "../repository/membershipRepository.js";
import { getUserById } from "../modules/user/index.js";
import { getPositionById } from "../repository/positionRepository.js";
import { countConfirmedBookings } from "../repository/bookingRepository.js";
import { toOrgStaffDto } from "../dto/staffDto.js";

const getOrganizationBySlug = async (slug) => {
  return getOrgBySlug(slug);
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

const getOrgStaff = async (slug, dateStr) => {
  const org = await getOrgBySlug(slug);
  if (!org) return { error: "org_not_found" };

  const members = await getActiveMembersByOrg(org.id);
  const dateRange = getDateRange(dateStr);

  const toBuildProfile = (dateRange) => (member) => buildMemberProfile(member, dateRange);
  const profiles = await Promise.all(members.map(toBuildProfile(dateRange)));

  return { staff: profiles.filter(isNotNull) };
};

export { getOrganizationBySlug, getOrgStaff };
