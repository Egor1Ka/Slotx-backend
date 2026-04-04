const toString = (id) => id.toString();

const toStaffDto = (user, position, membership) => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  position: position ? position.name : null,
  bio: membership ? membership.bio || null : null,
  orgId: membership ? membership.orgId.toString() : null,
  locationIds: membership ? membership.locationIds.map(toString) : [],
});

const toOrgStaffDto = (user, position, bookingCount, status, membership) => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  position: position ? position.name : null,
  bio: membership ? membership.bio || null : null,
  bookingCount,
  status: status || "active",
});

export { toStaffDto, toOrgStaffDto };
