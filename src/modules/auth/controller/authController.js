import { createOauthState, findOrCreateUser, createSession, refreshSession, revokeSession } from "../services/authServices.js";
import providers from "../providers/index.js";
import { httpResponse, httpResponseError } from "../../../shared/utils/http/httpResponse.js";
import { generalStatus } from "../../../shared/utils/http/httpStatus.js";
import {
  COOKIE_NAMES,
  stateCookieOptions,
  accessCookieOptions,
  refreshCookieOptions,
} from "../utils/cookieOptions.js";

const { FRONTEND_URL } = process.env;

// ── Provider handler factories ────────────────────────────────────────────────

const buildProviderLoginHandler = (providerName) => (_req, res) => {
  const state = createOauthState();
  const authUrl = providers.getProvider(providerName).buildAuthUrl(state);

  res.cookie(COOKIE_NAMES.state, state, stateCookieOptions);
  res.redirect(authUrl);
};

const buildProviderCallbackHandler = (providerName) => async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = req.cookies[COOKIE_NAMES.state];

    if (!code || !state || !storedState || storedState !== state) {
      httpResponse(res, generalStatus.BAD_REQUEST, {
        message: "Invalid OAuth state",
      });
      return;
    }

    res.clearCookie(COOKIE_NAMES.state, stateCookieOptions);

    const provider = providers.getProvider(providerName);
    const tokens = await provider.exchangeCode(code);
    const profile = await provider.getProfile(tokens);
    const user = await findOrCreateUser(profile);
    const session = await createSession(
      user,
      providerName,
      profile.providerUserId,
    );

    res.cookie(COOKIE_NAMES.access, session.accessToken, accessCookieOptions);
    res.cookie(
      COOKIE_NAMES.refresh,
      session.refreshToken,
      refreshCookieOptions,
    );
    res.redirect(FRONTEND_URL);
  } catch (error) {
    httpResponseError(res, error);
  }
};

// ── Google ────────────────────────────────────────────────────────────────────

const handleGoogleLogin = buildProviderLoginHandler("google");
const handleGoogleCallback = buildProviderCallbackHandler("google");

// ── Refresh ───────────────────────────────────────────────────────────────────

const handleRefreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies[COOKIE_NAMES.refresh];

    if (!refreshToken) {
      httpResponse(res, generalStatus.UNAUTHORIZED);
      return;
    }

    const result = await refreshSession(refreshToken);

    if (!result) {
      httpResponse(res, generalStatus.UNAUTHORIZED);
      return;
    }

    res.cookie(COOKIE_NAMES.access, result.accessToken, accessCookieOptions);
    httpResponse(res, generalStatus.SUCCESS, {
      accessToken: result.accessToken,
    });
  } catch (error) {
    httpResponseError(res, error);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────

const handleLogout = async (req, res) => {
  try {
    const refreshToken = req.cookies[COOKIE_NAMES.refresh];

    if (refreshToken) {
      await revokeSession(refreshToken);
    }

    res.clearCookie(COOKIE_NAMES.access, accessCookieOptions);
    res.clearCookie(COOKIE_NAMES.refresh, refreshCookieOptions);
    httpResponse(res, generalStatus.SUCCESS);
  } catch (error) {
    httpResponseError(res, error);
  }
};

export { handleGoogleLogin, handleGoogleCallback, handleRefreshToken, handleLogout };
