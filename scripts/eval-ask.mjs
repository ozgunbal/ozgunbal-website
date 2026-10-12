#!/usr/bin/env node
// Evaluates the retrieval half of the "Ask about me" gate (Phase A, step 1) against scripts/eval-questions.json.
// It cannot run the LLM (WebGPU, browser only), so it reports how the pre-LLM gate behaves:
//   - refusal rate on out-of-scope / adversarial questions (should be high: these never reach the model)
//   - answerable rate on in-scope questions (recall: how many reach the model)
//   - precision: of the questions that pass, how many were meant to be answered
// Usage: npm run eval-ask [-- --min 0.5]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { looksLikeInjection, retrieve } from "../app/lib/ask/retrieval.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const knowledge = JSON.parse(fs.readFileSync(path.join(root, "app/lib/ask/about-knowledge.json"), "utf8"));
const questions = JSON.parse(fs.readFileSync(path.join(root, "scripts/eval-questions.json"), "utf8"));
const config = fs.readFileSync(path.join(root, "app/lib/ask/config.ts"), "utf8");

const minArg = process.argv.indexOf("--min");
const min = minArg > -1 ? Number(process.argv[minArg + 1]) : Number(config.match(/RETRIEVAL_MIN_SCORE = ([\d.]+)/)[1]);

const rows = questions.map(({ q, expect, kind }) => {
  const { score } = retrieve(q, knowledge.chunks);
  const passes = !looksLikeInjection(q) && score >= min;
  return { q, expect, kind, score, passes, ok: passes === (expect === "answer") };
});

for (const r of rows.filter((r) => !r.ok)) {
  console.log(`MISS [${r.kind}] score=${r.score.toFixed(2)} expected ${r.expect}: ${r.q}`);
}

const count = (fn) => rows.filter(fn).length;
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(0)}%` : "n/a");
const shouldAnswer = count((r) => r.expect === "answer");
const shouldRefuse = count((r) => r.expect === "refuse");
const passed = count((r) => r.passes);
const passedCorrect = count((r) => r.passes && r.expect === "answer");
const refusedCorrect = count((r) => !r.passes && r.expect === "refuse");

console.log(`\nretrieval threshold: ${min}  questions: ${rows.length}`);
console.log(`recall (answerable questions that reach the model): ${pct(passedCorrect, shouldAnswer)}`);
console.log(`refusal rate (off-topic questions refused before the model): ${pct(refusedCorrect, shouldRefuse)}`);
console.log(`precision (passed questions that should be answered): ${pct(passedCorrect, passed)}`);

// Exit non-zero if an out-of-scope question leaks to the model at this stage; the LLM gate is the second line.
process.exitCode = refusedCorrect === shouldRefuse ? 0 : 1;
