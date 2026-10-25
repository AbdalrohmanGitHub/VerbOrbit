"use client";

import { useEffect, useState } from "react";
import { SEMANTIC_CLUSTERS, type CefrLevel, type OnionLayer, type SemanticCluster } from "@/types/verb.schema";
import { findVerb, PUBLISHED_VERBS } from "@/content/published";
import { angularSeparation } from "@/core/compassEngine";
import { branchesForLayer, pageRing, RING_PAGE_SIZE, unlockedOnionLayer } from "@/core/onionScaffolding";
import { fullSentence } from "@/core/sentenceBracket";
import { playChunkAudio } from "@/lib/audio";
import { MindlyOrbitCanvas } from "@/components/orbit/MindlyOrbitCanvas";
import type { OrbitPlanet } from "@/components/orbit/OrbitPlanetNode";
import { ChunkSelectorPills } from "@/components/learning/ChunkSelectorPills";
import { DualCodingAnimator } from "@/components/learning/DualCodingAnimator";
import { NativeAnchorPeek } from "@/components/learning/NativeAnchorPeek";
import { PhysicsSentenceSling, principalParts } from "@/components/learning/PhysicsSentenceSling";
import { ReviewHud } from "@/components/review/ReviewHud";
import { VerbGalaxyDrawer } from "@/components/catalog/VerbGalaxyDrawer";
import { AccountPanel } from "@/components/account/AccountPanel";
import { effectiveOnion, openDueChunk, useVerbOrbitStore } from "@/store/useVerbOrbitStore";

const CLUSTER_ANGLES: Record<SemanticCluster, number> = {
  Bewegung: 20,
  Position: 80,
  Besitz: 140,
  Sprache: 200,
  Alltag: 260,
  Zustand: 320,
};

export function VerbOrbitApp() {
  const store = useVerbOrbitStore();
  const [catalog, setCatalog] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const [hinting, setHinting] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const [audioNote, setAudioNote] = useState("");
  const [lockNote, setLockNote] = useState("");

  useEffect(() => {
    const unsub = useVerbOrbitStore.persist.onFinishHydration(() => {
      openDueChunk();
    });
    void useVerbOrbitStore.persist.rehydrate();
    return () => unsub();
  }, []);

  const activeVerb = store.view.kind === "verb" ? findVerb(store.view.verbId) : undefined;
  const branch = activeVerb?.branches.find((item) => item.chunks.some((chunk) => chunk.chunk_id === store.selectedChunkId));
  const chunk = branch?.chunks.find((item) => item.chunk_id === store.selectedChunkId) ?? branch?.chunks[0];

  const unlocked = activeVerb ? unlockedOnionLayer(activeVerb, recallFrom(store.progress)) : 1;
  const layer = activeVerb ? effectiveOnion(activeVerb.id, store.onionChoice[activeVerb.id], store.progress) : 1;

  const model = buildOrbit(store.view, store.cefr, store.minStars, layer);
  const paged = pageRing(model.planets, page, RING_PAGE_SIZE);

  function resetQuiz() {
    setPage(0);
    setQuiz(false);
    setHinting(false);
    setPrefill(null);
  }

  function selectPlanet(id: string) {
    if (id.startsWith("cluster:")) {
      resetQuiz();
      store.setView({ kind: "cluster", cluster: id.slice(8) as SemanticCluster });
      return;
    }
    if (id.startsWith("verb:")) {
      const verb = findVerb(id.slice(5));
      if (!verb) return;
      const first = verb.branches.find((item) => item.onion_layer === 1) ?? verb.branches[0];
      resetQuiz();
      store.setView({ kind: "verb", verbId: verb.id });
      if (first) store.selectChunk(first.chunks[0]!.chunk_id);
      return;
    }
    if (id.startsWith("lock:")) {
      const branchId = id.slice(5);
      const lockedBranch = activeVerb?.branches.find((item) => item.id === branchId);
      if (activeVerb && lockedBranch && lockedBranch.onion_layer <= unlocked) store.setOnion(activeVerb.id, lockedBranch.onion_layer);
      else setLockNote("Zuerst die sichtbaren Verben erinnern. Die nächste Schicht bleibt zu.");
      return;
    }
    if (quiz) {
      if (!hinting) return;
      const hinted = hintPlanets(paged.pageItems, branch?.id);
      if (!hinted.includes(id)) return;
      const picked = activeVerb?.branches.find((item) => item.id === id);
      if (!picked) return;
      setPrefill(picked.is_separable ? picked.prefix : picked.stem_present_3rd);
      return;
    }
    const picked = activeVerb?.branches.find((item) => item.id === id);
    if (picked) store.selectChunk(picked.chunks[0]!.chunk_id);
  }

  const hintIds = quiz && hinting && branch ? hintPlanets(paged.pageItems, branch.id) : [];
  const visiblePlanets = paged.pageItems.map((planet) => {
    if (!quiz || planet.placeholder) return planet;
    const revealed = hintIds.includes(planet.id);
    return {
      ...planet,
      label: revealed ? planet.label : "?",
      quiet: hinting && !revealed,
    };
  });
  const listItems = paged.pageItems.map((planet) => ({
    id: planet.id,
    name: quiz && !planet.placeholder && !hintIds.includes(planet.id) ? "Planet" : planet.placeholder ? "Gesperrte Schicht" : planet.label,
  }));

  async function playCurrent() {
    if (!chunk || !branch) return;
    setAudioNote("");
    const spoken = `${branch.full_verb}. ${fullSentence(chunk.sentence_bracket)}`;
    const result = await playChunkAudio(chunk.chunk_id, spoken);
    if (result === "unavailable") setAudioNote("Audio unavailable");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col">
      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 px-3 py-2 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="min-h-11 min-w-11 rounded-full bg-white font-extrabold shadow" onClick={() => { resetQuiz(); store.goBack(); }} aria-label="Zurück">
            ←
          </button>
          <div className="mr-auto">
            <p className="text-lg font-extrabold text-blue-700">VerbOrbit</p>
            <p className="text-[11px] font-bold text-slate-500">Serie {store.streak.count} · nur nach erledigter Wiederholung</p>
          </div>
          <button type="button" className="min-h-11 rounded-2xl bg-white px-3 text-sm font-extrabold shadow" onClick={() => setCatalog(true)}>
            Katalog
          </button>
          <button type="button" className="min-h-11 rounded-2xl bg-white px-3 text-sm font-extrabold shadow" onClick={() => setAccountOpen(true)}>
            Konto
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {([1, 2, 3] as OnionLayer[]).map((value) => (
            <button
              key={value}
              id={`onion-${value}`}
              type="button"
              disabled={!activeVerb || value > unlocked}
              className={`min-h-11 rounded-xl px-3 text-xs font-extrabold ${layer === value ? "bg-blue-600 text-white" : "bg-white text-slate-700"} disabled:opacity-40`}
              onClick={() => activeVerb && store.setOnion(activeVerb.id, value)}
            >
              Schicht {value}
            </button>
          ))}
          <select
            aria-label="Muttersprache"
            className="min-h-11 rounded-xl bg-amber-50 px-2 text-sm font-extrabold"
            value={store.nativeLang}
            onChange={(event) => store.setNativeLang(event.target.value as typeof store.nativeLang)}
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="tr">Türkçe</option>
          </select>
          <select
            aria-label="Niveau"
            className="min-h-11 rounded-xl bg-white px-2 text-sm font-bold"
            value={store.cefr}
            onChange={(event) => store.setCefr(event.target.value as "ALL" | CefrLevel)}
          >
            <option value="ALL">Alle Niveaus</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
          </select>
          <button type="button" className="min-h-11 rounded-xl bg-amber-100 px-3 text-xs font-extrabold text-amber-900" onClick={() => store.setMinStars(store.minStars >= 5 ? 1 : store.minStars + 1)}>
            ab {store.minStars}★
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row">
        <MindlyOrbitCanvas
          planets={visiblePlanets}
          listItems={listItems}
          centerTitle={model.centerTitle}
          centerKicker={model.centerKicker}
          parentTitle={model.parentTitle}
          parentKicker={model.parentKicker}
          selectedId={branch?.id ?? null}
          showInnerRing={store.view.kind === "verb"}
          page={paged.page}
          pageCount={paged.pageCount}
          onPage={setPage}
          onSelect={selectPlanet}
          onParent={() => {
            resetQuiz();
            store.goUp();
          }}
          onCenter={() => void playCurrent()}
        />
        <aside className="z-20 w-full border-t border-slate-200 bg-white/95 p-4 lg:max-w-md lg:border-t-0 lg:border-l">
          {lockNote ? <p className="mb-3 text-sm font-bold text-amber-800">{lockNote}</p> : null}
          {quiz && branch && chunk ? (
            <ReviewHud
              key={chunk.chunk_id}
              branch={branch}
              chunk={chunk}
              prefill={prefill}
              onNeedHint={() => setHinting(true)}
              onClose={() => {
                setQuiz(false);
                setHinting(false);
              }}
              onRate={(grade) => store.rateChunk(chunk.chunk_id, grade)}
            />
          ) : branch && chunk && activeVerb ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-xl px-3 py-1 text-sm font-black" style={{ background: `${branch.color_hex}33` }}>
                  {branch.stress_mark}
                </span>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-extrabold">
                  {branch.is_separable ? "trennbar" : "untrennbar"}
                </span>
                <span className="text-amber-500">{"★".repeat(branch.frequency_stars)}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-500">{principalParts(branch)}</p>
              <div className="mt-3 flex items-start gap-3">
                <DualCodingAnimator icon={branch.icon_key} color={branch.color_hex} />
                <div>
                  <h2 className="text-base font-extrabold">{chunk.visual_title_de}</h2>
                  <p className="text-sm text-slate-600">{chunk.definition_de}</p>
                  <p className="mt-1 text-xs text-slate-500">Tendenz, nicht Regel: {branch.tendency_de}</p>
                  {branch.exception_note ? <p className="mt-1 text-xs font-bold text-indigo-700">{branch.exception_note}</p> : null}
                </div>
              </div>
              <div className="mt-3">
                <ChunkSelectorPills chunks={branch.chunks} activeId={chunk.chunk_id} onSelect={(id) => store.selectChunk(id)} />
              </div>
              <div className="mt-3">
                <PhysicsSentenceSling branch={branch} bracket={chunk.sentence_bracket} autoplay={!quiz} />
              </div>
              <div className="mt-3">
                <NativeAnchorPeek
                  anchors={chunk.native_anchors}
                  lang={store.nativeLang}
                  shown={store.showTranslation}
                  onToggle={store.setShowTranslation}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button id="play-audio" type="button" className="min-h-11 rounded-xl bg-slate-900 px-4 font-extrabold text-white" onClick={() => void playCurrent()}>
                  Hören
                </button>
                <button
                  id="start-quiz"
                  type="button"
                  className="min-h-11 rounded-xl bg-violet-700 px-4 font-extrabold text-white"
                  onClick={() => {
                    setQuiz(true);
                    setHinting(false);
                    setPrefill(null);
                    store.setShowTranslation(false);
                  }}
                >
                  Üben
                </button>
              </div>
              {audioNote ? <p className="mt-2 text-sm font-bold text-rose-700">{audioNote}</p> : null}
              <p className="mt-3 text-xs text-slate-500">
                {activeVerb.stem_present_3rd} · {activeVerb.stem_preterite} · {activeVerb.auxiliary_verb} {activeVerb.past_participle}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-extrabold">{model.centerTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {store.view.kind === "galaxy"
                  ? "Wähle ein Wortfeld. In der Mitte siehst du nur diese Ebene."
                  : "Wähle ein Verb. Leere Felder kommen in einer späteren Lektion."}
              </p>
            </div>
          )}
        </aside>
      </main>
      <VerbGalaxyDrawer open={catalog} cefr={store.cefr} onClose={() => setCatalog(false)} onPick={(verbId) => selectPlanet(`verb:${verbId}`)} />
      <AccountPanel open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}

function recallFrom(progress: ReturnType<typeof useVerbOrbitStore.getState>["progress"]) {
  return Object.fromEntries(Object.values(progress).map((record) => [record.chunkId, { reps: record.card.reps, lastRating: record.lastRating }]));
}

function buildOrbit(
  view: ReturnType<typeof useVerbOrbitStore.getState>["view"],
  cefr: "ALL" | CefrLevel,
  minStars: number,
  layer: OnionLayer,
): {
  planets: OrbitPlanet[];
  centerTitle: string;
  centerKicker: string;
  parentTitle: string;
  parentKicker: string;
} {
  if (view.kind === "galaxy") {
    return {
      centerTitle: "10 Verben",
      centerKicker: "Galaxie",
      parentTitle: "Start",
      parentKicker: "oben",
      planets: SEMANTIC_CLUSTERS.map((cluster) => ({
        id: `cluster:${cluster}`,
        label: cluster,
        angle: CLUSTER_ANGLES[cluster],
        separable: true,
        color: "#93c5fd",
      })),
    };
  }
  if (view.kind === "cluster") {
    const verbs = PUBLISHED_VERBS.filter((verb) => verb.semantic_cluster === view.cluster && (cefr === "ALL" || verb.cefr_level === cefr));
    return {
      centerTitle: view.cluster,
      centerKicker: `${verbs.length} Verben`,
      parentTitle: "Galaxie",
      parentKicker: "zurück",
      planets: verbs.map((verb, index) => ({
        id: `verb:${verb.id}`,
        label: verb.infinitive,
        angle: verbs.length === 1 ? 0 : (360 / verbs.length) * index,
        separable: true,
        color: "#60a5fa",
      })),
    };
  }
  const verb = findVerb(view.verbId);
  if (!verb) {
    return { planets: [], centerTitle: "Verb", centerKicker: "", parentTitle: "Galaxie", parentKicker: "zurück" };
  }
  const visible = branchesForLayer(verb, layer, minStars);
  const shownLocked = layer < 3 ? verb.branches.filter((item) => item.onion_layer === ((layer + 1) as OnionLayer)) : [];
  return {
    centerTitle: verb.infinitive,
    centerKicker: verb.cefr_level,
    parentTitle: verb.semantic_cluster,
    parentKicker: "Wortfeld",
    planets: [
      ...visible.map((item) => ({
        id: item.id,
        label: item.prefix,
        angle: item.compass_angle_deg,
        separable: item.is_separable,
        color: item.color_hex,
      })),
      ...shownLocked.map((item) => ({
        id: `lock:${item.id}`,
        label: "+",
        angle: item.compass_angle_deg,
        separable: item.is_separable,
        color: item.color_hex,
        placeholder: true,
      })),
    ],
  };
}

function hintPlanets(planets: OrbitPlanet[], correctId: string | undefined): string[] {
  if (!correctId) return [];
  const real = planets.filter((planet) => !planet.placeholder);
  const correct = real.find((planet) => planet.id === correctId);
  if (!correct) return [correctId];
  const others = real
    .filter((planet) => planet.id !== correctId)
    .sort((a, b) => angularSeparation(correct.angle, a.angle) - angularSeparation(correct.angle, b.angle))
    .slice(0, 3)
    .map((planet) => planet.id);
  return [correctId, ...others];
}
