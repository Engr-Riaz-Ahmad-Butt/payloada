const nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
const eslintConfigPrettier = require("eslint-config-prettier");

module.exports = [
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
