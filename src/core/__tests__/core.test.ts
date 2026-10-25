import { describe, expect, it } from "vitest";
import { computePolarPosition, lookupPrefix, MIN_SAME_RING_DEGREES } from "@/core/compassEngine";
import { lintVerb } from "@/core/grammarLint";
import { chunkWasRecalled, unlockedOnionLayer } from "@/core/onionScaffolding";
import { emptyCard, FSRS_PACKAGE_VERSION, hydrateCard, Rating, reviewCard, serializeCard, State } from "@/core/reviewScheduler";
import { bracketErrors, fullSentence, normalizeAnswer, productionPrompt } from "@/core/sentenceBracket";
import { BaseVerbNodeSchema, PrefixBranchSchema } from "@/types/verb.schema";
import { branch, chunk, defineVerb } from "@/content/author";

const NOW = new Date("2026-10-25T12:00:00.000Z");

function sampleVerb() {
  return defineVerb({
    id: "rufen",
    rank_number: 155,
    infinitive: "rufen",
    cefr_level: "A1",
    semantic_cluster: "Sprache",
    auxiliary_verb: "haben",
    stem_present_3rd: "ruft",
    stem_preterite: "rief",
    past_participle: "gerufen",
    translations: { ar: "ينادي", en: "to call", tr: "çağırmak" },
    branches: [
      branch({
        id: "rufen_an",
        prefix: "an",
        full_verb: "anrufen",
        is_separable: true,
        stress_mark: "AN·rufen",
        onion_layer: 1,
        frequency_stars: 5,
        compass_angle_deg: 15,
        tendency_de: "Oft telefonisch Kontakt aufnehmen.",
        exception_note: null,
        icon_key: "arrive",
        auxiliary_verb: "haben",
        stem_present_3rd: "ruft",
        stem_preterite: "rief",
        past_participle: "angerufen",
        chunks: [
          chunk({
            chunk_id: "rufen_an_akk",
            collocation: "anrufen + Akk",
            short_badge: "+ Akk",
            visual_title_de: "Jemanden anrufen",
            definition_de: "Mit jemandem telefonieren.",
            sentence_bracket: {
              subject_and_vorfeld: "Lea",
              verb_position_2: "ruft",
              middle_field: "ihre Schwester",
              sentence_end_prefix: "an",
            },
            native_anchors: { ar: "يتصل بشخص", en: "to call someone", tr: "telefon etmek" },
          }),
        ],
      }),
      branch({
        id: "rufen_zurueck",
        prefix: "zurück",
        full_verb: "zurückrufen",
        is_separable: true,
        stress_mark: "zu·RÜCK·rufen",
        onion_layer: 1,
        frequency_stars: 5,
        compass_angle_deg: 265,
        tendency_de: "Oft einen Anruf erwidern.",
        exception_note: null,
        icon_key: "return",
        auxiliary_verb: "haben",
        stem_present_3rd: "ruft",
        stem_preterite: "rief",
        past_participle: "zurückgerufen",
        chunks: [
          chunk({
            chunk_id: "rufen_zurueck_akk",
            collocation: "zurückrufen + Akk",
            short_badge: "+ Akk",
            visual_title_de: "Zurückrufen",
            definition_de: "Einen Anruf erwidern.",
            sentence_bracket: {
              subject_and_vorfeld: "Tom",
              verb_position_2: "ruft",
              middle_field: "Lea später",
              sentence_end_prefix: "zurück",
            },
            native_anchors: { ar: "يعيد الاتصال", en: "to call back", tr: "geri aramak" },
          }),
        ],
      }),
      branch({
        id: "rufen_aus",
        prefix: "aus",
        full_verb: "ausrufen",
        is_separable: true,
        stress_mark: "AUS·rufen",
        onion_layer: 1,
        frequency_stars: 4,
        compass_angle_deg: 205,
        tendency_de: "Oft laut sagen.",
        exception_note: null,
        icon_key: null,
        auxiliary_verb: "haben",
        stem_present_3rd: "ruft",
        stem_preterite: "rief",
        past_participle: "ausgerufen",
        chunks: [
          chunk({
            chunk_id: "rufen_aus_akk",
            collocation: "ausrufen + Akk",
            short_badge: "+ Akk",
            visual_title_de: "Laut ausrufen",
            definition_de: "Etwas laut verkünden.",
            sentence_bracket: {
              subject_and_vorfeld: "Anna",
              verb_position_2: "ruft",
              middle_field: "den Gewinner",
              sentence_end_prefix: "aus",
            },
            native_anchors: { ar: "ينادي بصوت عال", en: "to call out", tr: "yüksek sesle söylemek" },
          }),
        ],
      }),
    ],
  });
}

describe("compass", () => {
  it("puts angle 0 at 12 o'clock and separable verbs on the outer radius", () => {
    const outer = computePolarPosition(100, 100, 80, 40, 0, true);
    expect(outer.radiusUsed).toBe(80);
    expect(outer.x).toBeCloseTo(100);
    expect(outer.y).toBeCloseTo(20);

    const inner = computePolarPosition(100, 100, 80, 40, 0, false);
    expect(inner.radiusUsed).toBe(40);
    expect(inner.y).toBeCloseTo(60);

    const east = computePolarPosition(0, 0, 10, 5, 90, true);
    expect(east.x).toBeCloseTo(10);
    expect(east.y).toBeCloseTo(0);
  });

  it("does not invent a separable default for an unknown prefix", () => {
    expect(lookupPrefix("ge")).toBeNull();
    expect(lookupPrefix("sich er")).toBeNull();
    expect(lookupPrefix("xyz")).toBeNull();
  });

  it("keeps variable prefixes from a single separability rule", () => {
    expect(lookupPrefix("um")?.defaultSeparable).toBeNull();
    expect(lookupPrefix("durch")?.defaultSeparable).toBeNull();
    expect(lookupPrefix("unter")?.defaultSeparable).toBeNull();
    expect(MIN_SAME_RING_DEGREES).toBeGreaterThanOrEqual(14);
  });
});

describe("schema", () => {
  it("parses a signed verb and rejects ge-, empty chunks, and a prefix-only separability flag", () => {
    const verb = sampleVerb();
    expect(BaseVerbNodeSchema.parse(verb).id).toBe("rufen");

    const withGe = structuredClone(verb);
    withGe.branches[0]!.prefix = "ge";
    expect(PrefixBranchSchema.safeParse(withGe.branches[0]).success).toBe(false);

    const noChunks = structuredClone(verb.branches[0]);
    noChunks!.chunks = [];
    expect(PrefixBranchSchema.safeParse(noChunks).success).toBe(false);

    expect(PrefixBranchSchema.safeParse({ prefix: "um", is_separable: true }).success).toBe(false);
  });
});

describe("sentence bracket", () => {
  it("reads the stored bracket and never invents position 2", () => {
    const verb = sampleVerb();
    const anrufen = verb.branches[0]!;
    const bracket = anrufen.chunks[0]!.sentence_bracket;
    expect(fullSentence(bracket)).toBe("Lea ruft ihre Schwester an.");
    expect(bracketErrors(anrufen, bracket)).toEqual([]);
    expect(productionPrompt(anrufen, bracket).answer).toBe("an");
    expect(normalizeAnswer(" An. ")).toBe("an");
  });
});

describe("grammar lint", () => {
  it("accepts the sample and rejects flattened or stacked verbs", () => {
    const verb = sampleVerb();
    expect(lintVerb(verb)).toEqual([]);

    const bekommen = structuredClone(verb);
    bekommen.id = "kommen";
    bekommen.branches[0]!.prefix = "be";
    bekommen.branches[0]!.full_verb = "bekommen";
    bekommen.branches[0]!.is_separable = false;
    expect(lintVerb(bekommen).some((error) => error.includes("bekommen"))).toBe(true);

    const bareIn = structuredClone(verb);
    bareIn.branches[0]!.chunks[0]!.collocation = "anrufen + in";
    expect(lintVerb(bareIn).some((error) => error.includes("+Akk or +Dat"))).toBe(true);

    const stacked = structuredClone(verb);
    stacked.branches[1]!.compass_angle_deg = stacked.branches[0]!.compass_angle_deg;
    stacked.branches[1]!.angle_override = true;
    stacked.branches[1]!.exception_note = "nur für den Test";
    expect(lintVerb(stacked).some((error) => error.includes("apart"))).toBe(true);
  });
});

describe("onion", () => {
  it("keeps layer 2 locked until every layer-1 chunk was recalled", () => {
    const verb = sampleVerb();
    expect(unlockedOnionLayer(verb, {})).toBe(1);
    const partial: Record<string, { reps: number; lastRating: 1 | 2 | 3 | 4 | null }> = {
      rufen_an_akk: { reps: 1, lastRating: 3 },
    };
    expect(unlockedOnionLayer(verb, partial)).toBe(1);
    const done = {
      rufen_an_akk: { reps: 1, lastRating: 3 as const },
      rufen_zurueck_akk: { reps: 1, lastRating: 4 as const },
      rufen_aus_akk: { reps: 1, lastRating: 2 as const },
    };
    expect(unlockedOnionLayer(verb, done)).toBe(3);
    expect(chunkWasRecalled({ reps: 1, lastRating: 1 })).toBe(false);
  });
});

describe(`FSRS ${FSRS_PACKAGE_VERSION}`, () => {
  it("keeps Again in learning and advances Good one step, with fuzz off", () => {
    const card = emptyCard(NOW);
    const again = reviewCard(card, NOW, Rating.Again);
    const good = reviewCard(card, NOW, Rating.Good);

    expect(again.card.state).toBe(State.Learning);
    expect(again.card.learning_steps).toBe(0);
    expect(again.card.due.toISOString()).toBe("2026-10-25T12:01:00.000Z");

    expect(good.card.state).toBe(State.Learning);
    expect(good.card.learning_steps).toBe(1);
    expect(good.card.due.toISOString()).toBe("2026-10-25T12:10:00.000Z");
    expect(good.card.due.getTime()).toBeGreaterThan(NOW.getTime());

    const stored = serializeCard(good.card);
    expect(hydrateCard(stored).due.toISOString()).toBe(stored.due);
    expect(stored.due).toBe(good.card.due.toISOString());
  });
});
