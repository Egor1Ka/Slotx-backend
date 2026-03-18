import google from "./google.js";

const PROVIDERS = {
  google,
};

const getProvider = (name) => PROVIDERS[name];

export default { PROVIDERS, getProvider };
