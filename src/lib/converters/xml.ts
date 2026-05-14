import { XMLBuilder } from "fast-xml-parser";
import type { JsonValue } from "@/types/json";

/**
 * Generates an XML string from a JSON value.
 */
export function generateXmlOutput(value: JsonValue): string {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
  });

  return builder.build({ root: value });
}
