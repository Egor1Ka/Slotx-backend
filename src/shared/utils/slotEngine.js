const buildFixedGrid = (workStart, workEnd, slotStep, duration) => {
  const candidates = [];
  const limit = workEnd - duration;
  const addCandidate = (startMin) => {
    if (startMin <= limit) candidates.push({ startMin, isExtra: false });
  };

  let current = workStart;
  while (current <= limit) {
    addCandidate(current);
    current = current + slotStep;
  }
  return candidates;
};

const isOnGrid = (startMin, workStart, slotStep) =>
  (startMin - workStart) % slotStep === 0;

const toBookingEnd = (booking) => booking.startMin + booking.duration;

const buildOptimalGrid = (workStart, workEnd, slotStep, duration, bookings) => {
  const fixed = buildFixedGrid(workStart, workEnd, slotStep, duration);
  const limit = workEnd - duration;

  const notOnGrid = (bookingEnd) => !isOnGrid(bookingEnd, workStart, slotStep);
  const withinLimit = (bookingEnd) => bookingEnd <= limit;
  const toExtraSlot = (bookingEnd) => ({ startMin: bookingEnd, isExtra: true });

  const extraSlots = bookings
    .map(toBookingEnd)
    .filter(notOnGrid)
    .filter(withinLimit)
    .map(toExtraSlot);

  const merged = [...fixed, ...extraSlots];
  const byStartMin = (a, b) => a.startMin - b.startMin;
  return [...merged].sort(byStartMin);
};

const buildDynamicGrid = (workStart, workEnd, slotStep, duration, bookings) => {
  const limit = workEnd - duration;
  const byStartMin = (a, b) => a.startMin - b.startMin;
  const sorted = [...bookings].sort(byStartMin);

  const candidates = [];
  let segmentStart = workStart;

  const addSegmentSlots = (from, until) => {
    let current = from;
    while (current <= limit && current + duration <= until) {
      candidates.push({ startMin: current, isExtra: false });
      current = current + slotStep;
    }
  };

  const processBooking = (booking) => {
    const bookingStart = booking.startMin;
    const bookingEnd = toBookingEnd(booking);
    addSegmentSlots(segmentStart, bookingStart);
    segmentStart = bookingEnd;
  };

  sorted.forEach(processBooking);
  addSegmentSlots(segmentStart, workEnd);

  return candidates;
};

const GRID_BUILDERS = {
  fixed: (workStart, workEnd, slotStep, duration) =>
    buildFixedGrid(workStart, workEnd, slotStep, duration),
  optimal: (workStart, workEnd, slotStep, duration, bookings) =>
    buildOptimalGrid(workStart, workEnd, slotStep, duration, bookings),
  dynamic: (workStart, workEnd, slotStep, duration, bookings) =>
    buildDynamicGrid(workStart, workEnd, slotStep, duration, bookings),
};

const hasConflict = (slotStart, duration, booking) =>
  slotStart < booking.startMin + booking.duration &&
  slotStart + duration > booking.startMin;

const isConflicting = (duration, bookings) => (slot) =>
  bookings.some((booking) => hasConflict(slot.startMin, duration, booking));

const isExpired = (nowMin, minNotice) => (slot) =>
  slot.startMin < nowMin + minNotice;

const getAvailableSlots = ({
  workStart,
  workEnd,
  duration,
  slotStep,
  slotMode = "fixed",
  bookings = [],
  minNotice = 0,
  nowMin = 0,
}) => {
  if (duration > workEnd - workStart) return [];

  const buildGrid = GRID_BUILDERS[slotMode];
  const candidates = buildGrid(workStart, workEnd, slotStep, duration, bookings);

  const conflicting = isConflicting(duration, bookings);
  const expired = isExpired(nowMin, minNotice);

  const isAvailable = (slot) => !conflicting(slot) && !expired(slot);

  return candidates.filter(isAvailable);
};

export { getAvailableSlots };
