"use client";

import Link from "next/link";
import { Bell, CircleUserRound, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Workspace", href: "#", active: true },
  { label: "Tools", href: "#" },
  { label: "API", href: "#" },
  { label: "Docs", href: "#" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-ui-border bg-obsidian-base/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-300 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5 lg:gap-8">
          <span
            className="text-xl font-black tracking-tight sm:text-2xl"
            style={{ color: "#C07040", fontFamily: "Inter, sans-serif" }}
          >
            jsonLines
          </span>

          <div className="hidden items-center gap-5 lg:flex xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-widest transition-colors"
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

        <div className="hidden items-center gap-3 sm:flex lg:gap-4">
          <button
            className="rounded px-3 py-2 text-xs font-semibold uppercase tracking-widest transition-all hover:brightness-110 active:scale-90 sm:px-4"
            style={{
              backgroundColor: "#C07040",
              color: "#F5F1EA",
              letterSpacing: "0.05em",
            }}
            type="button"
          >
            Deploy
          </button>
          <div className="ml-1 hidden items-center gap-2 lg:flex" style={{ color: "#d9c2b6" }}>
            <Bell className="size-5 cursor-pointer transition-colors hover:text-[#ffb68e]" />
            <CircleUserRound className="size-5 cursor-pointer transition-colors hover:text-[#ffb68e]" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-ui-border bg-surface-elevated text-on-surface-variant transition-colors hover:text-text-primary lg:hidden"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-ui-border bg-surface px-4 py-4 lg:hidden">
          <div className="mx-auto flex w-full max-w-300 flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-sm border border-ui-border bg-surface-elevated px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
              <button
                className="rounded-sm px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#F5F1EA] transition-all hover:brightness-110"
                type="button"
                style={{ backgroundColor: "#C07040" }}
              >
                Deploy
              </button>
              <div className="flex items-center gap-3 text-on-surface-variant sm:justify-end">
                <Bell className="size-5" />
                <CircleUserRound className="size-5" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
