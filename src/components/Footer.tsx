import Link from "next/link";

const footerLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Changelog", href: "#" },
  { label: "Status", href: "#" },
];

export default function Footer() {
  return (
    <footer
      className="w-full border-t mt-auto py-4"
      style={{ backgroundColor: "#080808", borderColor: "#262626" }}
    >
      <div
        className="flex justify-between items-center px-8 w-full max-w-[1200px] mx-auto"
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", lineHeight: "18px" }}
      >
        {/* Left */}
        <div className="flex items-center gap-4">
          <span className="font-bold" style={{ color: "#C07040" }}>
            JSONKit
          </span>
          <span style={{ color: "#d9c2b6" }}>© 2024 JSONKit Terminal. All rights reserved.</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors opacity-80 hover:opacity-100"
              style={{ color: "#d9c2b6" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
