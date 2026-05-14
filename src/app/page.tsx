import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturesSection from "@/components/FeaturesSection";
import WorkspaceMockup from "@/components/WorkspaceMockup";

export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: "#080808", color: "#F5F1EA", fontFamily: "Inter, sans-serif" }}
    >
      <Navbar />

      <main className="flex-grow flex flex-col items-center">
        {/* ── Hero Section ── */}
        <section className="w-full max-w-[1200px] px-4 md:px-8 py-16 md:py-12 flex flex-col items-center text-center mt-8">
          {/* Headline */}
          <h1
            className="max-w-3xl leading-tight mb-6"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "clamp(28px, 5vw, 48px)",
              lineHeight: "1.15",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#F5F1EA",
            }}
          >
            The JSON workspace for{" "}
            <span style={{ color: "#C07040" }}>serious developers.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="max-w-2xl mb-8"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              lineHeight: "24px",
              color: "#d9c2b6",
            }}
          >
            Experience unparalleled speed and precision in a terminal-inspired environment.
            JSONKit provides the tools you need to build, decode, and diff with absolute control.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              className="px-6 py-3 transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#C07040",
                color: "#F5F1EA",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderRadius: "0.125rem",
              }}
            >
              Get Started — It&apos;s Free
            </button>
            <button
              className="px-6 py-3 border transition-colors hover:bg-[#121212] active:scale-95 flex items-center justify-center gap-2"
              style={{
                borderColor: "#262626",
                color: "#F5F1EA",
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                borderRadius: "0.125rem",
              }}
            >
              <span className="material-symbols-outlined text-[16px]">code</span>
              View on GitHub
            </button>
          </div>

          {/* ── Animated Split Workspace Mockup ── */}
          <WorkspaceMockup />
        </section>

        {/* ── Features Section ── */}
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}
