import {
  angularSeparation,
  lookupPrefix,
  MIN_SAME_RING_DEGREES,
} from "@/core/compassEngine";
import { bracketErrors } from "@/core/sentenceBracket";
import type { BaseVerbNode, PrefixBranch } from "@/types/verb.schema";

const ARABIC_LETTERS = /[\u0600-\u06FF]/;
const TASHKEEL = /[\u064B-\u0652\u0670]/;
const GOVERNED =
  /\b(in|an|auf|über|unter|vor|hinter|neben|zwischen|bei|mit|nach|aus|zu|von|für|durch|um)\b/i;
const CASE_MARK = /\+\s*(Akk|Dat)\b/;

const FORBIDDEN_FULL_VERBS = new Set(["bekommen", "gefallen"]);

export function expectedSeparableParticiple(prefix: string, baseParticiple: string): string {
  return `${prefix}${baseParticiple}`;
}

export function lintVerb(verb: BaseVerbNode): string[] {
  const errors: string[] = [];
  if (!verb.signed_off) errors.push(`${verb.id}: missing sign-off`);

  const seenBranch = new Set<string>();
  const seenChunk = new Set<string>();

  for (const branch of verb.branches) {
    errors.push(...lintBranch(verb, branch, seenBranch, seenChunk));
  }

  errors.push(...lintRingAngles(verb));
  return errors;
}

function lintBranch(
  verb: BaseVerbNode,
  branch: PrefixBranch,
  seenBranch: Set<string>,
  seenChunk: Set<string>,
): string[] {
  const errors: string[] = [];
  const label = `${verb.id}/${branch.id}`;

  if (seenBranch.has(branch.id)) errors.push(`${label}: duplicate branch id`);
  seenBranch.add(branch.id);

  if (branch.prefix.toLowerCase() === "ge") {
    errors.push(`${label}: ge- is forbidden`);
  }
  if (FORBIDDEN_FULL_VERBS.has(branch.full_verb)) {
    errors.push(`${label}: ${branch.full_verb} is a lexical verb, not a prefix branch`);
  }
  if (verb.id === "kommen" && branch.full_verb === "bekommen") {
    errors.push(`${label}: bekommen is not be- + kommen`);
  }
  if (verb.id === "fallen" && branch.full_verb === "gefallen") {
    errors.push(`${label}: gefallen is not ge- + fallen`);
  }

  const slot = lookupPrefix(branch.prefix);
  if (!slot) {
    errors.push(`${label}: prefix "${branch.prefix}" has no compass slot and must not default to separable`);
  } else {
    if (!branch.angle_override && branch.compass_angle_deg !== slot.angleDeg) {
      errors.push(`${label}: angle ${branch.compass_angle_deg} does not match compass ${slot.angleDeg}`);
    }
    if (branch.color_hex.toLowerCase() !== slot.colorHex.toLowerCase()) {
      errors.push(`${label}: color must stay ${slot.colorHex}`);
    }
    const separabilityDiffers = slot.defaultSeparable !== null && branch.is_separable !== slot.defaultSeparable;
    if ((slot.defaultSeparable === null || separabilityDiffers || branch.angle_override) && !branch.exception_note) {
      errors.push(`${label}: variable or overridden prefix needs exception_note`);
    }
  }

  if (branch.is_separable) {
    const expected = expectedSeparableParticiple(branch.prefix, verb.past_participle);
    if (branch.past_participle !== expected) {
      errors.push(`${label}: participle ${branch.past_participle} should be ${expected}`);
    }
  } else {
    const separableShape = expectedSeparableParticiple(branch.prefix, verb.past_participle);
    if (branch.past_participle === separableShape) {
      errors.push(`${label}: inseparable participle must not be the separable ge-form ${separableShape}`);
    }
  }

  if (branch.chunks.length === 0) errors.push(`${label}: a branch needs a chunk`);

  for (const chunk of branch.chunks) {
    if (seenChunk.has(chunk.chunk_id)) errors.push(`${chunk.chunk_id}: duplicate chunk id`);
    seenChunk.add(chunk.chunk_id);
    if (!chunk.original || !chunk.signed_off) errors.push(`${chunk.chunk_id}: must be original and signed off`);
    if (TASHKEEL.test(chunk.native_anchors.ar) || TASHKEEL.test(verb.translations.ar)) {
      errors.push(`${chunk.chunk_id}: Arabic tashkeel is off by default`);
    }
    if (ARABIC_LETTERS.test(chunk.native_anchors.tr) || ARABIC_LETTERS.test(chunk.native_anchors.en)) {
      errors.push(`${chunk.chunk_id}: Turkish or English contains Arabic letters`);
    }
    if (GOVERNED.test(chunk.collocation) && !CASE_MARK.test(chunk.collocation)) {
      errors.push(`${chunk.chunk_id}: governed preposition needs +Akk or +Dat`);
    }
    for (const problem of bracketErrors(branch, chunk.sentence_bracket)) {
      errors.push(`${chunk.chunk_id}: ${problem}`);
    }
  }

  return errors;
}

function lintRingAngles(verb: BaseVerbNode): string[] {
  const errors: string[] = [];
  for (const separable of [true, false]) {
    const group = verb.branches.filter((branch) => branch.is_separable === separable);
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const left = group[i];
        const right = group[j];
        if (!left || !right) continue;
        const gap = angularSeparation(left.compass_angle_deg, right.compass_angle_deg);
        if (gap < MIN_SAME_RING_DEGREES) {
          errors.push(
            `${verb.id}: ${left.full_verb} and ${right.full_verb} are ${gap}° apart on the ${separable ? "outer" : "inner"} ring`,
          );
        }
      }
    }
  }
  return errors;
}
