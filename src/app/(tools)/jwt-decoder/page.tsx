import { TOOL_PAGES, createToolMetadata, renderToolPage } from "@/lib/tool-pages";

export const metadata = createToolMetadata(TOOL_PAGES.jwt);

export default function JwtDecoderToolPage() {
  return renderToolPage(TOOL_PAGES.jwt);
}
