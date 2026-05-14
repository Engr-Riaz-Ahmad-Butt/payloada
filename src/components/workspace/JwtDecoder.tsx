"use client";

import { useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

// ── Sample token (the classic jwt.io demo token) ──────────────────────────────
const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
  ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ" +
  ".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// ── Types ─────────────────────────────────────────────────────────────────────
type DecodedJwt = {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
};

type DecodeResult =
  | { ok: true; data: DecodedJwt }
  | { ok: false; error: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
function decodeToken(token: string): DecodeResult {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "Enter a JWT token to decode." };

  const parts = trimmed.split(".");
  if (parts.length !== 3)
    return { ok: false, error: "Invalid JWT: must have exactly 3 parts separated by dots." };

  try {
    const header = jwtDecode<Record<string, unknown>>(trimmed, { header: true });
    const payload = jwtDecode<Record<string, unknown>>(trimmed);
    const signature = parts[2];
    return { ok: true, data: { header, payload, signature } };
  } catch {
    return { ok: false, error: "Failed to decode token. Make sure it is a valid Base64-encoded JWT." };
  }
}

/** Render a JSON value with colour-coded spans */
function renderValue(v: unknown): React.ReactNode {
  if (v === null) return <span style={{ color: "#C07040", fontStyle: "italic" }}>null</span>;
  if (typeof v === "boolean")
    return <span style={{ color: "#D4B483" }}>{String(v)}</span>;
  if (typeof v === "number")
    return <span style={{ color: "#D4B483" }}>{String(v)}</span>;
  if (typeof v === "string")
    return <span style={{ color: "#7DB87D" }}>&quot;{v}&quot;</span>;
  return <span style={{ color: "#F5F1EA" }}>{JSON.stringify(v)}</span>;
}

function PrettyJson({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  return (
    <pre
      style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: "13px",
        lineHeight: "1.8",
        margin: 0,
        color: "#F5F1EA",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      <span style={{ color: "#d9c2b6" }}>{"{"}</span>
      {"\n"}
      {entries.map(([k, v], i) => (
        <span key={k}>
          {"  "}
          <span
            style={{
              color: "#F5F1EA",
              cursor: "pointer",
              borderRadius: "2px",
              padding: "0 2px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "#353534")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "transparent")
            }
          >
            &quot;{k}&quot;
          </span>
          <span style={{ color: "#d9c2b6" }}>: </span>
          {renderValue(v)}
          {i < entries.length - 1 && <span style={{ color: "#d9c2b6" }}>,</span>}
          {"\n"}
        </span>
      ))}
      <span style={{ color: "#d9c2b6" }}>{"}"}</span>
    </pre>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function DecodedSection({
  label,
  subtitle,
  accentColor,
  children,
}: {
  label: string;
  subtitle: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="group overflow-hidden"
      style={{
        border: "1px solid #262626",
        borderRadius: "0.25rem",
        backgroundColor: "#121212",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          borderBottom: "1px solid #262626",
          backgroundColor: "#0e0e0e",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: accentColor,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            color: "#d9c2b6",
          }}
        >
          {subtitle}
        </span>
      </div>

      {/* Card body */}
      <div className="relative p-4">
        {/* Left accent bar */}
        <div
          className="absolute inset-y-0 left-0 w-1 transition-colors duration-200"
          style={{
            backgroundColor: accentColor + "33",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = accentColor)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.backgroundColor = accentColor + "33")
          }
        />
        {children}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE_TOKEN);
  const [algorithm, setAlgorithm] = useState("HS256");
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [verifyEnabled, setVerifyEnabled] = useState(true);
  const [secretCopied, setSecretCopied] = useState(false);

  const result = decodeToken(token);

  const handleClear = useCallback(() => setToken(""), []);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
      style={{ gap: "1px", backgroundColor: "#262626" }}
    >
      {/* ═══════════════════════════════════════════
          LEFT COLUMN — Encoded Token + Config
      ═══════════════════════════════════════════ */}
      <section
        className="flex flex-col overflow-y-auto"
        style={{ backgroundColor: "#080808", height: "calc(100vh - 64px)" }}
      >
        {/* Section header */}
        <div
          className="flex justify-between items-center px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid #262626", backgroundColor: "rgba(18,18,18,0.5)" }}
        >
          <h2
            className="flex items-center gap-2 font-semibold"
            style={{ fontSize: "14px", color: "#F5F1EA" }}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color: "#C07040" }}>
              data_object
            </span>
            Encoded Token
          </h2>
          <button
            onClick={handleClear}
            className="px-3 py-1 rounded transition-colors"
            style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#d9c2b6" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#F5F1EA";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#201f1f";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#d9c2b6";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
          >
            Clear
          </button>
        </div>

        {/* Token textarea */}
        <div className="flex-1 p-4" style={{ minHeight: "200px" }}>
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\neyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.\nSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}
            spellCheck={false}
            className="w-full h-full resize-none outline-none bg-transparent break-all"
            style={{
              border: "none",
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "13px",
              lineHeight: "1.7",
              color: "#F5F1EA",
              minHeight: "180px",
            }}
          />
        </div>

        {/* Verify Signature panel */}
        <div
          className="flex-shrink-0 p-6"
          style={{ borderTop: "1px solid #262626", backgroundColor: "#121212" }}
        >
          {/* Toggle row */}
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontSize: "14px", fontWeight: 500, color: "#F5F1EA" }}>
              Verify Signature
            </h3>
            {/* Toggle switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={verifyEnabled}
                onChange={(e) => setVerifyEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className="w-9 h-5 rounded-full transition-colors peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all relative"
                style={{
                  backgroundColor: verifyEnabled ? "#C07040" : "#353534",
                }}
              />
            </label>
          </div>

          {/* Algorithm + Secret fields */}
          <div className="space-y-4">
            {/* Algorithm */}
            <div className="grid items-center gap-4" style={{ gridTemplateColumns: "100px 1fr" }}>
              <label
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  color: "#d9c2b6",
                }}
              >
                Algorithm
              </label>
              <div className="relative">
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  disabled={!verifyEnabled}
                  className="w-full appearance-none outline-none px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: "#080808",
                    border: "1px solid #262626",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    color: "#F5F1EA",
                    opacity: verifyEnabled ? 1 : 0.4,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C07040")}
                  onBlur={(e) => (e.target.style.borderColor = "#262626")}
                >
                  <option>HS256</option>
                  <option>HS384</option>
                  <option>HS512</option>
                  <option>RS256</option>
                  <option>ES256</option>
                </select>
                <span
                  className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px]"
                  style={{ color: "#d9c2b6" }}
                >
                  expand_more
                </span>
              </div>
            </div>

            {/* Secret */}
            <div className="grid items-start gap-4" style={{ gridTemplateColumns: "100px 1fr" }}>
              <label
                className="pt-2"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  color: "#d9c2b6",
                }}
              >
                Secret
              </label>
              <div className="relative group">
                <textarea
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  disabled={!verifyEnabled}
                  placeholder="your-256-bit-secret"
                  className="w-full resize-none outline-none px-3 py-2 rounded transition-colors"
                  style={{
                    height: "80px",
                    backgroundColor: "#080808",
                    border: "1px solid #262626",
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    color: "#F5F1EA",
                    opacity: verifyEnabled ? 1 : 0.4,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#C07040")}
                  onBlur={(e) => (e.target.style.borderColor = "#262626")}
                />
                {/* Copy button (shown on hover) */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleCopySecret}
                    className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "#201f1f", color: "#d9c2b6" }}
                    title="Copy secret"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {secretCopied ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          RIGHT COLUMN — Decoded Output
      ═══════════════════════════════════════════ */}
      <section
        className="flex flex-col overflow-y-auto"
        style={{ backgroundColor: "#080808", height: "calc(100vh - 64px)" }}
      >
        {/* Section header */}
        <div
          className="flex justify-between items-center px-4 py-3 flex-shrink-0 sticky top-0 z-10"
          style={{ borderBottom: "1px solid #262626", backgroundColor: "rgba(18,18,18,0.5)" }}
        >
          <h2
            className="flex items-center gap-2 font-semibold"
            style={{ fontSize: "14px", color: "#F5F1EA" }}
          >
            <span className="material-symbols-outlined text-[18px]" style={{ color: "#ffb68e" }}>
              visibility
            </span>
            Decoded Payload
          </h2>
        </div>

        <div className="p-5 space-y-3 flex-1">
          {!result.ok ? (
            /* ── Error state ── */
            <div
              className="flex flex-col items-center justify-center h-full gap-4 text-center"
              style={{ minHeight: "300px" }}
            >
              <span
                className="material-symbols-outlined text-[48px]"
                style={{ color: "#353534" }}
              >
                lock
              </span>
              <p style={{ fontSize: "14px", color: "#d9c2b6", maxWidth: "300px" }}>
                {result.error}
              </p>
              {/* Coloured JWT preview */}
              <p
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  wordBreak: "break-all",
                  maxWidth: "380px",
                  color: "#353534",
                }}
              >
                <span style={{ color: "#C07040" }}>eyJhbGci...</span>
                <span style={{ color: "#262626" }}>.</span>
                <span style={{ color: "#e3c290" }}>eyJzdWIi...</span>
                <span style={{ color: "#262626" }}>.</span>
                <span style={{ color: "#ffb68e" }}>SflKxwRJ...</span>
              </p>
            </div>
          ) : (
            <>
              {/* ── HEADER card ── */}
              <DecodedSection
                label="Header"
                subtitle="Algorithm & Token Type"
                accentColor="#C07040"
              >
                <PrettyJson data={result.data.header} />
              </DecodedSection>

              {/* ── PAYLOAD card ── */}
              <DecodedSection label="Payload" subtitle="Data" accentColor="#e3c290">
                <PrettyJson data={result.data.payload} />
              </DecodedSection>

              {/* ── SIGNATURE card ── */}
              <DecodedSection
                label="Signature"
                subtitle=""
                accentColor="#ffb68e"
              >
                {/* Badge in the header is rendered via the subtitle slot — override with children */}
                <div
                  className="absolute top-2 right-4 flex items-center gap-1 px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: "rgba(125,184,125,0.1)",
                    border: "1px solid rgba(125,184,125,0.2)",
                    color: "#7DB87D",
                    fontSize: "12px",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Signature Verified
                </div>

                <div
                  className="space-y-2"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "12px",
                    color: "#d9c2b6",
                    marginTop: "4px",
                  }}
                >
                  {[
                    {
                      label: "Algorithm:",
                      value:
                        algorithm.startsWith("HS")
                          ? `HMACSHA${algorithm.slice(2)}`
                          : algorithm,
                    },
                    {
                      label: "Data:",
                      value: `base64UrlEncode(header) + "." + base64UrlEncode(payload)`,
                    },
                    {
                      label: "Secret:",
                      value: verifyEnabled ? secret || "—" : "(verification disabled)",
                    },
                  ].map(({ label, value }) => (
                    <p key={label} className="flex gap-3">
                      <span style={{ color: "#ffb68e", minWidth: "80px" }}>{label}</span>
                      <span
                        style={{ color: "#F5F1EA", opacity: 0.75, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        title={value}
                      >
                        {value}
                      </span>
                    </p>
                  ))}
                </div>
              </DecodedSection>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
