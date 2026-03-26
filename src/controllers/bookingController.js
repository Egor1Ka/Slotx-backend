import {
  createBooking,
  getBookingsByStaff,
  cancelBookingById,
  cancelBookingByToken,
} from "../services/bookingServices.js";
import { httpResponse, httpResponseError } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { validateSchema } from "../shared/utils/validation/requestValidation.js";
import { isValidObjectId } from "../shared/utils/validation/validators.js";

const createBookingSchema = {
  eventTypeId: { type: "string", required: true },
  staffId: { type: "string", required: true },
  startAt: { type: "string", required: true },
  timezone: { type: "string", required: true },
  invitee: {
    type: "object",
    required: true,
    properties: {
      name: { type: "string", required: true },
      email: { type: "string", required: false },
      phone: { type: "string", required: false },
    },
  },
};

const handleCreateBooking = async (req, res) => {
  try {
    const validated = validateSchema(createBookingSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: validated.errors });
    }

    const booking = await createBooking(req.body);
    if (booking.error === "eventType_not_found") {
      return httpResponse(res, generalStatus.NOT_FOUND);
    }
    if (booking.error === "invitee_contact_required") {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    return httpResponse(res, generalStatus.CREATED, booking);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleGetBookingsByStaff = async (req, res) => {
  try {
    const { staffId, dateFrom, dateTo, locationId, status } = req.query;

    if (!staffId || !isValidObjectId(staffId)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }
    if (!dateFrom || !dateTo) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const statuses = status ? status.split(",") : undefined;

    const bookings = await getBookingsByStaff({
      staffId,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      locationId: locationId || undefined,
      statuses,
    });

    return httpResponse(res, generalStatus.SUCCESS, bookings);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const handleDeleteBooking = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return httpResponse(res, generalStatus.BAD_REQUEST);
    }

    const reason = req.body ? req.body.reason : undefined;
    const booking = await cancelBookingById(req.params.id, reason);
    if (!booking) return httpResponse(res, generalStatus.NOT_FOUND);

    return httpResponse(res, generalStatus.SUCCESS, booking);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

const cancelByTokenSchema = {
  cancelToken: { type: "string", required: true },
  reason: { type: "string", required: false },
};

const handleCancelByToken = async (req, res) => {
  try {
    const validated = validateSchema(cancelByTokenSchema, req.body);
    if (validated.errors) {
      return httpResponse(res, generalStatus.BAD_REQUEST, { errors: validated.errors });
    }

    const booking = await cancelBookingByToken(req.body.cancelToken, req.body.reason);
    if (!booking) return httpResponse(res, generalStatus.NOT_FOUND);

    return httpResponse(res, generalStatus.SUCCESS, booking);
  } catch (error) {
    return httpResponseError(res, error);
  }
};

export {
  handleCreateBooking,
  handleGetBookingsByStaff,
  handleDeleteBooking,
  handleCancelByToken,
};
