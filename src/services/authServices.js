import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_ACCESS_EXPIRES } = process.env;

const createAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });
};

const verifyAccessToken = (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
};

export default { createAccessToken, verifyAccessToken };
