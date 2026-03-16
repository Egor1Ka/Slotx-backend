import authServices from "../services/authServices.js";
import { httpResponse } from "../utils/http/httpResponse.js";
import { generalStatus } from "../utils/http/httpStatus.js";
import { parseAuthToken } from "../utils/http/httpUtils.js";
import { COOKIE_NAMES } from "../utils/cookieOptions.js";

const authMiddleware = (req, res, next) => {
  try {
    const bearerToken = parseAuthToken(req.headers.authorization);
    const cookieToken = req.cookies && req.cookies[COOKIE_NAMES.access];
    const token = bearerToken || cookieToken;

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
    httpResponse(res, generalStatus.UNAUTHORIZED);
  }
};

export default authMiddleware;
