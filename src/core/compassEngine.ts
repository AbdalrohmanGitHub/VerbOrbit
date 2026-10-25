/**
 * Stable compass slots. A slot is a memory place, not a definition.
 * `defaultSeparable: null` means the prefix is variable: the branch decides.
 * Unknown prefixes return null. They never become separable by default.
 */

export type CompassSpec = {
  angleDeg: number;
  clockLabel: string;
  colorHex: string;
  defaultSeparable: boolean | null;
  tendencyDe: string;
};

export const MIN_SAME_RING_DEGREES = 14;

export const DETERMINISTIC_PREFIX_COMPASS: Record<string, CompassSpec> = {
  an: {
    angleDeg: 15,
    clockLabel: "12:30 Uhr, Kontakt",
    colorHex: "#ff8a8a",
    defaultSeparable: true,
    tendencyDe: "Oft Kontakt oder ein Ziel. Nur eine Tendenz, nicht jede Bedeutung.",
  },
  hin: {
    angleDeg: 32,
    clockLabel: "1:00 Uhr, hin",
    colorHex: "#fb7185",
    defaultSeparable: true,
    tendencyDe: "Oft eine Richtung weg vom Sprecher.",
  },
  auf: {
    angleDeg: 50,
    clockLabel: "2:00 Uhr, öffnen oder hoch",
    colorHex: "#ffa69e",
    defaultSeparable: true,
    tendencyDe: "Oft nach oben, offen oder ein Start.",
  },
  los: {
    angleDeg: 62,
    clockLabel: "2:15 Uhr, Start",
    colorHex: "#fdba74",
    defaultSeparable: true,
    tendencyDe: "Oft ein Beginn oder ein Loslassen.",
  },
  rein: {
    angleDeg: 75,
    clockLabel: "2:30 Uhr, hinein",
    colorHex: "#ffd166",
    defaultSeparable: true,
    tendencyDe: "Umgangssprachlich: nach drinnen.",
  },
  ein: {
    angleDeg: 85,
    clockLabel: "3:00 Uhr, Eintritt",
    colorHex: "#f4c95d",
    defaultSeparable: true,
    tendencyDe: "Oft in etwas hinein. Die Rektion steht am Chunk.",
  },
  weiter: {
    angleDeg: 100,
    clockLabel: "3:30 Uhr, weiter",
    colorHex: "#f9c74f",
    defaultSeparable: true,
    tendencyDe: "Oft ohne Pause weitermachen.",
  },
  vor: {
    angleDeg: 115,
    clockLabel: "4:00 Uhr, vorn",
    colorHex: "#e9c46a",
    defaultSeparable: true,
    tendencyDe: "Oft nach vorn oder zeitlich vorher. Nicht jede Bedeutung.",
  },
  her: {
    angleDeg: 128,
    clockLabel: "4:15 Uhr, her",
    colorHex: "#f4a261",
    defaultSeparable: true,
    tendencyDe: "Oft eine Richtung zum Sprecher.",
  },
  durch: {
    angleDeg: 140,
    clockLabel: "4:30 Uhr, durch",
    colorHex: "#f8961e",
    defaultSeparable: null,
    tendencyDe: "Variable Vorsilbe. Trennung und Bedeutung stehen am Verb, nicht am Winkel.",
  },
  bei: {
    angleDeg: 158,
    clockLabel: "5:15 Uhr, dabei",
    colorHex: "#67e8f9",
    defaultSeparable: true,
    tendencyDe: "Oft das Dabeisein oder das Beibringen. Rektion prüfen.",
  },
  ab: {
    angleDeg: 175,
    clockLabel: "6:00 Uhr, ab oder runter",
    colorHex: "#4cc9f0",
    defaultSeparable: true,
    tendencyDe: "Oft weg, nach unten oder weniger. Nicht jede Bedeutung.",
  },
  weg: {
    angleDeg: 190,
    clockLabel: "6:30 Uhr, weg",
    colorHex: "#38bdf8",
    defaultSeparable: true,
    tendencyDe: "Oft eine Entfernung von hier.",
  },
  aus: {
    angleDeg: 205,
    clockLabel: "7:00 Uhr, hinaus oder Ende",
    colorHex: "#4895ef",
    defaultSeparable: true,
    tendencyDe: "Oft nach außen, zu Ende oder ausgeschaltet. Mehrere Lesarten möglich.",
  },
  vorbei: {
    angleDeg: 220,
    clockLabel: "7:30 Uhr, kurz vorbei",
    colorHex: "#60a5fa",
    defaultSeparable: true,
    tendencyDe: "Oft ein kurzer Besuch auf dem Weg.",
  },
  nach: {
    angleDeg: 235,
    clockLabel: "8:00 Uhr, nach",
    colorHex: "#90be6d",
    defaultSeparable: true,
    tendencyDe: "Oft hinterher, später oder prüfend.",
  },
  fest: {
    angleDeg: 250,
    clockLabel: "8:30 Uhr, fest",
    colorHex: "#34d399",
    defaultSeparable: true,
    tendencyDe: "Oft etwas fixieren oder feststellen.",
  },
  zurück: {
    angleDeg: 265,
    clockLabel: "9:00 Uhr, Rückkehr",
    colorHex: "#43aa8b",
    defaultSeparable: true,
    tendencyDe: "Oft zurück zum Ausgangspunkt.",
  },
  teil: {
    angleDeg: 280,
    clockLabel: "9:30 Uhr, Teilhabe",
    colorHex: "#80ed99",
    defaultSeparable: true,
    tendencyDe: "Oft das Mitmachen in einer Gruppe.",
  },
  mit: {
    angleDeg: 295,
    clockLabel: "10:00 Uhr, gemeinsam",
    colorHex: "#7ae582",
    defaultSeparable: true,
    tendencyDe: "Oft zusammen mit anderen.",
  },
  zusammen: {
    angleDeg: 310,
    clockLabel: "10:30 Uhr, zusammen",
    colorHex: "#2dd4bf",
    defaultSeparable: true,
    tendencyDe: "Oft das Zusammenbringen.",
  },
  zu: {
    angleDeg: 325,
    clockLabel: "11:00 Uhr, zu oder schließen",
    colorHex: "#52b788",
    defaultSeparable: true,
    tendencyDe: "Oft schließen oder auf ein Ziel. Nicht jede Bedeutung.",
  },
  um: {
    angleDeg: 345,
    clockLabel: "11:30 Uhr, um",
    colorHex: "#72efdd",
    defaultSeparable: null,
    tendencyDe: "Variable Vorsilbe. Betonung entscheidet über Trennung und Bedeutung.",
  },
  wieder: {
    angleDeg: 2,
    clockLabel: "12:00 Uhr, wieder",
    colorHex: "#5eead4",
    defaultSeparable: true,
    tendencyDe: "Oft eine Wiederholung.",
  },
  ver: {
    angleDeg: 40,
    clockLabel: "Innenring, ver-",
    colorHex: "#c77dff",
    defaultSeparable: false,
    tendencyDe: "Untrennbar. Keine einzelne Bedeutung. ver- klebt am Verb.",
  },
  be: {
    angleDeg: 135,
    clockLabel: "Innenring, be-",
    colorHex: "#e0aaff",
    defaultSeparable: false,
    tendencyDe: "Untrennbar. Oft direkt auf ein Objekt, aber nicht immer vorhersagbar.",
  },
  ent: {
    angleDeg: 225,
    clockLabel: "Innenring, ent-",
    colorHex: "#b5179e",
    defaultSeparable: false,
    tendencyDe: "Untrennbar. Oft ein Entfernen oder ein Beginn. Nicht immer.",
  },
  er: {
    angleDeg: 315,
    clockLabel: "Innenring, er-",
    colorHex: "#d8b4fe",
    defaultSeparable: false,
    tendencyDe: "Untrennbar. Oft ein Ergebnis, aber die Bedeutung ist lexikalisch.",
  },
  über: {
    angleDeg: 88,
    clockLabel: "über, variabel",
    colorHex: "#c4b5fd",
    defaultSeparable: null,
    tendencyDe: "Variable Vorsilbe. Betonung und Bedeutung gehören zum einzelnen Verb.",
  },
  unter: {
    angleDeg: 170,
    clockLabel: "unter, variabel",
    colorHex: "#818cf8",
    defaultSeparable: null,
    tendencyDe: "Variable Vorsilbe. unternehmen ist untrennbar und nicht aus nehmen ableitbar.",
  },
  hinter: {
    angleDeg: 300,
    clockLabel: "hinter, variabel",
    colorHex: "#94a3b8",
    defaultSeparable: null,
    tendencyDe: "Variable Vorsilbe. Die Trennung steht am Verb.",
  },
  wider: {
    angleDeg: 20,
    clockLabel: "wider, variabel",
    colorHex: "#f472b6",
    defaultSeparable: null,
    tendencyDe: "Variable Vorsilbe. Nicht automatisch trennbar.",
  },
};

const VARIABLE_INNER_ANGLES = [80, 170, 260, 350];

export function lookupPrefix(prefix: string): CompassSpec | null {
  return DETERMINISTIC_PREFIX_COMPASS[prefix] ?? null;
}

export function angularSeparation(a: number, b: number): number {
  const raw = Math.abs(a - b) % 360;
  return Math.min(raw, 360 - raw);
}

export function computePolarPosition(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  angleDeg: number,
  isSeparable: boolean,
): { x: number; y: number; radiusUsed: number } {
  const radiusUsed = isSeparable ? outerRadius : innerRadius;
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: centerX + radiusUsed * Math.cos(rad),
    y: centerY + radiusUsed * Math.sin(rad),
    radiusUsed,
  };
}

export function planetSurface(hex: string): {
  background: string;
  color: string;
  border: string;
} {
  return {
    background: `color-mix(in srgb, ${hex} 30%, white)`,
    color: "#1e293b",
    border: hex,
  };
}

export function suggestedInnerAngle(index: number): number {
  return VARIABLE_INNER_ANGLES[index % VARIABLE_INNER_ANGLES.length] ?? 80;
}
