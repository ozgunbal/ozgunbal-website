import { DOWNLOAD_RETRIES, MODELS, PROGRESS_INTERVAL_MS, type ModelInfo } from "./config";
import { formatBytes } from "./device";
import { strings } from "./strings";

// Model weights live in OPFS. A completion marker in localStorage is written only after the whole file
// has been streamed to disk, so a file without a matching marker is always a partial download.

const MARKER_PREFIX = "ask.model.";

interface Marker {
  id: string;
  size: number;
  version: string;
}

export class DownloadError extends Error {
  constructor(
    message: string,
    readonly kind: "quota" | "network" | "aborted"
  ) {
    super(message);
  }
}

const readMarker = (model: ModelInfo): Marker | null => {
  try {
    return JSON.parse(localStorage.getItem(MARKER_PREFIX + model.id) ?? "null");
  } catch {
    return null;
  }
};

async function removeFile(fileName: string) {
  const dir = await navigator.storage.getDirectory();
  await dir.removeEntry(fileName).catch(() => {});
}

/** Returns the cached file if it is complete and current; otherwise deletes whatever is there. */
export async function getCachedModel(model: ModelInfo): Promise<File | null> {
  const marker = readMarker(model);
  if (marker && marker.version === model.version) {
    try {
      const dir = await navigator.storage.getDirectory();
      const file = await (await dir.getFileHandle(model.fileName)).getFile();
      if (file.size === marker.size) return file;
    } catch {
      // fall through to cleanup
    }
  }
  await removeModel(model);
  return null;
}

/** On startup: delete any file that has no valid completion marker (e.g. the tab was killed mid-download). */
export async function cleanupPartialDownloads() {
  for (const model of MODELS) {
    const marker = readMarker(model);
    if (!marker || marker.version !== model.version) await removeModel(model);
  }
}

export async function removeModel(model: ModelInfo) {
  localStorage.removeItem(MARKER_PREFIX + model.id);
  await removeFile(model.fileName);
}

export async function removeAllModels() {
  for (const model of MODELS) await removeModel(model);
}

/** Total bytes of completed models on disk. */
export async function getStorageUsed(): Promise<number> {
  return MODELS.reduce((sum, m) => sum + (readMarker(m)?.size ?? 0), 0);
}

async function assertQuota(needed: number) {
  const { quota, usage } = (await navigator.storage.estimate?.()) ?? {};
  if (quota === undefined || usage === undefined) return;
  const available = quota - usage;
  if (available < needed * 1.05) {
    throw new DownloadError(strings.quotaError(formatBytes(needed), formatBytes(Math.max(available, 0))), "quota");
  }
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (clearTimeout(t), reject(new DownloadError("aborted", "aborted"))), { once: true });
  });

async function downloadOnce(
  model: ModelInfo,
  onProgress: (loaded: number, total: number) => void,
  signal: AbortSignal
): Promise<File> {
  const res = await fetch(model.url, { signal });
  if (!res.ok || !res.body) throw new Error(`Download failed: ${res.status}`);
  const total = Number(res.headers.get("Content-Length")) || model.sizeBytes;
  await assertQuota(total);

  const dir = await navigator.storage.getDirectory();
  const handle = await dir.getFileHandle(model.fileName, { create: true });
  const writable = await handle.createWritable();

  let loaded = 0;
  let lastReport = 0;
  const counter = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      loaded += chunk.byteLength;
      const now = performance.now();
      if (now - lastReport >= PROGRESS_INTERVAL_MS) {
        lastReport = now;
        onProgress(loaded, total);
      }
      controller.enqueue(chunk);
    },
  });

  await res.body.pipeThrough(counter).pipeTo(writable, { signal });
  onProgress(loaded, total);

  const file = await handle.getFile();
  const marker: Marker = { id: model.id, size: file.size, version: model.version };
  localStorage.setItem(MARKER_PREFIX + model.id, JSON.stringify(marker));
  return file;
}

/**
 * Streams the model to OPFS with progress. Retries network failures with backoff (restarting the file),
 * and deletes the partial file on cancel or failure.
 */
export async function downloadModel(
  model: ModelInfo,
  onProgress: (loaded: number, total: number) => void,
  signal: AbortSignal
): Promise<File> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= DOWNLOAD_RETRIES; attempt++) {
    try {
      return await downloadOnce(model, onProgress, signal);
    } catch (err) {
      lastError = err;
      await removeModel(model);
      if (signal.aborted) throw new DownloadError("aborted", "aborted");
      if (err instanceof DownloadError) throw err;
      if (attempt < DOWNLOAD_RETRIES) await sleep(1000 * 2 ** attempt, signal);
    }
  }
  console.error(lastError);
  throw new DownloadError(strings.networkError, "network");
}
