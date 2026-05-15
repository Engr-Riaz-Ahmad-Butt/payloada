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
    <div className="grid gap-3 sm:gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;

        return (
          <button
            key={item.question}
            type="button"
            onClick={() => setOpenIndex((current) => (current === index ? null : index))}
            className="rounded border p-4 text-left transition-colors sm:p-5 md:p-6"
            style={{ borderColor: "#262626", backgroundColor: "#121212" }}
          >
            <div className="flex items-center justify-between gap-4">
              <h3
                style={{
                  color: "#F5F1EA",
                  fontSize: "clamp(16px, 2vw, 18px)",
                  lineHeight: "24px",
                  fontWeight: 600,
                }}
              >
                {item.question}
              </h3>
              <ChevronDown
                className="h-5 w-5 shrink-0 transition-transform"
                style={{
                  color: "#C07040",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </div>

            {isOpen ? (
              <p
                className="mt-3"
                style={{ color: "#d9c2b6", fontSize: "15px", lineHeight: "26px" }}
              >
                {item.answer}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
