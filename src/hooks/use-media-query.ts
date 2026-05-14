import { useEffect, useState } from "react";

/**
 * Hook to listen for media query matches.
 * @param query The media query string (e.g., "(min-width: 768px)").
 * @returns Whether the query matches.
 */
export function useMediaQuery(query: string): boolean {
  const getInitialMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState(getInitialMatch);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
