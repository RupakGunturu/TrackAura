import { useCallback, useMemo, useSyncExternalStore } from "react";
import { normalizeProjectIds } from "@/lib/dashboardFilters";
import {
  getStoredProjectIds,
  setStoredProjectIds,
  subscribeToProjectSelection,
} from "@/lib/projectSelection";

export function useActiveProjectIds(fallbackProjectIds: string) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    return subscribeToProjectSelection(onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => getStoredProjectIds(), []);

  const storedProjectIds = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const activeProjectIds = useMemo(() => {
    const normalizedFallback = normalizeProjectIds(fallbackProjectIds);
    return storedProjectIds || normalizedFallback;
  }, [fallbackProjectIds, storedProjectIds]);

  const setActiveProjectIds = useCallback((projectIds: string) => {
    return setStoredProjectIds(projectIds);
  }, []);

  return {
    activeProjectIds,
    setActiveProjectIds,
  };
}
