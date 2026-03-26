import {
  getEventTypeById as repoGetById,
  getEventTypesForStaff as repoGetForStaff,
} from "../repository/eventTypeRepository.js";
import { getActiveMembership } from "../repository/membershipRepository.js";

const getEventTypeById = async (id) => {
  return repoGetById(id);
};

const getEventTypesForStaff = async (staffId) => {
  const membership = await getActiveMembership(staffId);
  const orgId = membership ? membership.orgId : null;
  return repoGetForStaff(staffId, orgId);
};

export { getEventTypeById, getEventTypesForStaff };
