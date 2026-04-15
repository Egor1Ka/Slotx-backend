import { getActiveTemplate, rotateTemplate, upsertScheduleOverride, getOverridesByStaff, deleteOverride, getOverridesByOrg, getActiveTemplatesByOrg } from "../services/scheduleServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { validateSchema } from "../shared/utils/validation/requestValidation.js";
import { isValidObjectId } from "../shared/utils/validation/validators.js";
import { isValidTimezone } from "../shared/utils/timezone.js";
import { requireOrgAdmin } from "../shared/utils/orgAuth.js";
import ScheduleOverride from "../models/ScheduleOverride.js";

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
  timezone: { type: "string", required: false },
};

const handlePutTemplate = async (req, res) => {
  try {
    const validated = validateSchema(putTemplateSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: validated.errors });
    }

    if (req.body.timezone !== undefined && !isValidTimezone(req.body.timezone)) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: { timezone: "invalid IANA timezone" } });
    }

    const callerId = req.user.id;
    const { staffId, orgId } = req.body;
    if (orgId) {
      await requireOrgAdmin(callerId, orgId);
    } else if (callerId !== staffId) {
      return httpResponse(res, generalStatus.FORBIDDEN);
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

    const callerId = req.user.id;
    const { staffId, orgId } = req.body;
    if (orgId) {
      await requireOrgAdmin(callerId, orgId);
    } else if (callerId !== staffId) {
      return httpResponse(res, generalStatus.FORBIDDEN);
    }

    const override = await upsertScheduleOverride(req.body);
    return httpResponse(res, generalStatus.SUCCESS, override);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleGetTemplatesByOrg = async (req, res) => {
  try {
    const { orgId } = req.params
    if (!isValidObjectId(orgId)) {
      return httpResponseError(res, { message: 'Invalid orgId' })
    }
    const templates = await getActiveTemplatesByOrg(orgId)
    return httpResponse(res, generalStatus.SUCCESS, templates)
  } catch (error) {
    return httpResponseError(res, error)
  }
}

const handleGetOverrides = async (req, res) => {
  try {
    const { staffId, orgId } = req.query;
    if (!staffId || !isValidObjectId(staffId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const overrides = await getOverridesByStaff(staffId, orgId ? orgId : null);
    return httpResponse(res, generalStatus.SUCCESS, overrides);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleDeleteOverride = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const existing = await ScheduleOverride.findById(id);
    if (!existing) return httpResponse(res, generalStatus.NOT_FOUND);

    const callerId = req.user.id;
    if (existing.orgId) {
      await requireOrgAdmin(callerId, existing.orgId);
    } else if (String(existing.staffId) !== String(callerId)) {
      return httpResponse(res, generalStatus.FORBIDDEN);
    }

    const deleted = await deleteOverride(id);
    if (!deleted) return httpResponse(res, generalStatus.NOT_FOUND);

    return httpResponse(res, generalStatus.SUCCESS, null);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleGetOverridesByOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    if (!isValidObjectId(orgId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const overrides = await getOverridesByOrg(orgId);
    return httpResponse(res, generalStatus.SUCCESS, overrides);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

export { handleGetTemplate, handlePutTemplate, handlePostOverride, handleGetOverrides, handleDeleteOverride, handleGetOverridesByOrg, handleGetTemplatesByOrg };
