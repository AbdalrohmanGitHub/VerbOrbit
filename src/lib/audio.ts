"use client";

export type AudioResult = "file" | "speech" | "unavailable";

export function playChunkAudio(chunkId: string, spoken: string): Promise<AudioResult> {
  return new Promise((resolve) => {
    const audio = new Audio(`/audio/${chunkId}.m4a`);
    let settled = false;
    const finish = (result: AudioResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    let fallbackStarted = false;
    const fallback = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      void speakGerman(spoken).then(finish);
    };
    audio.addEventListener("error", fallback);
    audio.addEventListener("playing", () => finish("file"));
    audio.play().catch(fallback);
  });
}

function speakGerman(text: string): Promise<AudioResult> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve("unavailable");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.88;
    let finished = false;
    const done = (result: AudioResult) => {
      if (finished) return;
      finished = true;
      resolve(result);
    };
    utterance.onend = () => done("speech");
    utterance.onerror = () => done("unavailable");
    window.speechSynthesis.cancel();
    const start = () => {
      window.speechSynthesis.speak(utterance);
      window.setTimeout(() => {
        if (!window.speechSynthesis.speaking) done("unavailable");
      }, 1200);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener("voiceschanged", start, { once: true });
      window.setTimeout(() => done("unavailable"), 900);
      return;
    }
    start();
  });
}
