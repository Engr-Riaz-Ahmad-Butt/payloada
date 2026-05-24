"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqSection({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-2.5 sm:gap-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={item.question}
            className="rounded-[12px] border-[0.5px] border-ui-border bg-surface-elevated px-4 py-3.5 text-left transition-colors hover:border-[#2A2F42] sm:px-4.5 sm:py-4 md:px-5 md:py-4.5"
          >
            <button
              type="button"
              onClick={() => setOpenIndex((current) => (current === index ? null : index))}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <h3
                style={{
                  color: "var(--color-text-primary)",
                  fontSize: "clamp(15px, 1.8vw, 17px)",
                  lineHeight: "22px",
                  fontWeight: 600,
                }}
              >
                {item.question}
              </h3>
              <ChevronDown
                className="h-4.5 w-4.5 shrink-0 transition-transform"
                style={{
                  color: "#C07040",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {isOpen ? (
              <p
                className="mt-2.5"
                style={{ color: "var(--color-text-secondary)", fontSize: "14px", lineHeight: "24px" }}
              >
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
