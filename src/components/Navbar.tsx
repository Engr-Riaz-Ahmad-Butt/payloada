import Link from "next/link";

const navLinks = [
  { label: "Workspace", href: "#", active: true },
  { label: "Tools", href: "#" },
  { label: "API", href: "#" },
  { label: "Docs", href: "#" },
];

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-40 w-full border-b flex items-center justify-between h-16 px-8"
      style={{
        backgroundColor: "#080808",
        borderColor: "#262626",
      }}
    >
      {/* Left: Logo + Links */}
      <div className="flex items-center gap-8">
        <span
          className="text-2xl font-black tracking-tight"
          style={{ color: "#C07040", fontFamily: "Inter, sans-serif" }}
        >
          jsonLines
        </span>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-semibold tracking-widest uppercase transition-colors"
              style={{
                color: link.active ? "#ffb68e" : "#d9c2b6",
                borderBottom: link.active ? "2px solid #C07040" : "none",
                paddingBottom: link.active ? "4px" : "0",
                fontFamily: "Inter, sans-serif",
                letterSpacing: "0.05em",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button
          className="text-xs font-semibold uppercase tracking-widest transition-colors hover:opacity-80 active:scale-95"
          style={{ color: "#d9c2b6", letterSpacing: "0.05em" }}
        >
          Share
        </button>
        <button
          className="px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded transition-all hover:brightness-110 active:scale-90"
          style={{
            backgroundColor: "#C07040",
            color: "#F5F1EA",
            letterSpacing: "0.05em",
          }}
        >
          Deploy
        </button>
        <div className="flex items-center gap-2 ml-2" style={{ color: "#d9c2b6" }}>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-[#ffb68e] text-[20px]">
            notifications
          </span>
          <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-[#ffb68e] text-[20px]">
            account_circle
          </span>
        </div>
      </div>
    </nav>
  );
}
