const toString = (id) => id.toString();

const toStaffDto = (user, position, membership) => ({
  id: user.id,
  name: (membership && membership.displayName) || user.name,
  displayName: membership ? membership.displayName || null : null,
  avatar: user.avatar,
  position: position ? position.name : null,
  bio: membership ? membership.bio || null : null,
  orgId: membership ? membership.orgId.toString() : null,
  locationIds: membership ? membership.locationIds.map(toString) : [],
});

const toOrgStaffDto = (user, position, bookingCount, status, membership) => ({
  id: user.id,
  name: (membership && membership.displayName) || user.name,
  displayName: membership ? membership.displayName || null : null,
  avatar: user.avatar,
  position: position ? position.name : null,
  positionId: membership && membership.positionId ? membership.positionId.toString() : null,
  bio: membership ? membership.bio || null : null,
  bookingCount,
  status: status || "active",
});

export { toStaffDto, toOrgStaffDto };
