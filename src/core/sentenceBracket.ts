import type { PrefixBranch, SentenceBracket } from "@/types/verb.schema";

export function fullSentence(bracket: SentenceBracket): string {
  const end = bracket.sentence_end_prefix;
  const tail = end ? `${end}.` : ".";
  return `${bracket.subject_and_vorfeld} ${bracket.verb_position_2} ${bracket.middle_field} ${tail}`
    .replace(/\s+/g, " ")
    .trim();
}

export function joinedInfinitive(prefix: string, stem: string, isSeparable: boolean): string {
  if (!isSeparable) return stem;
  return `${prefix}${stem}`;
}

/**
 * Checks a stored bracket. It never builds a sentence from a bare stem.
 */
export function bracketErrors(branch: Pick<PrefixBranch, "prefix" | "is_separable">, bracket: SentenceBracket): string[] {
  const errors: string[] = [];
  const verb = bracket.verb_position_2;
  const end = bracket.sentence_end_prefix;

  if (branch.is_separable) {
    if (end !== branch.prefix) {
      errors.push(`separable ${branch.prefix}: sentence end must be "${branch.prefix}", got ${end ?? "null"}`);
    }
    if (verb.toLowerCase().startsWith(branch.prefix.toLowerCase())) {
      errors.push(`separable ${branch.prefix}: position 2 must be the bare stem, got "${verb}"`);
    }
  } else {
    if (end !== null) {
      errors.push(`inseparable ${branch.prefix}: sentence end must be null, got "${end}"`);
    }
    if (!verb.toLowerCase().startsWith(branch.prefix.toLowerCase())) {
      errors.push(`inseparable ${branch.prefix}: position 2 must keep the prefix, got "${verb}"`);
    }
  }

  return errors;
}

export function productionPrompt(branch: Pick<PrefixBranch, "prefix" | "is_separable">, bracket: SentenceBracket): {
  before: string;
  blank: string;
  after: string;
  answer: string;
} {
  if (branch.is_separable) {
    return {
      before: `${bracket.subject_and_vorfeld} ${bracket.verb_position_2} ${bracket.middle_field}`,
      blank: "___",
      after: ".",
      answer: branch.prefix,
    };
  }
  return {
    before: bracket.subject_and_vorfeld,
    blank: "___",
    after: `${bracket.middle_field}.`,
    answer: bracket.verb_position_2,
  };
}

export function normalizeAnswer(value: string): string {
  return value.trim().toLocaleLowerCase("de-DE").replace(/\.$/, "");
}
