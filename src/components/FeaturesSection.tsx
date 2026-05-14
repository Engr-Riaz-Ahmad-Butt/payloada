"use client";

const features = [
  {
    icon: "code",
    title: "Precision Editor",
    description:
      "Flawless syntax highlighting and formatting. Built on an 8pt grid logic for developers who care about the details.",
  },
  {
    icon: "lock_open",
    title: "Fast JWT Decoder",
    description:
      "Instantly decode and verify JSON Web Tokens without ever leaving your secure workspace context.",
  },
  {
    icon: "difference",
    title: "Intelligent Diff",
    description:
      "Compare massive payloads side-by-side with sub-millisecond rendering and intelligent conflict resolution.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="w-full max-w-[1200px] px-4 md:px-8 py-12 border-t mt-16"
      style={{ borderColor: "#262626" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group flex flex-col items-start p-6 rounded border transition-colors"
            style={{
              backgroundColor: "#121212",
              borderColor: "#262626",
              borderRadius: "0.25rem",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#C07040";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#262626";
            }}
          >
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-full border flex items-center justify-center mb-4 transition-colors"
              style={{
                borderColor: "#C07040",
                backgroundColor: "#080808",
                color: "#C07040",
              }}
            >
              <span className="material-symbols-outlined text-[20px]">{feature.icon}</span>
            </div>

            {/* Title */}
            <h3
              className="mb-2 uppercase tracking-widest"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                lineHeight: "18px",
                color: "#F5F1EA",
                letterSpacing: "0.1em",
              }}
            >
              {feature.title}
            </h3>

            {/* Description */}
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                lineHeight: "20px",
                color: "#d9c2b6",
              }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
