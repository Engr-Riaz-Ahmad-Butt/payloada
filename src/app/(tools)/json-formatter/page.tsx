import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.formatter);

export default function JsonFormatterPage() {
  return renderToolPage(TOOL_PAGES.formatter);
}
