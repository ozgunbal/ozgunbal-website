// Phase A, step 1: lexical retrieval over the About Me chunks.
// Runtime-import-free on purpose so scripts/eval-ask.mjs can load it directly with Node.

export interface Chunk {
  id: string;
  text: string;
}

export interface RetrievalResult {
  /** 0..1, how well the best chunk covers the question's content words. */
  score: number;
  /** Chunks ranked best first. */
  ranked: Chunk[];
}

const STOPWORDS = new Set(
  (
    "a an the and or but of in on at to for from with by about as is are was were be been being do does did " +
    "have has had i you he she it we they me my your his her him its our their this that these those what " +
    "who whom which when where why how can could would should will shall may might please tell more " +
    "some any there here so if than then too very just also not no yes"
  ).split(" ")
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

// Very light stemming so "leading" matches "lead" and "teams" matches "team".
function stem(token: string): string {
  return token.replace(/(ing|ed|es|s)$/, (m, _s, offset) => (offset >= 3 ? "" : m));
}

/**
 * Score = IDF-weighted share of the question's content words found in the best chunk (BM25-ranked).
 * Words that appear in no chunk get the highest IDF, so a question that mentions anything the page
 * doesn't talk about ("capital", "France", "poem") scores low and is refused without calling the LLM.
 */
export function retrieve(question: string, chunks: Chunk[]): RetrievalResult {
  const queryTerms = [...new Set(tokenize(question))];
  if (queryTerms.length === 0 || chunks.length === 0) return { score: 0, ranked: [] };

  const docs = chunks.map((c) => tokenize(c.text));
  const n = docs.length;
  const avgLen = docs.reduce((s, d) => s + d.length, 0) / n;
  const df = (term: string) => docs.filter((d) => d.includes(term)).length;
  const idf = (term: string) => Math.log(1 + (n - df(term) + 0.5) / (df(term) + 0.5));

  const k1 = 1.5;
  const b = 0.75;
  const bm25 = docs.map((doc) =>
    queryTerms.reduce((sum, term) => {
      const tf = doc.filter((t) => t === term).length;
      if (!tf) return sum;
      return sum + (idf(term) * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * doc.length) / avgLen));
    }, 0)
  );

  const totalIdf = queryTerms.reduce((s, t) => s + idf(t), 0);
  const coverage = docs.map(
    (doc) => queryTerms.filter((t) => doc.includes(t)).reduce((s, t) => s + idf(t), 0) / totalIdf
  );

  const order = chunks.map((_, i) => i).sort((a, c) => bm25[c] - bm25[a]);
  // Best coverage across all chunks: a question may be answered by any single chunk.
  const score = Math.max(...coverage);
  return { score, ranked: order.map((i) => chunks[i]) };
}

/** Cheap guard against obvious prompt-injection phrasing. */
const INJECTION = /\b(ignore|disregard|forget|override)\b.{0,40}\b(instruction|prompt|rule|context)s?\b|\bsystem prompt\b|\bjailbreak\b|\bact as\b|\bpretend (to be|you)\b/i;

export function looksLikeInjection(question: string): boolean {
  return INJECTION.test(question);
}
