"use client";

import { useState } from "react";
import Link from "next/link";

export default function WorkspaceHeader() {
  const [searchVal, setSearchVal] = useState("");

  return (
    <header
      className="flex justify-between items-center w-full h-16 sticky top-0 z-40 flex-shrink-0"
      style={{
        backgroundColor: "#080808",
        borderBottom: "1px solid #262626",
        padding: "0 32px",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left: Breadcrumbs + Search */}
      <div className="flex items-center gap-6">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-1"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#d9c2b6" }}
        >
          <span className="hover:text-[#F5F1EA] cursor-pointer transition-colors">Workspace</span>
          <span style={{ color: "#262626" }}>/</span>
          <span className="font-bold" style={{ color: "#F5F1EA" }}>
            MyProject.json
          </span>
        </div>

        {/* Search */}
        <div className="relative w-64 group">
          <span
            className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 transition-colors text-[16px]"
            style={{ color: searchVal ? "#C07040" : "#d9c2b6" }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search keys or values (Cmd+K)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full py-1 pl-7 pr-3 transition-all outline-none"
            style={{
              backgroundColor: "#121212",
              border: "1px solid #262626",
              borderRadius: "0.125rem",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              color: "#F5F1EA",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#C07040";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#262626";
            }}
          />
        </div>
      </div>

      {/* Right: Nav + Actions */}
      <div className="flex items-center gap-4">
        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-4">
          {["Workspace", "Tools", "API", "Docs"].map((link) => (
            <Link
              key={link}
              href="#"
              className="transition-all pb-1"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#d9c2b6",
                borderBottom: "2px solid transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#ffb68e";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = "#d9c2b6";
              }}
            >
              {link}
            </Link>
          ))}
        </nav>

        {/* Notifications */}
        <button
          className="p-1 rounded transition-colors"
          style={{ color: "#d9c2b6" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#F5F1EA";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#121212";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#d9c2b6";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        {/* Divider */}
        <div style={{ width: "1px", height: "24px", backgroundColor: "#262626" }} />

        {/* Share + Deploy */}
        <button
          className="px-4 py-1 border transition-colors"
          style={{
            borderColor: "#262626",
            color: "#F5F1EA",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            borderRadius: "0.125rem",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#121212";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          Share
        </button>
        <button
          className="px-4 py-1 transition-colors"
          style={{
            backgroundColor: "#C07040",
            color: "#F5F1EA",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            borderRadius: "0.125rem",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#cf7c4b";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#C07040";
          }}
        >
          Deploy
        </button>
      </div>
    </header>
  );
}
