const toOrgDto = (doc) => ({
  id: doc._id.toString(),
  name: doc.name,
  logo: doc.settings ? doc.settings.logoUrl || null : null,
  description: doc.description || null,
  address: doc.address || null,
  phone: doc.phone || null,
  website: doc.website || null,
  active: doc.active !== false,
});

const toOrgListItemDto = (org, membership) => ({
  id: org._id.toString(),
  name: org.name,
  logo: org.settings ? org.settings.logoUrl || null : null,
  role: membership.role,
  status: membership.status,
  active: org.active !== false,
});

export { toOrgDto, toOrgListItemDto };
