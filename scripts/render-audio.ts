import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { fullSentence } from "../src/core/sentenceBracket";
import { publishedChunks } from "../src/content/published";

mkdirSync("public/audio", { recursive: true });

for (const { verb, branchId, chunk } of publishedChunks()) {
  const branch = verb.branches.find((item) => item.id === branchId);
  if (!branch) continue;
  const spoken = `${branch.full_verb}. ${fullSentence(chunk.sentence_bracket)}`;
  const target = `public/audio/${chunk.chunk_id}.m4a`;
  execFileSync("say", ["-v", "Anna", "-o", target, "--file-format=m4af", spoken], { stdio: "inherit" });
  console.log(target);
}
