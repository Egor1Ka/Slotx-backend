import RefreshToken from "../models/RefreshToken.js";
import authDto from "../dto/authDto.js";

const createRefreshToken = async (data) => {
  const doc = await RefreshToken.create(data);
  return authDto.refreshTokenToDTO(doc);
};

const getRefreshTokenByToken = async (token) => {
  const doc = await RefreshToken.findOne({ token });
  if (!doc) return null;
  return authDto.refreshTokenToDTO(doc);
};

const deleteRefreshTokensByUserAndProvider = async (userId, provider) => {
  await RefreshToken.deleteMany({ userId, provider });
};

const deleteRefreshTokenByToken = async (token) => {
  await RefreshToken.deleteOne({ token });
};

export default {
  createRefreshToken,
  getRefreshTokenByToken,
  deleteRefreshTokensByUserAndProvider,
  deleteRefreshTokenByToken,
};
