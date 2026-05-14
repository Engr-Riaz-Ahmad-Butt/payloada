import { LiveJsonWorkspace } from "@/features/workspace/components/live-json-workspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace — JSONKit Pro",
  description: "Advanced JSON workspace for serious developers.",
};

export default function WorkspacePage() {
  return <LiveJsonWorkspace />;
}
