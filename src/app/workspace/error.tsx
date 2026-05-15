"use client";

import { useEffect } from "react";
import { TerminalSquare } from "lucide-react";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#080808] text-[#ffb4ab]">
      <div className="max-w-md space-y-6 text-center">
        <TerminalSquare className="mx-auto size-16" />
        <h2 className="text-2xl font-bold uppercase tracking-tight">Workspace Failure</h2>
        <p className="text-sm leading-relaxed text-[#d9c2b6]">
          A critical error occurred in the terminal environment.
          <br />
          Technical details:{" "}
          <code className="bg-[#121212] px-1">{error.message || "Unknown error"}</code>
        </p>
        <button
          onClick={() => reset()}
          className="rounded bg-[#C07040] px-6 py-2 text-sm font-bold uppercase text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Reset Terminal
        </button>
      </div>
    </div>
  );
}
