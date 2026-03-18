import User from "../model/User.js";
import { toUserDto } from "../dto/userDto.js";

const createUser = async (data) => {
  const doc = await User.create(data);
  return toUserDto(doc);
};

const getUserById = async (id) => {
  const doc = await User.findById(id);
  if (!doc) return null;
  return toUserDto(doc);
};

const getUser = async (filter = {}) => {
  const doc = await User.findOne(filter);
  if (!doc) return null;
  return toUserDto(doc);
};

const updateUser = async (id, update) => {
  const doc = await User.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return null;
  return toUserDto(doc);
};

const deleteUser = async (id) => {
  const doc = await User.findByIdAndDelete(id);
  if (!doc) return null;
  return toUserDto(doc);
};

export { createUser, getUserById, getUser, updateUser, deleteUser };
