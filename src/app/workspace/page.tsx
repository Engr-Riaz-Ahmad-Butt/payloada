import type { Metadata } from "next";

import { LiveJsonWorkspace } from "@/features/workspace/components/live-json-workspace";

export const metadata: Metadata = {
  title: "Workspace - Payloada",
  description:
    "A privacy-first JSON workspace for formatting, validation, decoding, and comparison.",
};

export default function WorkspacePage() {
  return <LiveJsonWorkspace />;
}
