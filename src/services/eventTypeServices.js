import {
  getEventTypeById as repoGetById,
  getEventTypesForStaff as repoGetForStaff,
  getEventTypesByOrg as repoGetByOrg,
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

const getEventTypesByOrg = async (orgId) => {
  return repoGetByOrg(orgId);
};

export { getEventTypeById, getEventTypesForStaff, getEventTypesByOrg };
