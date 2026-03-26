import { getEventTypesForStaff } from "../services/eventTypeServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { isValidObjectId } from "../shared/utils/validation/validators.js";

const handleGetEventTypes = async (req, res) => {
  try {
    const { staffId } = req.query;
    if (!staffId || !isValidObjectId(staffId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const eventTypes = await getEventTypesForStaff(staffId);
    return httpResponse(res, generalStatus.SUCCESS, eventTypes);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

export { handleGetEventTypes };
