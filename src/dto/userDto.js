const toDTO = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  email: doc.email,
  avatar: doc.avatar,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default { toDTO };
