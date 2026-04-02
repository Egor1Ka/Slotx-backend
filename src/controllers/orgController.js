import { getOrganizationById, getOrgStaff, createOrganization, getUserOrganizations, addStaffToOrg } from "../services/orgServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus, userStatus } from "../shared/utils/http/httpStatus.js";
import { validateSchema } from "../shared/utils/validation/requestValidation.js";

const createOrgSchema = {
  name: { type: "string", required: true },
  currency: { type: "string", required: false },
  logoUrl: { type: "string", required: false },
  brandColor: { type: "string", required: false },
  defaultTimezone: { type: "string", required: false },
  defaultCountry: { type: "string", required: false },
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

export { handleGetOrg, handleGetOrgStaff, handleCreateOrg, handleGetUserOrgs, handleAddStaff };
