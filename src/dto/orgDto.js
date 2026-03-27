const toOrgDto = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  logo: doc.settings ? doc.settings.logoUrl : null,
});

const toOrgListItemDto = (org, membership) => ({
  id: org._id.toString(),
  name: org.name,
  logo: org.settings ? org.settings.logoUrl || null : null,
  role: membership.role,
  status: membership.status,
});

export { toOrgDto, toOrgListItemDto };
