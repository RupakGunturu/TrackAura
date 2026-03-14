export const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days", "Custom"] as const;
export const devices = ["All Devices", "Web", "Mobile", "Tablet"] as const;
export const userTypes = ["All Users", "Free", "Pro", "Enterprise"] as const;

export type DashboardDateRange = (typeof dateRanges)[number];
export type DashboardDevice = (typeof devices)[number];
export type DashboardUserType = (typeof userTypes)[number];

export interface DashboardFilters {
  dateRange: DashboardDateRange;
  device: DashboardDevice;
  userType: DashboardUserType;
  projectIds: string;
}

export function normalizeProjectIds(projectIds: string) {
  return projectIds
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .join(",");
}

export function getProjectLabel(projectIds: string) {
  const ids = normalizeProjectIds(projectIds).split(",").filter(Boolean);
  if (ids.length === 0) return "No project selected";
  if (ids.length === 1) return `Project: ${ids[0]}`;
  return `${ids.length} projects selected`;
}

export function getDateRangeBounds(dateRange: DashboardDateRange) {
  const end = new Date();
  const start = new Date(end);

  if (dateRange === "Last 7 days") {
    start.setDate(start.getDate() - 7);
  } else if (dateRange === "Last 30 days") {
    start.setDate(start.getDate() - 30);
  } else if (dateRange === "Last 90 days") {
    start.setDate(start.getDate() - 90);
  } else {
    start.setDate(start.getDate() - 30);
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
