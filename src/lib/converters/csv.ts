import Papa from "papaparse";
import type { JsonValue } from "@/types/json";

/**
 * Generates a CSV string from a JSON array of objects.
 */
export function generateCsvOutput(value: JsonValue): string {
  const tableData = getTableData(value);
  if (!tableData) {
    return "";
  }

  return Papa.unparse(tableData.rows);
}

function getTableData(value: JsonValue | null) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const rows = value.filter(
    (item): item is Record<string, JsonValue> =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );

  if (rows.length !== value.length) {
    return null;
  }

  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return { columns, rows };
}
