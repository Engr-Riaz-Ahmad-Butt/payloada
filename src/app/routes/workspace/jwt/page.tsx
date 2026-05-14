import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import WorkspaceHeader from "@/components/workspace/WorkspaceHeader";
import JwtDecoder from "@/components/workspace/JwtDecoder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder — jsonLines Pro Workspace",
  description:
    "Decode, inspect, and verify JSON Web Tokens instantly in the jsonLines terminal-inspired workspace.",
};

export default function JwtDecoderPage() {
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#080808", color: "#F5F1EA" }}
    >
      {/* Left Sidebar */}
      <WorkspaceSidebar active="JWT Decoder" />

      {/* Main column */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Top Header */}
        <WorkspaceHeader />

        {/* JWT Decoder split pane */}
        <main className="flex flex-grow overflow-hidden">
          <JwtDecoder />
        </main>
      </div>
    </div>
  );
}
