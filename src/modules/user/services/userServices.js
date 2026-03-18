import {
  createUser as repoCreateUser,
  getUserById as repoGetUserById,
  getUser as repoGetUser,
  updateUser as repoUpdateUser,
  deleteUser as repoDeleteUser,
} from "../repository/userRepository.js";

const createUser = async (data) => {
  return await repoCreateUser(data);
};

const getUserById = async (id) => {
  return await repoGetUserById(id);
};

const getUser = async (filter = {}) => {
  return await repoGetUser(filter);
};

const updateUser = async (id, update) => {
  return await repoUpdateUser(id, update);
};

const deleteUser = async (id) => {
  return await repoDeleteUser(id);
};

export { createUser, getUserById, getUser, updateUser, deleteUser };
