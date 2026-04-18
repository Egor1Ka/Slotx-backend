const BOOKING_STATUS_ACTIONS = {
  HIDE_FROM_SCHEDULE: "hideFromSchedule",
};

const VALID_ACTIONS = Object.values(BOOKING_STATUS_ACTIONS);

const STATUS_COLORS = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "gray",
  "teal",
];

const DEFAULT_STATUSES = [
  {
    label: "status_unconfirmed",
    color: "yellow",
    actions: [],
    isDefault: true,
    order: 0,
  },
  {
    label: "status_confirmed",
    color: "blue",
    actions: [],
    isDefault: true,
    order: 1,
  },
  {
    label: "status_paid",
    color: "green",
    actions: [],
    isDefault: true,
    order: 2,
  },
  {
    label: "status_cancelled",
    color: "red",
    actions: [BOOKING_STATUS_ACTIONS.HIDE_FROM_SCHEDULE],
    isDefault: true,
    order: 3,
  },
];

export {
  BOOKING_STATUS_ACTIONS,
  VALID_ACTIONS,
  STATUS_COLORS,
  DEFAULT_STATUSES,
};
