import RefreshToken from "../models/RefreshToken.js";

const createRefreshToken = async (data) => {
  return await RefreshToken.create(data);
};

const getRefreshTokenByToken = async (token) => {
  return await RefreshToken.findOne({ token });
};

const deleteRefreshTokensByUserAndProvider = async (userId, provider) => {
  return await RefreshToken.deleteMany({ userId, provider });
};

const deleteRefreshTokenByToken = async (token) => {
  return await RefreshToken.deleteOne({ token });
};

export default {
  createRefreshToken,
  getRefreshTokenByToken,
  deleteRefreshTokensByUserAndProvider,
  deleteRefreshTokenByToken,
};
