const toDTO = (doc) => {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return {
    id: data._id?.toString(),
    name: data.name,
    email: data.email,
    avatar: data.avatar,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};

export default { toDTO };
