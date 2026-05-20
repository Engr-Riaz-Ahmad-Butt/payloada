import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.diff);

export default function JsonDiffToolPage() {
  return renderToolPage(TOOL_PAGES.diff);
}
