export type Tier = "standard" | "high";

export interface ModelInfo {
  id: string;
  label: string;
  url: string;
  fileName: string;
  /** Fallback when the server sends no Content-Length. */
  sizeBytes: number;
  /** Lowest device tier that is offered this model by default. */
  minTier: Tier;
  /** Bump to invalidate caches when the file at `url` changes. */
  version: string;
}

const HF = "https://huggingface.co/litert-community";

// Ordered from smallest to largest. Add more models here later.
export const MODELS: ModelInfo[] = [
  {
    id: "gemma-4-e2b",
    label: "Gemma 4 E2B",
    url: `${HF}/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm`,
    fileName: "gemma-4-E2B-it-web.litertlm",
    sizeBytes: 2_010_000_000,
    minTier: "standard",
    version: "1",
  },
  {
    id: "gemma-4-e4b",
    label: "Gemma 4 E4B",
    url: `${HF}/gemma-4-E4B-it-litert-lm/resolve/main/gemma-4-E4B-it-web.litertlm`,
    fileName: "gemma-4-E4B-it-web.litertlm",
    sizeBytes: 2_970_000_000,
    minTier: "high",
    version: "1",
  },
];

/** An answer is shown only if its final confidence is at least this. */
export const CONFIDENCE_THRESHOLD = 0.95;

/** Questions whose retrieval score is below this are refused without calling the LLM. */
export const RETRIEVAL_MIN_SCORE = 0.5;

/** Final confidence = RETRIEVAL_WEIGHT * retrieval + (1 - RETRIEVAL_WEIGHT) * model self-assessment. */
export const RETRIEVAL_WEIGHT = 0.5;

/** How many chunks are passed to the model. */
export const TOP_K = 3;

export const MAX_NUM_TOKENS = 4096;
export const GATE_MAX_OUTPUT_TOKENS = 96;
export const ANSWER_MAX_OUTPUT_TOKENS = 512;

export const DOWNLOAD_RETRIES = 3;
export const PROGRESS_INTERVAL_MS = 100;
