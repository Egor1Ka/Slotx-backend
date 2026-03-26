import { getUserById } from "../modules/user/index.js";
import { getActiveMembership } from "../repository/membershipRepository.js";
import { getPositionById } from "../repository/positionRepository.js";
import { toStaffDto } from "../dto/staffDto.js";

const getStaffProfile = async (id) => {
  const user = await getUserById(id);
  if (!user) return null;

  const membership = await getActiveMembership(id);
  const position = membership && membership.positionId
    ? await getPositionById(membership.positionId)
    : null;

  return toStaffDto(user, position, membership);
};

export { getStaffProfile };
