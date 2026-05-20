import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.zod);

export default function ZodSchemaGeneratorPage() {
  return renderToolPage(TOOL_PAGES.zod);
}
