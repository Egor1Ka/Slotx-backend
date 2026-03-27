import { getActiveTemplate, rotateTemplate, upsertScheduleOverride } from "../services/scheduleServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { validateSchema } from "../shared/utils/validation/requestValidation.js";
import { isValidObjectId } from "../shared/utils/validation/validators.js";

const handleGetTemplate = async (req, res) => {
  try {
    const { staffId, orgId, locationId } = req.query;
    if (!staffId || !isValidObjectId(staffId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const template = await getActiveTemplate(staffId, orgId, locationId, today);
    if (!template) return httpResponse(res, generalStatus.NOT_FOUND);

    return httpResponse(res, generalStatus.SUCCESS, template);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const weeklyHourSlotSchema = {
  start: { type: "string", required: true },
  end: { type: "string", required: true },
};

const weeklyHourItemSchema = {
  day: { type: "string", required: true },
  enabled: { type: "boolean", required: true },
  slots: { type: "array", required: true, items: { type: "object", properties: weeklyHourSlotSchema } },
};

const putTemplateSchema = {
  staffId: { type: "string", required: true },
  weeklyHours: { type: "array", required: true, items: { type: "object", properties: weeklyHourItemSchema } },
  slotMode: { type: "string", required: false },
  slotStepMin: { type: "number", required: false },
};

const handlePutTemplate = async (req, res) => {
  try {
    const validated = validateSchema(putTemplateSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: validated.errors });
    }

    const template = await rotateTemplate(req.body);
    return httpResponse(res, generalStatus.SUCCESS, template);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const overrideSchema = {
  staffId: { type: "string", required: true },
  date: { type: "string", required: true },
  enabled: { type: "boolean", required: true },
};

const handlePostOverride = async (req, res) => {
  try {
    const validated = validateSchema(overrideSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: validated.errors });
    }

    const override = await upsertScheduleOverride(req.body);
    return httpResponse(res, generalStatus.SUCCESS, override);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

export { handleGetTemplate, handlePutTemplate, handlePostOverride };
