/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

import { useTheme } from "@/hooks/use-theme";

const navLinks = [
  { label: "Workspace", href: "/workspace", active: true },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-ui-border bg-obsidian-base/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-300 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5 lg:gap-8">
          <Link href="/" className="flex items-center no-underline">
            <img src="/payloada-logo-full.svg" alt="Payloada" className="h-10 w-auto" />
          </Link>

          <div className="hidden items-center gap-5 lg:flex xl:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-semibold tracking-[0.04em] transition-colors"
                style={{
                  color: link.active ? "#ffb68e" : "var(--color-on-surface-variant)",
                  borderBottom: link.active ? "2px solid #C07040" : "none",
                  paddingBottom: link.active ? "4px" : "0",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex lg:gap-4">
          <button
            type="button"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
            className="inline-flex h-10 w-10 items-center justify-center rounded border border-ui-border bg-surface-elevated text-on-surface-variant transition-colors hover:border-ui-border-hover hover:text-text-primary"
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((current) => !current)}
          className="inline-flex h-10 w-10 items-center justify-center rounded border border-ui-border bg-surface-elevated text-on-surface-variant transition-colors hover:border-ui-border-hover hover:text-text-primary lg:hidden"
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
                className="rounded-sm border border-ui-border bg-surface-elevated px-4 py-3 text-sm font-semibold tracking-[0.02em] text-on-surface-variant transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="inline-flex h-11 items-center justify-center rounded-sm border border-ui-border bg-surface-elevated text-on-surface-variant transition-colors hover:border-ui-border-hover hover:text-text-primary"
            >
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
