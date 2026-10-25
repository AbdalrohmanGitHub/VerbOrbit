import { z } from "zod";

export const NATIVE_LANGS = ["ar", "en", "tr"] as const;
export type NativeLang = (typeof NATIVE_LANGS)[number];

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

export const SEMANTIC_CLUSTERS = [
  "Bewegung",
  "Position",
  "Besitz",
  "Sprache",
  "Alltag",
  "Zustand",
] as const;
export type SemanticCluster = (typeof SEMANTIC_CLUSTERS)[number];

export const ICON_KEYS = [
  "arrive",
  "up_open",
  "enter",
  "forward",
  "down_off",
  "out_exit",
  "return",
  "together",
  "transform",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export const ONION_LAYERS = [1, 2, 3] as const;
export type OnionLayer = (typeof ONION_LAYERS)[number];

const nativeText = z.string().trim().min(1);

export const NativeAnchorsSchema = z
  .object({
    ar: nativeText,
    en: nativeText,
    tr: nativeText,
  })
  .strict();

export const SentenceBracketSchema = z
  .object({
    subject_and_vorfeld: nativeText,
    verb_position_2: nativeText,
    middle_field: nativeText,
    sentence_end_prefix: z.string().trim().min(1).nullable(),
  })
  .strict();

export const VerbChunkSchema = z
  .object({
    chunk_id: z
      .string()
      .regex(/^[a-z0-9_]+$/, "chunk ids stay ascii so audio files stay portable"),
    collocation: nativeText,
    short_badge: nativeText,
    visual_title_de: nativeText,
    definition_de: nativeText,
    sentence_bracket: SentenceBracketSchema,
    native_anchors: NativeAnchorsSchema,
    original: z.literal(true),
    signed_off: z.literal(true),
  })
  .strict();

const prefixSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.toLowerCase() !== "ge", {
    message: "ge- is the participle marker, not a verbal prefix",
  });

export const PrefixBranchSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9_]+$/),
    prefix: prefixSchema,
    full_verb: nativeText,
    is_separable: z.boolean(),
    stress_mark: nativeText,
    onion_layer: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    frequency_stars: z.number().int().min(1).max(5),
    compass_angle_deg: z.number().int().min(0).max(359),
    angle_override: z.boolean(),
    color_hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    tendency_de: nativeText,
    exception_note: z.string().trim().min(1).nullable(),
    icon_key: z.enum(ICON_KEYS).nullable(),
    auxiliary_verb: z.enum(["haben", "sein"]),
    stem_present_3rd: nativeText,
    stem_preterite: nativeText,
    past_participle: nativeText,
    chunks: z.array(VerbChunkSchema).min(1).max(4),
  })
  .strict();

export const BaseVerbNodeSchema = z
  .object({
    id: z.string().regex(/^[a-z]+$/),
    rank_number: z.number().int().positive(),
    infinitive: nativeText,
    cefr_level: z.enum(CEFR_LEVELS),
    semantic_cluster: z.enum(SEMANTIC_CLUSTERS),
    auxiliary_verb: z.enum(["haben", "sein"]),
    stem_present_3rd: nativeText,
    stem_preterite: nativeText,
    past_participle: nativeText,
    translations: NativeAnchorsSchema,
    branches: z.array(PrefixBranchSchema).min(3).max(8),
    signed_off: z.literal(true),
  })
  .strict();

export type NativeAnchors = z.infer<typeof NativeAnchorsSchema>;
export type SentenceBracket = z.infer<typeof SentenceBracketSchema>;
export type VerbChunk = z.infer<typeof VerbChunkSchema>;
export type PrefixBranch = z.infer<typeof PrefixBranchSchema>;
export type BaseVerbNode = z.infer<typeof BaseVerbNodeSchema>;
