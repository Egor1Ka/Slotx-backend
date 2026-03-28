import { getEventTypesForStaff, getEventTypesByOrg } from "../services/eventTypeServices.js";
import { getStaffForEventType } from "../services/eventTypeStaffServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { isValidObjectId } from "../shared/utils/validation/validators.js";

const handleGetEventTypes = async (req, res) => {
  try {
    const { staffId, orgId } = req.query;

    if (orgId && isValidObjectId(orgId)) {
      const eventTypes = await getEventTypesByOrg(orgId);
      return httpResponse(res, generalStatus.SUCCESS, eventTypes);
    }

    if (staffId && isValidObjectId(staffId)) {
      const eventTypes = await getEventTypesForStaff(staffId);
      return httpResponse(res, generalStatus.SUCCESS, eventTypes);
    }

    return httpResponse(res, generalStatus.BAD_REQUEST);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

// Обработчик GET /event-types/:id/staff — возвращает сотрудников для типа события
const handleGetStaffForEventType = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !isValidObjectId(id)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const result = await getStaffForEventType(id);
    if (result.error) {
      return httpResponse(res, generalStatus.NOT_FOUND);
    }

    return httpResponse(res, generalStatus.SUCCESS, result.staff);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

export { handleGetEventTypes, handleGetStaffForEventType };
