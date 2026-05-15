import { jwtDecode } from "jwt-decode";

import type { DecodedJwtData } from "../core/types";

export function decodeJwtInput(jwtInput: string): DecodedJwtData {
  try {
    const trimmed = jwtInput.trim();
    if (!trimmed) {
      return null;
    }

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const header = jwtDecode<Record<string, unknown>>(trimmed, { header: true });
    const payload = jwtDecode<Record<string, unknown>>(trimmed);

    return {
      header,
      payload,
      signature: parts[2],
      tokenParts: [parts[0], parts[1], parts[2]],
    };
  } catch {
    return null;
  }
}

export async function verifyHs256Token(tokenParts: [string, string, string], secret: string) {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const data = `${tokenParts[0]}.${tokenParts[1]}`;
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const computed = base64UrlEncode(new Uint8Array(signature));

    return computed === tokenParts[2];
  } catch {
    return false;
  }
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
