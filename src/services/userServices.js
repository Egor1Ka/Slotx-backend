import userRepository from "../repository/userRepository.js";

const createUser = async (data) => {
  return await userRepository.createUser(data);
};

const getUserById = async (id) => {
  return await userRepository.getUserById(id);
};

const getUser = async (filter = {}) => {
  return await userRepository.getUser(filter);
};

const updateUser = async (id, update) => {
  return await userRepository.updateUser(id, update);
};

const deleteUser = async (id) => {
  return await userRepository.deleteUser(id);
};

export default { createUser, getUserById, getUser, updateUser, deleteUser };
