import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://payloada.dev";
  const toolPages = [
    "json-formatter",
    "json-validator",
    "jwt-decoder",
    "json-diff",
    "json-to-typescript",
    "zod-schema-generator",
    "json-graph-visualizer",
    "json-to-csv",
    "json-schema-generator",
    "mock-json-generator",
  ];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/workspace`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...toolPages.map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
