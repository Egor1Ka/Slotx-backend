import User from "../models/User.js";
import userDto from "../dto/userDto.js";

const createUser = async (data) => {
  const doc = await User.create(data);
  return userDto.toDTO(doc);
};

const getUserById = async (id) => {
  const doc = await User.findById(id);
  if (!doc) return null;
  return userDto.toDTO(doc);
};

const getUser = async (filter = {}) => {
  const doc = await User.findOne(filter);
  if (!doc) return null;
  return userDto.toDTO(doc);
};

const updateUser = async (id, update) => {
  const doc = await User.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return null;
  return userDto.toDTO(doc);
};

const deleteUser = async (id) => {
  const doc = await User.findByIdAndDelete(id);
  if (!doc) return null;
  return userDto.toDTO(doc);
};

export default { createUser, getUserById, getUser, updateUser, deleteUser };
