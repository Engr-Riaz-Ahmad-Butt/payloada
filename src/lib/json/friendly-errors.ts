const FRIENDLY_ERROR_MAP: Array<{
  matcher: RegExp;
  explanation: string;
}> = [
  {
    matcher: /unexpected token/i,
    explanation:
      "There is an unexpected character in the JSON. This often happens after a trailing comma or a missing quote.",
  },
  {
    matcher: /unexpected end of json input/i,
    explanation:
      "The JSON ends too early. A bracket, brace, string quote, or value is probably missing.",
  },
  {
    matcher: /expected property name/i,
    explanation:
      "Object keys must be wrapped in double quotes. JSON does not allow unquoted property names.",
  },
];

export function getFriendlyJsonError(message: string) {
  const match = FRIENDLY_ERROR_MAP.find(({ matcher }) => matcher.test(message));
  return (
    match?.explanation ??
    "The JSON is invalid. Review the highlighted area for missing quotes, commas, or brackets."
  );
}
