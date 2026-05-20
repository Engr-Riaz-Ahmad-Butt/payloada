export const APP_NAME = "JSONova";
export const APP_TAGLINE = "Privacy-first JSON debugging workspace";
export const APP_DESCRIPTION =
  "Format, validate, inspect, and understand JSON with a workflow built for developers.";

export const MVP_FEATURES = [
  "Formatter and minifier",
  "Validation with friendly errors",
  "Tree exploration with JSONPath",
  "Search, file import, and downloads",
  "Stats, theme controls, and privacy-first defaults",
] as const;

export const APP_ROUTES = {
  HOME: "/",
  WORKSPACE: "/workspace",
  JWT_DECODER: "/workspace/jwt",
  DIFF: "/workspace/diff",
  CONVERTERS: "/workspace/convert",
  HISTORY: "/workspace/history",
  SETTINGS: "/workspace/settings",
  SUPPORT: "/workspace/support",
} as const;

export const MAIN_NAV_ITEMS = [
  { icon: "code", label: "Editor", href: APP_ROUTES.WORKSPACE },
  { icon: "lock_open", label: "JWT Decoder", href: APP_ROUTES.JWT_DECODER },
  { icon: "difference", label: "JSON Diff", href: APP_ROUTES.DIFF },
  { icon: "transform", label: "Converters", href: APP_ROUTES.CONVERTERS },
  { icon: "history", label: "History", href: APP_ROUTES.HISTORY },
] as const;

export const FOOTER_NAV_ITEMS = [
  { icon: "settings", label: "Settings", href: APP_ROUTES.SETTINGS },
  { icon: "help_outline", label: "Support", href: APP_ROUTES.SUPPORT },
] as const;
