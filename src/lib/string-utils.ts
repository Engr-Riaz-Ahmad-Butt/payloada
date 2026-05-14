import type { JsonValue } from "@/types/json";

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(value: string): string {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Renders a JSON value as a string for display purposes.
 */
export function renderJsonValue(value: JsonValue): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}
