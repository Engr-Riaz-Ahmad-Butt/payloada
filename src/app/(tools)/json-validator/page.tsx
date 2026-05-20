import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.validator);

export default function JsonValidatorPage() {
  return renderToolPage(TOOL_PAGES.validator);
}
