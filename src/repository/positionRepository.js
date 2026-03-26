import Position from "../models/Position.js";

const getPositionById = async (id) => {
  const doc = await Position.findById(id);
  if (!doc) return null;
  return { id: doc._id.toString(), name: doc.name, level: doc.level, color: doc.color };
};

export { getPositionById };
