import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.mock);

export default function MockJsonGeneratorPage() {
  return renderToolPage(TOOL_PAGES.mock);
}
