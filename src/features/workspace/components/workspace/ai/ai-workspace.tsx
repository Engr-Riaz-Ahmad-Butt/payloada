"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { CodePreview } from "../shared";

export function AiWorkspace({
  source,
  setSource,
  onCopy,
}: {
  source: string;
  setSource: React.Dispatch<React.SetStateAction<string>>;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleRun = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "explain", json: source, question }),
      });
      const data = await res.json();
      setResult(data.result || data.error || "No result");
    } catch (err) {
      setResult("Error contacting AI service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-full min-h-0 gap-[0.5px] bg-ui-border xl:grid-cols-2">
      <section className="flex min-h-0 flex-col bg-[#080808]">
        <div className="flex items-center justify-between border-b-[0.5px] border-ui-border bg-[#171717]/60 px-4 py-4 sm:px-5">
          <h2 className="text-[14px] font-medium text-[#E8EAF0]">AI Assistant</h2>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask the assistant about this JSON..."
            className="w-full min-h-[120px] resize-none rounded-[8px] border-[0.5px] border-ui-border bg-[#0A0A0A] px-3 py-3 font-mono text-[13px] text-[#f5f1ea] outline-none"
          />

          <div className="flex gap-3">
            <Button onClick={handleRun} disabled={loading}>
              {loading ? "Running…" : "Ask AI"}
            </Button>
            <Button
              onClick={() => {
                setSource(result || "");
              }}
              disabled={!result}
            >
              Send to editor
            </Button>
            <Button
              onClick={() => {
                void onCopy(result || "");
              }}
              disabled={!result}
            >
              Copy result
            </Button>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-col bg-[#0A0A0A] p-4 sm:p-5">
        <h3 className="mb-3 text-[13px] font-medium text-[#E8EAF0]">Assistant output</h3>
        <div className="flex-1 overflow-auto">
          <CodePreview value={result || "Ask a question to get started"} />
        </div>
      </section>
    </div>
  );
}

export default AiWorkspace;
