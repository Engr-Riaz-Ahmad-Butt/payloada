export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonContainer = JsonValue[] | { [key: string]: JsonValue };

export type JsonParseSuccess = {
  valid: true;
  data: JsonValue;
};

export type JsonParseFailure = {
  valid: false;
  error: string;
  line?: number;
  column?: number;
};

export type JsonParseResult = JsonParseSuccess | JsonParseFailure;

export type JsonStats = {
  bytes: number;
  keys: number;
  objects: number;
  arrays: number;
  primitives: number;
  maxDepth: number;
};
