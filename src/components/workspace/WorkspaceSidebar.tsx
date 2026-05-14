"use client";

import Link from "next/link";
import { useState } from "react";

import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from "@/constants/app";

type SidebarProps = {
  active: string;
};

export default function WorkspaceSidebar({ active }: SidebarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav
      className="flex flex-col h-screen py-6 px-4 z-50 flex-shrink-0"
      style={{
        width: "260px",
        borderRight: "1px solid #262626",
        backgroundColor: "#121212",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8">
        <span className="material-symbols-outlined text-[28px]" style={{ color: "#C07040" }}>
          data_object
        </span>
        <div>
          <h1
            className="font-bold leading-none"
            style={{ color: "#C07040", fontSize: "20px", fontWeight: 800 }}
          >
            jsonLines
          </h1>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.05em",
              fontWeight: 600,
              color: "#d9c2b6",
              textTransform: "uppercase",
            }}
          >
            Pro Workspace
          </p>
        </div>
      </div>

      {/* New Document CTA */}
      <button
        className="flex items-center justify-center gap-1 w-full mb-8 py-2 px-4 transition-colors"
        style={{
          backgroundColor: "#C07040",
          color: "#F5F1EA",
          borderRadius: "0.125rem",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#cf7c4b";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#C07040";
        }}
      >
        <span className="material-symbols-outlined text-[16px]">add</span>
        New Document
      </button>

      {/* Main Nav */}
      <ul className="flex flex-col gap-1 flex-grow">
        {MAIN_NAV_ITEMS.map((item) => {
          const isActive = item.label === active;
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-3 py-2 px-4 transition-colors"
                style={{
                  borderRadius: "0.125rem",
                  borderRight: isActive ? "2px solid #C07040" : "2px solid transparent",
                  backgroundColor: isActive ? "#2a2a2a" : "transparent",
                  color: isActive ? "#ffb68e" : hovered === item.label ? "#F5F1EA" : "#d9c2b6",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer Nav */}
      <ul className="flex flex-col gap-1 pt-4 mt-auto" style={{ borderTop: "1px solid #262626" }}>
        {FOOTER_NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex items-center gap-3 py-2 px-4 transition-colors"
              style={{
                borderRadius: "0.125rem",
                color: hovered === item.label ? "#F5F1EA" : "#d9c2b6",
                fontSize: "16px",
                lineHeight: "24px",
                fontWeight: 500,
              }}
              onMouseEnter={() => setHovered(item.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* User Profile */}
      <div className="flex items-center gap-2 px-4 mt-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
          style={{ backgroundColor: "#201f1f", border: "1px solid #262626" }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: "#d9c2b6" }}>
            account_circle
          </span>
        </div>
        <span
          className="truncate"
          style={{ fontSize: "14px", lineHeight: "20px", color: "#d9c2b6" }}
        >
          dev@workspace.local
        </span>
      </div>
    </nav>
  );
}
