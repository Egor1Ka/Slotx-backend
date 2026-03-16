export const generalStatus = {
  SUCCESS: { status: 200, message: "success" },
  BAD_REQUEST: { status: 400, message: "badRequest" },
  UNAUTHORIZED: { status: 401, message: "unauthorized" },
  NOT_FOUND: { status: 404, message: "notFound" },
  ERROR: { status: 500, message: "serverError" },
};

export const userStatus = {
  DELETED:          { status: 200, message: "userDeleted" },
  VALIDATION_ERROR: { status: 400, message: "validationError" },
  NOTHING_TO_UPDATE:{ status: 400, message: "nothingToUpdate" },
};
