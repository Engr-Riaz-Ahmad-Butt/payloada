import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.csv);

export default function JsonToCsvPage() {
  return renderToolPage(TOOL_PAGES.csv);
}
