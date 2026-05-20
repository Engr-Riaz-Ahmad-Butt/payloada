import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.schema);

export default function JsonSchemaGeneratorPage() {
  return renderToolPage(TOOL_PAGES.schema);
}
