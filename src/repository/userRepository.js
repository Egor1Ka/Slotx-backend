import User from "../models/User.js";

const createUser = async (data) => {
  return await User.create(data);
};

const getUserById = async (id) => {
  return await User.findById(id);
};

const getUser = async (filter = {}) => {
  return await User.findOne(filter);
};

const updateUser = async (id, update) => {
  return await User.findByIdAndUpdate(id, update, { new: true });
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export default { createUser, getUserById, getUser, updateUser, deleteUser };
