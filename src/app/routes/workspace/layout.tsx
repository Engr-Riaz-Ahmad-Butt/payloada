import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSONKit Pro Workspace",
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  // Override the root layout flex column for the workspace — it needs h-screen overflow-hidden
  return <>{children}</>;
}
