import { jwtDecode } from "jwt-decode";
import type { JwtDecodeResult, JwtHeader, JwtPayload } from "@/types/jwt";

/**
 * Safely decodes a JWT token into its header, payload, and signature.
 * @param token The JWT token string to decode.
 * @returns A JwtDecodeResult containing the decoded data or an error message.
 */
export function decodeJwtToken(token: string): JwtDecodeResult {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a JWT token to decode." };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      ok: false,
      error: "Invalid JWT: must have exactly 3 parts separated by dots.",
    };
  }

  try {
    const header = jwtDecode<JwtHeader>(trimmed, { header: true });
    const payload = jwtDecode<JwtPayload>(trimmed);
    const signature = parts[2];

    return {
      ok: true,
      data: {
        header,
        payload,
        signature,
      },
    };
  } catch {
    return {
      ok: false,
      error: "Failed to decode token. Make sure it is a valid Base64-encoded JWT.",
    };
  }
}
