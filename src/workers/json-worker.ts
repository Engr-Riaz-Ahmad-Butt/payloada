export type JsonWorkerRequest = {
  id: string;
  source: string;
};

export type JsonWorkerResponse = {
  id: string;
  valid: boolean;
  data?: unknown;
  error?: string;
  line?: number;
  column?: number;
  parseDurationMs?: number;
};

self.addEventListener("message", (event: MessageEvent<JsonWorkerRequest>) => {
  const { id, source } = event.data;
  const start = Date.now();

  try {
    const data = JSON.parse(source);
    self.postMessage({ id, valid: true, data, parseDurationMs: Date.now() - start } satisfies JsonWorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to parse JSON input.";
    const positionMatch = message.match(/position (\d+)/i);
    const position = positionMatch ? Number(positionMatch[1]) : undefined;
    
    let line: number | undefined;
    let column: number | undefined;

    if (position !== undefined && !Number.isNaN(position)) {
      const slice = source.slice(0, position);
      const lines = slice.split("\n");
      line = lines.length;
      column = lines.at(-1)?.length ? lines.at(-1)!.length + 1 : 1;
    }

    self.postMessage({
      id,
      valid: false,
      error: message,
      line,
      column,
      parseDurationMs: Date.now() - start,
    } satisfies JsonWorkerResponse);
  }
});
