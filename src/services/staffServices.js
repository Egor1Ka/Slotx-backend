import { getUserById } from "../modules/user/index.js";
import { getActiveMembership } from "../repository/membershipRepository.js";
import { getPositionById } from "../repository/positionRepository.js";
import { getRawOrgById } from "../repository/organizationRepository.js";
import { toStaffDto } from "../dto/staffDto.js";

const buildOrgContactInfo = (org) => ({
  orgName: org.name,
  orgLogo: org.settings ? org.settings.logoUrl || null : null,
  description: org.description || null,
  address: org.address || null,
  phone: org.phone || null,
  website: org.website || null,
});

const buildUserContactInfo = (user) => ({
  orgName: null,
  orgLogo: null,
  description: user.description || null,
  address: user.address || null,
  phone: user.phone || null,
  website: user.website || null,
});

const getStaffProfile = async (id) => {
  const user = await getUserById(id);
  if (!user) return null;

  const membership = await getActiveMembership(id);
  const position = membership && membership.positionId
    ? await getPositionById(membership.positionId)
    : null;

  const staffDto = toStaffDto(user, position, membership);

  const org = membership ? await getRawOrgById(membership.orgId) : null;
  const contactInfo = org
    ? buildOrgContactInfo(org)
    : buildUserContactInfo(user);

  return { ...staffDto, ...contactInfo };
};

export { getStaffProfile };
