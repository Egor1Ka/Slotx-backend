import { getOrganizationById, getOrgStaff } from "../services/orgServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";

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

export { handleGetOrg, handleGetOrgStaff };
