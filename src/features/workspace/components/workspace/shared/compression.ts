/**
 * Compresses a string using the native browser CompressionStream (deflate).
 * Returns a URL-safe Base64 encoded string.
 */
export async function compressString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  // Create a compression stream
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();

  // Write the data and close the stream
  void writer.write(data);
  void writer.close();

  // Read the compressed chunks
  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  // Combine all chunks
  const compressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  // Convert to URL-safe Base64
  return binaryToBase64Url(compressed);
}

/**
 * Decompresses a URL-safe Base64 encoded string back to the original string.
 * Uses native browser DecompressionStream (deflate).
 */
export async function decompressString(base64UrlStr: string): Promise<string> {
  const compressed = base64UrlToBinary(base64UrlStr);

  // Create a decompression stream
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();

  // Write the compressed data and close
  void writer.write(compressed);
  void writer.close();

  // Read the decompressed chunks
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  let totalLength = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
    totalLength += value.length;
  }

  // Combine all chunks
  const decompressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    decompressed.set(chunk, offset);
    offset += chunk.length;
  }

  const decoder = new TextDecoder();
  return decoder.decode(decompressed);
}

// Helper to convert Uint8Array to URL-safe Base64
function binaryToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binary);
  // Make it URL-safe: replace +, / and remove padding =
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Helper to convert URL-safe Base64 back to Uint8Array
function base64UrlToBinary(base64Url: string): Uint8Array {
  // Restore standard Base64: replace - and _ and add padding if needed
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

  const pad = base64.length % 4;
  if (pad) {
    base64 += "=".repeat(4 - pad);
  }

  const binary = window.atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
