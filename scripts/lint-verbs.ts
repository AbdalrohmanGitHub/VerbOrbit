import { lintVerb } from "../src/core/grammarLint";
import { PUBLISHED_VERBS } from "../src/content/published";

const errors = PUBLISHED_VERBS.flatMap((verb) => lintVerb(verb));

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`${PUBLISHED_VERBS.length} verbs passed the grammar lint.`);
