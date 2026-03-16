import authServices from "../services/authServices.js";
import { httpResponse } from "../utils/http/httpResponse.js";
import { generalStatus } from "../utils/http/httpStatus.js";
import { parseAuthToken } from "../utils/http/httpUtils.js";

const authMiddleware = (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = parseAuthToken(authorization);

    if (!token) {
      httpResponse(res, generalStatus.UNAUTHORIZED);
      return;
    }

    const result = authServices.verifyAccessToken(token);

    if (!result.valid) {
      httpResponse(res, generalStatus.UNAUTHORIZED, { reason: result.reason });
      return;
    }

    req.user = result.payload;
    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    httpResponse(res, generalStatus.UNAUTHORIZED, { reason: "exception" });
  }
};

export default authMiddleware;
