import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.typescript);

export default function JsonToTypeScriptPage() {
  return renderToolPage(TOOL_PAGES.typescript);
}
