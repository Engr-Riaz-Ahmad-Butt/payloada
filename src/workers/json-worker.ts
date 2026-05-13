export type JsonWorkerRequest = {
  id: string;
  source: string;
};

export type JsonWorkerResponse = {
  id: string;
  valid: boolean;
};

self.addEventListener("message", (event: MessageEvent<JsonWorkerRequest>) => {
  const { id, source } = event.data;

  try {
    JSON.parse(source);
    self.postMessage({ id, valid: true } satisfies JsonWorkerResponse);
  } catch {
    self.postMessage({ id, valid: false } satisfies JsonWorkerResponse);
  }
});
