import Organization from "../models/Organization.js";
import { toOrgDto } from "../dto/orgDto.js";

const getOrgBySlug = async (slug) => {
  const doc = await Organization.findOne({ slug });
  if (!doc) return null;
  return toOrgDto(doc);
};

const getOrgById = async (id) => {
  const doc = await Organization.findById(id);
  if (!doc) return null;
  return toOrgDto(doc);
};

export { getOrgBySlug, getOrgById };
