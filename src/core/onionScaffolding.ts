import type { BaseVerbNode, OnionLayer, PrefixBranch } from "@/types/verb.schema";

export const RING_PAGE_SIZE = 8;

export type ChunkRecall = {
  reps: number;
  lastRating: 1 | 2 | 3 | 4 | null;
};

const SUCCESSFUL = new Set([2, 3, 4]);

export function chunkWasRecalled(recall: ChunkRecall | undefined): boolean {
  if (!recall || recall.reps < 1 || recall.lastRating === null) return false;
  return SUCCESSFUL.has(recall.lastRating);
}

export function unlockedOnionLayer(
  verb: BaseVerbNode,
  recallByChunk: Record<string, ChunkRecall | undefined>,
): OnionLayer {
  const layerOne = verb.branches.filter((branch) => branch.onion_layer === 1);
  if (layerOne.length === 0) return 1;
  const ready = layerOne.every((branch) => chunkWasRecalled(recallByChunk[branch.chunks[0]?.chunk_id ?? ""]));
  if (!ready) return 1;
  const layerTwo = verb.branches.filter((branch) => branch.onion_layer === 2);
  const layerTwoReady =
    layerTwo.length === 0 ||
    layerTwo.every((branch) => chunkWasRecalled(recallByChunk[branch.chunks[0]?.chunk_id ?? ""]));
  return layerTwoReady ? 3 : 2;
}

export function branchesForLayer(verb: BaseVerbNode, layer: OnionLayer, minStars: number): PrefixBranch[] {
  return verb.branches
    .filter((branch) => branch.onion_layer <= layer && branch.frequency_stars >= minStars)
    .slice()
    .sort((a, b) => a.compass_angle_deg - b.compass_angle_deg);
}

export function placeholderBranches(verb: BaseVerbNode, layer: OnionLayer, unlocked: OnionLayer): PrefixBranch[] {
  if (layer >= unlocked) return [];
  const next = (layer + 1) as OnionLayer;
  return verb.branches.filter((branch) => branch.onion_layer === next);
}

export function pageRing<T>(items: T[], page: number, pageSize = RING_PAGE_SIZE): {
  pageItems: T[];
  page: number;
  pageCount: number;
} {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = ((page % pageCount) + pageCount) % pageCount;
  const start = safePage * pageSize;
  return {
    pageItems: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
  };
}
