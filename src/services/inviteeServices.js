import { findOrCreateInvitee as repoFindOrCreate } from "../repository/inviteeRepository.js";

const findOrCreateInvitee = async (inviteeData) => {
  return repoFindOrCreate(inviteeData);
};

export { findOrCreateInvitee };
