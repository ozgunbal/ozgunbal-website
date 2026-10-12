#!/usr/bin/env node
// Builds app/lib/ask/about-knowledge.json from the paragraphs in app/routes/about.tsx.
// Run `npm run generate-about-knowledge` after editing the About page.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app/routes/about.tsx"), "utf8");

const chunks = [];
const re = /<p\b[^>]*>([\s\S]*?)<\/p>/g;
let match;
while ((match = re.exec(source))) {
  const text = match[1].replace(/\s+/g, " ").trim();
  if (text) chunks.push({ id: `about-${chunks.length + 1}`, text });
}

const out = path.join(root, "app/lib/ask/about-knowledge.json");
fs.writeFileSync(
  out,
  JSON.stringify({ source: "app/routes/about.tsx", chunks }, null, 2) + "\n"
);
console.log(`Wrote ${chunks.length} chunks to ${path.relative(root, out)}`);
