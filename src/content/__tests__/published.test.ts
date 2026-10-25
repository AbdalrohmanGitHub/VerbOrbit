import { describe, expect, it } from "vitest";
import { lintVerb } from "@/core/grammarLint";
import { fullSentence } from "@/core/sentenceBracket";
import { PUBLISHED_VERBS, publishedChunks } from "@/content/published";
import { BaseVerbNodeSchema } from "@/types/verb.schema";

describe("published verbs", () => {
  it("publishes the ten prefix-rich verbs and no prototype tuples", () => {
    expect(PUBLISHED_VERBS.map((verb) => verb.id)).toEqual([
      "geben",
      "machen",
      "kommen",
      "gehen",
      "stellen",
      "nehmen",
      "setzen",
      "ziehen",
      "legen",
      "fahren",
    ]);
    expect(PUBLISHED_VERBS.some((verb) => verb.id === "wissen" || verb.id === "kennen")).toBe(false);
  });

  it("parses and lints every verb, including both umfahren branches", () => {
    const errors = PUBLISHED_VERBS.flatMap((verb) => {
      BaseVerbNodeSchema.parse(verb);
      return lintVerb(verb);
    });
    expect(errors).toEqual([]);

    const fahren = PUBLISHED_VERBS.find((verb) => verb.id === "fahren");
    const um = fahren?.branches.filter((branch) => branch.full_verb === "umfahren") ?? [];
    expect(um.map((branch) => branch.is_separable).sort()).toEqual([false, true]);
    expect(publishedChunks().every((item) => item.chunk.original && item.chunk.signed_off)).toBe(true);
    expect(fullSentence(PUBLISHED_VERBS.find((verb) => verb.id === "kommen")!.branches[0]!.chunks[0]!.sentence_bracket)).toBe(
      "Der Zug kommt pünktlich in Berlin an.",
    );
  });
});
