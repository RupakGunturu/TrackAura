import { normalizeProjectIds } from "@/lib/dashboardFilters";

const ACTIVE_PROJECTS_KEY = "trackaura.activeProjectIds";
const PROJECTS_CHANGED_EVENT = "trackaura:projects-changed";

export function getStoredProjectIds(): string {
  if (typeof window === "undefined") return "";
  return normalizeProjectIds(window.localStorage.getItem(ACTIVE_PROJECTS_KEY) ?? "");
}

export function getInitialProjectIds(fallback: string): string {
  return getStoredProjectIds() || normalizeProjectIds(fallback);
}

export function setStoredProjectIds(projectIds: string): string {
  const normalized = normalizeProjectIds(projectIds);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACTIVE_PROJECTS_KEY, normalized);
    window.dispatchEvent(new CustomEvent(PROJECTS_CHANGED_EVENT, { detail: normalized }));
  }
  return normalized;
}

export function getStoredProjectIdList(): string[] {
  const normalized = getStoredProjectIds();
  if (!normalized) return [];
  return normalized.split(",").filter(Boolean);
}

export function subscribeToProjectSelection(onChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ACTIVE_PROJECTS_KEY) {
      onChange();
    }
  };

  const handleProjectChange = () => {
    onChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(PROJECTS_CHANGED_EVENT, handleProjectChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(PROJECTS_CHANGED_EVENT, handleProjectChange);
  };
}
