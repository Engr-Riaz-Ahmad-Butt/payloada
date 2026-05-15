"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Eye, LockKeyhole } from "lucide-react";

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
  const [jwtSecret, setJwtSecret] = useState("your-256-bit-secret");
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

  const payloadClaims = decodedJwt?.payload ? Object.entries(decodedJwt.payload).slice(0, 6) : [];
  const headerJson = decodedJwt ? JSON.stringify(decodedJwt.header, null, 2) : "";
  const payloadJson = decodedJwt ? JSON.stringify(decodedJwt.payload, null, 2) : "";
  const tokenAlgorithm = String(decodedJwt?.header.alg ?? jwtAlgorithm);

  return (
    <div className="grid h-full min-h-0 gap-px bg-[#262626] xl:grid-cols-2">
      <section className="flex min-h-0 flex-col bg-[#080808]">
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#171717]/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#f5f1ea]">
            <LockKeyhole className="size-4 text-[#c07040]" />
            Encoded Token
          </h2>
          <button
            type="button"
            onClick={() => setJwtInput("")}
            className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#d6c3b5] transition-colors hover:text-[#f5f1ea]"
          >
            Clear
          </button>
        </div>

        <div className="min-h-0 flex-1 bg-[#080808] p-5">
          <textarea
            value={jwtInput}
            onChange={(event) => setJwtInput(event.target.value)}
            spellCheck={false}
            placeholder={`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\neyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Impzb25MaW5lcyBEZW1vIiwiaWF0IjoxNTE2MjM5MDIyfQ.\nSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`}
            className="h-full w-full resize-none border-0 bg-transparent px-0 py-0 font-mono text-[15px] leading-8 text-[#f5f1ea] outline-none placeholder:text-[#5b5450]"
          />
        </div>

        <div className="border-t border-[#262626] bg-[#121212] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-medium text-[#f5f1ea]">Verify Signature</h3>
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
              <label className="font-mono text-xs text-[#a89589]">Algorithm</label>
              <div className="relative">
                <select
                  value={jwtAlgorithm}
                  onChange={(event) => setJwtAlgorithm(event.target.value)}
                  className="h-11 w-full appearance-none rounded-sm border border-[#262626] bg-[#080808] px-3 font-mono text-sm text-[#f5f1ea] outline-none"
                >
                  <option>HS256</option>
                  <option>RS256</option>
                  <option>ES256</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#a89589]" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)] md:items-start">
              <label className="pt-2 font-mono text-xs text-[#a89589]">Secret</label>
              <div className="space-y-2">
                <textarea
                  value={jwtSecret}
                  onChange={(event) => setJwtSecret(event.target.value)}
                  className="h-24 w-full resize-none rounded-sm border border-[#262626] bg-[#080808] px-3 py-2 font-mono text-sm text-[#f5f1ea] outline-none"
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
        <div className="sticky top-0 z-10 border-b border-[#262626] bg-[#171717]/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-[#f5f1ea]">
            <Eye className="size-4 text-[#ffb68e]" />
            Decoded Payload
          </h2>
        </div>

        <div className="space-y-5 p-6">
          {decodedJwt ? (
            <>
              <JwtCard
                title="Header"
                subtitle="Algorithm & Token Type"
                accent="copper"
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
                accent="secondary"
                actions={
                  <SmallAction
                    label="Copy Payload"
                    onClick={() => onCopy(payloadJson, "Copied JWT payload")}
                  />
                }
              >
                <CodePreview value={payloadJson} className="border-0 bg-transparent p-0" />
              </JwtCard>

              <JwtCard
                title="Signature"
                subtitle="Verification"
                accent="primary"
                actions={
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-sm border px-2.5 py-1",
                      signatureState === "verified"
                        ? "border-[#32593a] bg-[#0d1510] text-[#8ed08e]"
                        : signatureState === "invalid"
                        ? "border-[#7a1e1e] bg-[#4a0c0c] text-[#f1b0b0]"
                        : "border-[#4b3c24] bg-[#14110b] text-[#d7c49d]",
                    )}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span className="font-mono text-xs">
                      {signatureState === "verified"
                        ? "Signature Verified"
                        : signatureState === "invalid"
                        ? "Signature Invalid"
                        : signatureState === "unsupported"
                        ? "Verification Limited"
                        : "Verification Idle"}
                    </span>
                  </div>
                }
              >
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
                accent="secondary"
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
                      className="flex items-center justify-between gap-4 rounded-sm border border-[#262626] bg-[#111111] px-3 py-2"
                    >
                      <span className="font-mono text-xs text-[#c07040]">{key}</span>
                      <span className="max-w-[70%] truncate font-mono text-xs text-[#f5f1ea]">
                        {typeof value === "string" ? value : JSON.stringify(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </JwtCard>
            </>
          ) : (
            <div className="rounded-sm border border-[#262626] bg-[#121212] p-6">
              <p className="text-lg font-semibold text-[#f5f1ea]">Paste a valid JWT token</p>
              <p className="mt-2 text-sm leading-6 text-[#a89589]">
                Header, payload, and signature details will appear here once the token can be
                decoded.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
