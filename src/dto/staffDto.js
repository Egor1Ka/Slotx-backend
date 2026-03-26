const toString = (id) => id.toString();

const toStaffDto = (user, position, membership) => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  position: position ? position.name : null,
  orgId: membership ? membership.orgId.toString() : null,
  locationIds: membership ? membership.locationIds.map(toString) : [],
});

const toOrgStaffDto = (user, position, bookingCount) => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  position: position ? position.name : null,
  bookingCount,
});

export { toStaffDto, toOrgStaffDto };
