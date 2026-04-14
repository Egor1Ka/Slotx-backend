import { getOrganizationById, getOrgStaff, createOrganization, updateOrganization, updateStaffBio, updateStaffPosition, getUserOrganizations, addStaffToOrg, acceptInvitation, declineInvitation, getMyMembership } from "../services/orgServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus, userStatus } from "../shared/utils/http/httpStatus.js";
import { validateSchema } from "../shared/utils/validation/requestValidation.js";
import { isValidObjectId } from "../shared/utils/validation/validators.js";

const createOrgSchema = {
  name: { type: "string", required: true },
  currency: { type: "string", required: false },
  logoUrl: { type: "string", required: false },
  brandColor: { type: "string", required: false },
  defaultTimezone: { type: "string", required: false },
  defaultCountry: { type: "string", required: false },
};

const updateOrgSchema = {
  name: { type: "string", required: false },
  description: { type: "string", required: false },
  address: { type: "string", required: false },
  phone: { type: "string", required: false },
  website: { type: "string", required: false },
  logoUrl: { type: "string", required: false },
  brandColor: { type: "string", required: false },
};

const updateStaffBioSchema = {
  bio: { type: "string", required: false },
};

const handleGetOrg = async (req, res) => {
  try {
    const org = await getOrganizationById(req.params.id);
    if (!org) return httpResponse(res, generalStatus.NOT_FOUND);

    return httpResponse(res, generalStatus.SUCCESS, org);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleGetOrgStaff = async (req, res) => {
  try {
    const result = await getOrgStaff(req.params.id, req.query.date);
    if (result.error === "org_not_found") {
      return httpResponse(res, generalStatus.NOT_FOUND);
    }

    return httpResponse(res, generalStatus.SUCCESS, result.staff);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleCreateOrg = async (req, res) => {
  try {
    const validated = validateSchema(createOrgSchema, req.body);
    if (validated.errors) {
      return httpResponseError(res, {
        ...userStatus.VALIDATION_ERROR,
        data: validated.errors,
      });
    }
    const org = await createOrganization(validated, req.user.id);
    return httpResponse(res, generalStatus.CREATED, org);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleUpdateOrg = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const validated = validateSchema(updateOrgSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: validated.errors });
    }

    const result = await updateOrganization(req.params.id, validated);
    return httpResponse(res, generalStatus.SUCCESS, result);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleUpdateStaffBio = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.staffId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    if (req.user.id !== req.params.staffId) {
      return httpResponse(res, generalStatus.UNAUTHORIZED);
    }

    const validated = validateSchema(updateStaffBioSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: validated.errors });
    }

    const result = await updateStaffBio(req.params.id, req.params.staffId, validated.bio);
    return httpResponse(res, generalStatus.SUCCESS, result);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleUpdateStaffPosition = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id) || !isValidObjectId(req.params.staffId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const { positionId } = req.body;
    if (positionId !== null && positionId !== undefined && !isValidObjectId(positionId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const result = await updateStaffPosition(req.params.id, req.params.staffId, positionId);
    return httpResponse(res, generalStatus.SUCCESS, result);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleGetUserOrgs = async (req, res) => {
  try {
    const orgs = await getUserOrganizations(req.user.id);
    return httpResponse(res, generalStatus.SUCCESS, orgs);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const addStaffSchema = {
  userId: { type: "string", required: true },
};

const handleAddStaff = async (req, res) => {
  try {
    const validated = validateSchema(addStaffSchema, req.body);
    if (validated.errors) {
      return httpResponseError(res, {
        ...userStatus.VALIDATION_ERROR,
        data: validated.errors,
      });
    }

    const result = await addStaffToOrg(req.params.id, validated.userId, req.user.id);

    if (result.error === "org_not_found") {
      return httpResponse(res, generalStatus.NOT_FOUND);
    }
    if (result.error === "user_not_found") {
      return httpResponse(res, generalStatus.NOT_FOUND);
    }
    if (result.error === "already_member") {
      return httpResponseError(res, { statusCode: 409, status: "conflict", data: null });
    }

    return httpResponse(res, generalStatus.CREATED, result.staff);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleAcceptInvitation = async (req, res) => {
  try {
    const result = await acceptInvitation(req.params.id, req.user.id);
    if (result.error === "invitation_not_found") {
      return httpResponse(res, generalStatus.NOT_FOUND);
    }
    return httpResponse(res, generalStatus.SUCCESS, result);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleDeclineInvitation = async (req, res) => {
  try {
    const result = await declineInvitation(req.params.id, req.user.id);
    if (result.error === "invitation_not_found") {
      return httpResponse(res, generalStatus.NOT_FOUND);
    }
    return httpResponse(res, generalStatus.SUCCESS, result);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleGetMyMembership = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const membership = await getMyMembership(req.params.id, req.user.id);
    if (!membership) return httpResponse(res, generalStatus.NOT_FOUND);

    return httpResponse(res, generalStatus.SUCCESS, membership);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

export { handleGetOrg, handleGetOrgStaff, handleCreateOrg, handleUpdateOrg, handleUpdateStaffBio, handleUpdateStaffPosition, handleGetUserOrgs, handleAddStaff, handleAcceptInvitation, handleDeclineInvitation, handleGetMyMembership };
