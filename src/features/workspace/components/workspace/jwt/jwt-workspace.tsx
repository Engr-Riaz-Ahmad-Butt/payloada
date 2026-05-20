"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Eye, LockKeyhole, Unlock } from "lucide-react";

import { cn } from "@/lib/utils";

import { CodePreview, JwtCard, SmallAction } from "../shared";
import type { DecodedJwtData } from "../core/types";
import { verifyHs256Token } from "../shared/utils";

export function JwtWorkspace({
  jwtInput,
  setJwtInput,
  decodedJwt,
  onCopy,
}: {
  jwtInput: string;
  setJwtInput: React.Dispatch<React.SetStateAction<string>>;
  decodedJwt: DecodedJwtData;
  onCopy: (value: string, message?: string) => Promise<void>;
}) {
  const [verifyEnabled, setVerifyEnabled] = useState(true);
  const [jwtAlgorithm, setJwtAlgorithm] = useState("HS256");
  const [jwtSecret, setJwtSecret] = useState("");
  const [signatureState, setSignatureState] = useState<
    "idle" | "verified" | "invalid" | "unsupported"
  >("idle");

  useEffect(() => {
    let cancelled = false;

    async function verifySignature() {
      if (!verifyEnabled || !decodedJwt) {
        if (!cancelled) {
          setSignatureState("idle");
        }
        return;
      }

      const tokenAlgorithm = String(decodedJwt.header.alg ?? "");
      if (tokenAlgorithm !== "HS256" || jwtAlgorithm !== "HS256" || !jwtSecret.trim()) {
        if (!cancelled) {
          setSignatureState("unsupported");
        }
        return;
      }

      const verified = await verifyHs256Token(decodedJwt.tokenParts, jwtSecret);
      if (!cancelled) {
        setSignatureState(verified ? "verified" : "invalid");
      }
    }

    void verifySignature();

    return () => {
      cancelled = true;
    };
  }, [decodedJwt, jwtAlgorithm, jwtSecret, verifyEnabled]);

  const payloadClaims = decodedJwt?.payload ? Object.entries(decodedJwt.payload).slice(0, 8) : [];
  const headerJson = decodedJwt ? JSON.stringify(decodedJwt.header, null, 2) : "";
  const payloadJson = decodedJwt ? JSON.stringify(decodedJwt.payload, null, 2) : "";
  const tokenAlgorithm = String(decodedJwt?.header.alg ?? jwtAlgorithm);
  const tokenParts = decodedJwt?.tokenParts ?? ["", "", ""];
  const issuedAt = getNumericClaim(decodedJwt?.payload?.iat);
  const expiresAt = getNumericClaim(decodedJwt?.payload?.exp);
  const expiryMeta = getExpiryMeta(issuedAt, expiresAt);

  const bannerConfig =
    signatureState === "verified"
      ? {
          background: "#0D2E23",
          border: "#3DD68C",
          text: "#3DD68C",
          icon: <CheckCircle2 className="size-4" />,
          label: "Signature verified — token is authentic",
          weight: 500,
        }
      : signatureState === "invalid"
      ? {
          background: "#2A0D10",
          border: "#FF5C6C",
          text: "#FF5C6C",
          icon: <AlertTriangle className="size-4" />,
          label: "Signature invalid — do not trust this token",
          weight: 500,
        }
      : {
          background: "#1A1D24",
          border: "#2A2F42",
          text: "#5A6070",
          icon: <Unlock className="size-4" />,
          label: "Signature not verified — enter secret below to verify",
          weight: 400,
        };

  return (
    <div className="grid h-full min-h-0 gap-[0.5px] bg-ui-border xl:grid-cols-2">
      <section className="flex min-h-0 flex-col bg-[#080808]">
        <div className="flex items-center justify-between border-b-[0.5px] border-ui-border bg-[#171717]/60 px-4 py-4 sm:px-5">
          <h2 className="flex items-center gap-2 text-[14px] font-medium text-[#E8EAF0]">
            <LockKeyhole className="size-4 text-[#c07040]" />
            Encoded Token
          </h2>
          <button
            type="button"
            onClick={() => setJwtInput("")}
            className="text-[11px] font-medium tracking-[0.5px] text-[#5A6070] transition-colors hover:text-[#f5f1ea]"
          >
            Clear
          </button>
        </div>

        <div className="space-y-2 bg-[#080808] p-4 sm:p-5">
          <textarea
            value={jwtInput}
            onChange={(event) => setJwtInput(event.target.value)}
            spellCheck={false}
            placeholder={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\neyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Impzb25MaW5lcyBEZW1vIiwiaWF0IjoxNTE2MjM5MDIyfQ.\nSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}
            className="max-h-[100px] min-h-[100px] w-full resize-none overflow-y-auto rounded-[8px] border-[0.5px] border-ui-border bg-[#0A0A0A] px-3 py-3 font-mono text-[13px] font-normal leading-6 text-[#f5f1ea] outline-none placeholder:text-[#5b5450]"
          />

          <div className="space-y-1">
            {[
              {
                label: "Header",
                background: "#1A2040",
                text: "#79C0FF",
                value: tokenParts[0],
              },
              {
                label: "Payload",
                background: "#1F140C",
                text: "#C07040",
                value: tokenParts[1],
              },
              {
                label: "Signature",
                background: "#1A2A1A",
                text: "#3DD68C",
                value: tokenParts[2],
              },
            ].map((part) => (
              <div
                key={part.label}
                className="flex h-11 items-center justify-between rounded-[6px] border-[0.5px] border-ui-border px-3"
                style={{ backgroundColor: part.background }}
              >
                <span className="text-[12px] font-medium" style={{ color: part.text }}>
                  {part.label}
                </span>
                <span
                  className="max-w-[60%] truncate font-mono text-[12px]"
                  style={{ color: part.text }}
                >
                  {truncateTokenPart(part.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-[0.5px] border-ui-border bg-[#121212] p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-[#E8EAF0]">Verify signature</h3>
            <button
              type="button"
              role="switch"
              aria-checked={verifyEnabled}
              onClick={() => setVerifyEnabled((current) => !current)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                verifyEnabled ? "bg-[#c77742]" : "bg-[#353534]",
              )}
            >
              <span
                className={cn(
                  "absolute top-[2px] h-4 w-4 rounded-full bg-[#f5f1ea] transition-transform",
                  verifyEnabled ? "left-[18px]" : "left-[2px]",
                )}
              />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)] md:items-center">
              <label className="text-[13px] font-normal leading-[1.6] text-[#8B92A8]">
                Algorithm
              </label>
              <div className="relative">
                <select
                  value={jwtAlgorithm}
                  onChange={(event) => setJwtAlgorithm(event.target.value)}
                  className="h-11 w-full appearance-none rounded-sm border-[0.5px] border-ui-border bg-[#080808] px-3 font-mono text-[13px] font-normal text-[#f5f1ea] outline-none focus-visible:border-[#C07040]"
                >
                  <option>HS256</option>
                  <option>RS256</option>
                  <option>ES256</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#a89589]" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)] md:items-start">
              <label className="pt-2 text-[13px] font-normal leading-[1.6] text-[#8B92A8]">
                Secret
              </label>
              <div className="space-y-2">
                <textarea
                  value={jwtSecret}
                  onChange={(event) => setJwtSecret(event.target.value)}
                  className="h-24 w-full resize-none rounded-sm border-[0.5px] border-ui-border bg-[#080808] px-3 py-2 font-mono text-[13px] font-normal text-[#f5f1ea] outline-none focus-visible:border-[#C07040]"
                  placeholder="your-256-bit-secret"
                />
                <div className="flex justify-end">
                  <SmallAction
                    label="Copy Secret"
                    onClick={() => onCopy(jwtSecret, "Copied JWT secret")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-0 flex-col overflow-y-auto bg-[#080808]">
        <div className="sticky top-0 z-10 border-b-[0.5px] border-ui-border bg-[#171717]/60 px-4 py-4 sm:px-5">
          <h2 className="flex items-center gap-2 text-[14px] font-medium text-[#E8EAF0]">
            <Eye className="size-4 text-[#ffb68e]" />
            Decoded Payload
          </h2>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          {decodedJwt ? (
            <>
              <div
                className="flex w-full items-center gap-3 rounded-[8px] border-[0.5px] px-4 py-3"
                style={{
                  backgroundColor: bannerConfig.background,
                  borderColor: bannerConfig.border,
                  color: bannerConfig.text,
                }}
              >
                {bannerConfig.icon}
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: bannerConfig.weight,
                    lineHeight: "1.4",
                  }}
                >
                  {bannerConfig.label}
                </span>
              </div>

              <div className="rounded-[8px] border-[0.5px] border-ui-border bg-[#0F1117] px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-normal uppercase tracking-[0.06em] text-[#5A6070]">
                      Issued
                    </p>
                    <p className="mt-1 font-mono text-[12px] text-[#8B92A8]">
                      {formatJwtDate(issuedAt)}
                    </p>
                  </div>

                  <div className="hidden h-8 w-px bg-ui-border md:block" />

                  <div className="min-w-0">
                    <p className="text-[10px] font-normal uppercase tracking-[0.06em] text-[#5A6070]">
                      Expires
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[12px]" style={{ color: expiryMeta.color }}>
                        {expiryMeta.label}
                      </p>
                      {expiryMeta.badge ? (
                        <span className="rounded-full border-[0.5px] border-[#FF5C6C] bg-[#2A0D10] px-2 py-0.5 text-[10px] font-medium text-[#FF5C6C]">
                          {expiryMeta.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <JwtCard
                title="Header"
                subtitle="Algorithm and token type"
                accent="header"
                actions={
                  <SmallAction
                    label="Copy Header"
                    onClick={() => onCopy(headerJson, "Copied JWT header")}
                  />
                }
              >
                <CodePreview value={headerJson} className="border-0 bg-transparent p-0" />
              </JwtCard>

              <JwtCard
                title="Payload"
                subtitle="Data"
                accent="payload"
                actions={
                  <SmallAction
                    label="Copy Payload"
                    onClick={() => onCopy(payloadJson, "Copied JWT payload")}
                  />
                }
              >
                <CodePreview value={payloadJson} className="border-0 bg-transparent p-0" />
              </JwtCard>

              <JwtCard title="Signature" subtitle="Verification" accent="signature">
                <div className="space-y-2 font-mono text-xs leading-6 text-[#d6c3b5]">
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Algorithm:</span>
                    <span className="text-[#f5f1ea]">{tokenAlgorithm || "Unknown"}</span>
                  </p>
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Data:</span>
                    <span className="truncate text-[#f5f1ea]/75">
                      {decodedJwt.tokenParts[0]}.{decodedJwt.tokenParts[1]}
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Secret:</span>
                    <span className="truncate text-[#f5f1ea]/75">
                      {jwtSecret || "No secret provided"}
                    </span>
                  </p>
                  <p className="flex gap-2">
                    <span className="w-24 text-[#ffb68e]">Signature:</span>
                    <span className="truncate text-[#f5f1ea]/75">{decodedJwt.signature}</span>
                  </p>
                </div>
              </JwtCard>

              <JwtCard
                title="Claims"
                subtitle="Quick scan"
                accent="claims"
                actions={
                  <SmallAction
                    label="Copy Full JWT"
                    onClick={() =>
                      onCopy(
                        JSON.stringify(
                          {
                            header: decodedJwt.header,
                            payload: decodedJwt.payload,
                            signature: decodedJwt.signature,
                          },
                          null,
                          2,
                        ),
                        "Copied full decoded JWT",
                      )
                    }
                  />
                }
              >
                <div className="grid gap-2">
                  {payloadClaims.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-[6px] border-[0.5px] border-ui-border bg-[#111111] px-3 py-2 transition-colors hover:bg-[#1A1D24]"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: isStandardJwtClaim(key) ? "#C07040" : "#8B92A8" }}
                        >
                          {key}
                        </span>
                        {isStandardJwtClaim(key) ? (
                          <span className="rounded-[4px] bg-[#1F140C] px-1.5 py-0.5 text-[9px] font-medium leading-none text-[#C07040]">
                            std
                          </span>
                        ) : null}
                      </div>
                      <span className="max-w-[70%] truncate text-right font-mono text-[12px] text-[#E8EAF0]">
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </JwtCard>
            </>
          ) : (
            <div className="rounded-sm border-[0.5px] border-ui-border bg-[#121212] p-6">
              <p className="text-[14px] font-medium text-[#E8EAF0]">Paste a valid JWT token</p>
              <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#8B92A8]">
                Header, payload, and signature details will appear here as soon as the token can be
                decoded.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function truncateTokenPart(value: string) {
  if (!value) {
    return "Not available";
  }

  return value.length > 12 ? `${value.slice(0, 12)}...` : value;
}

function getNumericClaim(value: unknown) {
  return typeof value === "number" ? value : null;
}

function isStandardJwtClaim(key: string) {
  return ["sub", "iat", "exp", "iss", "aud", "nbf", "jti"].includes(key);
}

function formatJwtDate(value: number | null) {
  if (!value) {
    return "Not set";
  }

  try {
    return new Date(value * 1000).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    // Fallback for out-of-range timestamps (e.g. year > 275760)
    return new Date(value * 1000).toISOString().slice(0, 16).replace("T", " ");
  }
}

function getExpiryMeta(issuedAt: number | null, expiresAt: number | null) {
  if (!expiresAt) {
    return {
      label: "No expiry set",
      color: "#3A4060",
      badge: null as string | null,
      issuedLabel: formatJwtDate(issuedAt),
    };
  }

  const now = Date.now();
  const expiresAtMs = expiresAt * 1000;
  const deltaMs = expiresAtMs - now;

  if (deltaMs <= 0) {
    return {
      label: `Expired ${formatElapsedTime(Math.abs(deltaMs))} ago`,
      color: "#FF5C6C",
      badge: "Expired",
      issuedLabel: formatJwtDate(issuedAt),
    };
  }

  return {
    label: `in ${formatRemainingTime(deltaMs)} (${formatShortDate(expiresAtMs)})`,
    color: "#3DD68C",
    badge: null as string | null,
    issuedLabel: formatJwtDate(issuedAt),
  };
}

function formatElapsedTime(deltaMs: number) {
  const totalHours = Math.floor(deltaMs / (1000 * 60 * 60));
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays >= 1) {
    return `${totalDays} day${totalDays === 1 ? "" : "s"}`;
  }

  if (totalHours >= 1) {
    return `${totalHours} hour${totalHours === 1 ? "" : "s"}`;
  }

  const totalMinutes = Math.max(1, Math.floor(deltaMs / (1000 * 60)));
  return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
}

function formatRemainingTime(deltaMs: number) {
  const totalMinutes = Math.max(1, Math.floor(deltaMs / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  if (hours >= 1) {
    return `${hours}h ${minutes}m`;
  }

  return `${totalMinutes}m`;
}

function formatShortDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
