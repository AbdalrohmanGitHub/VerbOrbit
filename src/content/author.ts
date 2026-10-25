import { lookupPrefix } from "@/core/compassEngine";
import {
  BaseVerbNodeSchema,
  type BaseVerbNode,
  type PrefixBranch,
  type VerbChunk,
} from "@/types/verb.schema";

type ChunkInput = Omit<VerbChunk, "original" | "signed_off">;

export function chunk(input: ChunkInput): VerbChunk {
  return {
    ...input,
    original: true,
    signed_off: true,
  };
}

type BranchInput = Omit<PrefixBranch, "color_hex" | "angle_override"> & {
  angle_override?: boolean;
};

export function branch(input: BranchInput): PrefixBranch {
  const slot = lookupPrefix(input.prefix);
  if (!slot) {
    throw new Error(`Prefix "${input.prefix}" has no compass slot. Add a slot or do not invent a separable default.`);
  }
  const angleOverride = input.angle_override ?? input.compass_angle_deg !== slot.angleDeg;
  return {
    ...input,
    angle_override: angleOverride,
    color_hex: slot.colorHex,
  };
}

export function defineVerb(input: Omit<BaseVerbNode, "signed_off">): BaseVerbNode {
  return BaseVerbNodeSchema.parse({
    ...input,
    signed_off: true,
  });
}
