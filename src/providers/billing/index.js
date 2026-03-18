import creem from "./creem.js";

const PROVIDERS = {
  creem,
};

const getProvider = (name) => PROVIDERS[name];

export default { PROVIDERS, getProvider };
