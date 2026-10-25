import type { BaseVerbNode, VerbChunk } from "@/types/verb.schema";
import { fahren } from "@/content/verbs/fahren";
import { geben } from "@/content/verbs/geben";
import { gehen } from "@/content/verbs/gehen";
import { kommen } from "@/content/verbs/kommen";
import { legen } from "@/content/verbs/legen";
import { machen } from "@/content/verbs/machen";
import { nehmen } from "@/content/verbs/nehmen";
import { setzen } from "@/content/verbs/setzen";
import { stellen } from "@/content/verbs/stellen";
import { ziehen } from "@/content/verbs/ziehen";

/** Only signed-off verbs in this list can become planets. */
export const PUBLISHED_VERBS: BaseVerbNode[] = [
  kommen,
  gehen,
  fahren,
  nehmen,
  geben,
  setzen,
  stellen,
  legen,
  machen,
  ziehen,
].sort((a, b) => a.rank_number - b.rank_number);

export function publishedChunks(): { verb: BaseVerbNode; chunk: VerbChunk; branchId: string }[] {
  return PUBLISHED_VERBS.flatMap((verb) =>
    verb.branches.flatMap((branch) =>
      branch.chunks.map((chunk) => ({ verb, chunk, branchId: branch.id })),
    ),
  );
}

export function findVerb(id: string): BaseVerbNode | undefined {
  return PUBLISHED_VERBS.find((verb) => verb.id === id);
}

export function findChunk(chunkId: string): { verb: BaseVerbNode; branchId: string; chunk: VerbChunk } | undefined {
  for (const verb of PUBLISHED_VERBS) {
    for (const branch of verb.branches) {
      const chunk = branch.chunks.find((item) => item.chunk_id === chunkId);
      if (chunk) return { verb, branchId: branch.id, chunk };
    }
  }
  return undefined;
}
