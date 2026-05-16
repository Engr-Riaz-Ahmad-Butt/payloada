import { useSyncExternalStore } from "react";

/**
 * Hook to listen for media query matches.
 * @param query The media query string (e.g., "(min-width: 768px)").
 * @returns Whether the query matches.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => undefined;
      }

      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);

      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    () => {
      if (typeof window === "undefined") {
        return false;
      }

      return window.matchMedia(query).matches;
    },
    () => false,
  );
}
