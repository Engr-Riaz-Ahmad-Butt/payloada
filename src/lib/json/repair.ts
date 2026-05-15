/**
 * Safely repairs common JSON syntax issues like trailing commas.
 * @param source The raw JSON string.
 * @returns A potentially repaired JSON string.
 */
export function repairJsonInput(source: string): string {
  // Fix trailing commas in objects and arrays
  return source.replace(/,\s*([}\]])/g, "$1");
}
