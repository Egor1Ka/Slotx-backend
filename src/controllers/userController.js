import { httpResponse, httpResponseError } from "../utils/http/httpResponse.js";
import { generalStatus, userStatus } from "../utils/http/httpStatus.js";
import { validateSchema } from "../utils/validation/requestValidation.js";
import {
  emailValidator,
  isValidObjectId,
} from "../utils/validation/validators.js";
import userServices from "../services/userServices.js";
import userDto from "../dto/userDto.js";

const createUserSchema = {
  name: { type: "string", required: true },
  email: {
    type: "string",
    required: true,
    validator: emailValidator,
    validatorErrorMessage: "must be a valid email",
  },
  avatar: { type: "string", required: false },
};

const updateUserSchema = {
  name: { type: "string", required: false },
  email: {
    type: "string",
    required: false,
    validator: emailValidator,
    validatorErrorMessage: "must be a valid email",
  },
  avatar: { type: "string", required: false },
};

const createUser = async (req, res) => {
  try {
    const { body } = req;

    const validated = validateSchema(createUserSchema, body);
    if (validated.errors) {
      httpResponseError(res, {
        ...userStatus.VALIDATION_ERROR,
        data: validated.errors,
      });
      return;
    }

    const user = await userServices.createUser(validated);
    httpResponse(res, generalStatus.SUCCESS, userDto.toDTO(user));
  } catch (error) {
    httpResponseError(res, error);
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      httpResponseError(res, generalStatus.BAD_REQUEST);
      return;
    }

    const user = await userServices.getUserById(id);
    if (!user) {
      httpResponseError(res, generalStatus.NOT_FOUND);
      return;
    }
    httpResponse(res, generalStatus.SUCCESS, userDto.toDTO(user));
  } catch (error) {
    httpResponseError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    if (!isValidObjectId(id)) {
      httpResponseError(res, generalStatus.BAD_REQUEST);
      return;
    }

    const validated = validateSchema(updateUserSchema, body);
    if (validated.errors) {
      httpResponseError(res, {
        ...userStatus.VALIDATION_ERROR,
        data: validated.errors,
      });
      return;
    }

    if (!Object.keys(validated).length) {
      httpResponseError(res, userStatus.NOTHING_TO_UPDATE);
      return;
    }

    const user = await userServices.updateUser(id, validated);
    if (!user) {
      httpResponseError(res, generalStatus.NOT_FOUND);
      return;
    }
    httpResponse(res, generalStatus.SUCCESS, userDto.toDTO(user));
  } catch (error) {
    httpResponseError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      httpResponseError(res, generalStatus.BAD_REQUEST);
      return;
    }

    const deleted = await userServices.deleteUser(id);
    if (!deleted) {
      httpResponseError(res, generalStatus.NOT_FOUND);
      return;
    }
    httpResponse(res, userStatus.DELETED);
  } catch (error) {
    httpResponseError(res, error);
  }
};

const getProfile = async (req, res) => {
  try {
    const { id } = req.user;

    const user = await userServices.getUserById(id);
    if (!user) {
      httpResponseError(res, generalStatus.NOT_FOUND);
      return;
    }
    httpResponse(res, generalStatus.SUCCESS, userDto.toDTO(user));
  } catch (error) {
    httpResponseError(res, error);
  }
};

export { createUser, getUser, updateUser, deleteUser, getProfile };
