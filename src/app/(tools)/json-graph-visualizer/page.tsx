import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.graph);

export default function JsonGraphVisualizerPage() {
  return renderToolPage(TOOL_PAGES.graph);
}
