const toOrgDto = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  logo: doc.settings ? doc.settings.logoUrl : null,
});

export { toOrgDto };
