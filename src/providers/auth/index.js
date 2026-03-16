import google from "./auth/google.js";

const PROVIDERS = {
  google,
};

const getProvider = (name) => PROVIDERS[name];

export default { PROVIDERS, getProvider };
