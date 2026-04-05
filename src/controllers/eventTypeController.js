import { getEventTypesForStaff, getEventTypesByOrg } from "../services/eventTypeServices.js";
import { getStaffForEventType } from "../services/eventTypeStaffServices.js";
import {
  createEventType,
  createPersonalEventType,
  updateEventType,
  deleteEventType,
} from "../services/eventTypeService.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { isValidObjectId } from "../shared/utils/validation/validators.js";
import { validateSchema } from "../shared/utils/validation/requestValidation.js";

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

const createEventTypeSchema = {
  name: { type: "string", required: true },
  durationMin: { type: "number", required: true },
  price: { type: "number", required: true },
  currency: { type: "string", required: false, defaultValue: "UAH" },
  color: { type: "string", required: false },
  description: { type: "string", required: false },
  staffPolicy: { type: "string", required: false, defaultValue: "any" },
  assignedPositions: {
    type: "array",
    required: false,
    items: { type: "string" },
  },
  assignedStaff: {
    type: "array",
    required: false,
    items: { type: "string" },
  },
};

const updateEventTypeSchema = {
  name: { type: "string", required: false },
  durationMin: { type: "number", required: false },
  price: { type: "number", required: false },
  currency: { type: "string", required: false },
  color: { type: "string", required: false },
  description: { type: "string", required: false },
  staffPolicy: { type: "string", required: false },
  assignedPositions: {
    type: "array",
    required: false,
    items: { type: "string" },
  },
  assignedStaff: {
    type: "array",
    required: false,
    items: { type: "string" },
  },
};

const handleCreateEventType = async (req, res) => {
  try {
    const validated = validateSchema(createEventTypeSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, {
        errors: validated.errors,
      });
    }

    const { orgId, userId } = req.body;

    if (orgId && isValidObjectId(orgId)) {
      const eventType = await createEventType(orgId, validated);
      return httpResponse(res, generalStatus.CREATED, eventType);
    }

    if (userId && isValidObjectId(userId)) {
      const eventType = await createPersonalEventType(userId, validated);
      return httpResponse(res, generalStatus.CREATED, eventType);
    }

    return httpResponse(res, generalStatus.BAD_REQUEST);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleUpdateEventType = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const validated = validateSchema(updateEventTypeSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, {
        errors: validated.errors,
      });
    }

    const eventType = await updateEventType(req.params.id, validated);
    return httpResponse(res, generalStatus.SUCCESS, eventType);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleDeleteEventType = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    await deleteEventType(req.params.id);
    return httpResponse(res, generalStatus.SUCCESS);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

export {
  handleGetEventTypes,
  handleGetStaffForEventType,
  handleCreateEventType,
  handleUpdateEventType,
  handleDeleteEventType,
};
