# **📘 VERBORBIT – MASTER ARCHITECTURE & IMPLEMENTATION BLUEPRINT (FÜR CURSOR AI)**

## **1\. Executive Summary & Multi-Model KI-Strategie**

**VerbOrbit** ist eine visuell-kognitive DaF-Lernplattform (Deutsch als Fremdsprache), die das Lernplateau ab Niveau A2/B1/B2 durchbricht. Statt linearer Vokabellisten nutzt die App **planetare Mindmaps (Mindly-Geometrie)**, ein **360°-Präfix-Kompass-System**, **Dual-Coding-SVG-Animationen**, **physikalische Satzklammer-Animationen** und **topografisches Spaced Repetition (FSRS)**.

### **Wie wir die Modelle in diesem Projekt optimal aufteilen:**

> 1. **In Cursor (Code-Generierung & Architektur):**  
   * Nutze **claude-opus-5-5** (Medium oder High Effort) im Cursor Agent/Composer für das Aufsetzen der Projektarchitektur, die Framer-Motion-Physik, die Supabase-Datenbank-Migrationen und den FSRS-Algorithmus.  
   * Nutze **grok-4.7** oder **gpt-6-sol** für schnelle UI-Politur, Tailwind-Anpassungen und Komponenten-Tests.  
> 2. **In der Daten-Pipeline (Content-Generierung für 500–1.000 Verben):**  
   * Nutze **gpt-6-luna** über die OpenAI API. Bei \$0,10 / 1M Input-Tokens und \$0,50 / 1M Output-Tokens kostet die komplette Generierung von **1.000 deutschen Basisverben inklusive je 6–8 Präfix-Ästen, Chunks, arabischen/englischen/türkischen Ankern und Quiz-Sätzen insgesamt weniger als \$1,50\!**

## **2\. Warum dieser Tech-Stack (und warum NICHT MEAN oder klassisch MERN)**

Da später eine **Flutter-App (iOS/Android)** geplant ist, wäre ein klassischer MEAN-Stack (Angular \+ Express \+ MongoDB) oder ein loser MERN-Stack ein Architektur-Fehler:

* **Warum nicht MongoDB (MERN/MEAN)?** Deine Daten sind zwar hierarchisch (Basisverb ➔ Präfix-Ast ➔ Bedeutungs-Chunk), aber das **Lernfortschritts-Tracking (Spaced Repetition pro User und Ast)** ist hochgradig relational. **PostgreSQL (über Supabase)** gibt uns mit JSONB das Beste aus beiden Welten: blitzschnelle Dokumenten-Abfragen wie in MongoDB *plus* echte relationale Integrität und ein fertiges **supabase\_flutter SDK** für deine spätere Mobile-App\!  
* **Warum ein TypeScript-Monorepo (oder Clean-Core-Pattern)?** Wenn wir alle didaktischen Algorithmen (Kompass-Winkel, Zwiebel-Filter, FSRS-Berechnung) ohne React-Abhängigkeiten in src/core/ kapseln, kann **claude-opus-5-5** diesen Ordner später 1:1 in **Dart (Flutter)** übersetzen, während das Supabase-Backend unverändert bleibt.

### **Der endgültige Tech-Stack (Web MVP \+ Mobile-Ready Backend)**

* **Frontend & Fullstack:** Next.js 15+ (App Router), React 19, TypeScript (Strict Mode)  
* **Styling & Physik-UI:** Tailwind CSS \+ **Framer Motion** (Layout-Animationen für Orbit-Zoom & Satzklammer-Schleuder) \+ Lucide Icons  
* **Client State & Offline-Cache:** **Zustand** (mit persist Middleware in IndexedDB / localStorage)  
* **Datenbank & Auth:** **Supabase** (PostgreSQL 16 \+ Row Level Security \+ Auto-REST/GraphQL API für Web & Flutter)  
* **Schema & Validierung:** **Zod** (identisches Schema für Frontend, Backend und die gpt-6-luna Structured Outputs Pipeline)

## **3\. Komplette Projekt-Ordnerstruktur**

Cursor soll exakt diese Verzeichnisstruktur anlegen:

Plaintext  
verborbit/  
├── .cursorrules                          \# Strikte Architektur- & Didaktik-Regeln für Opus 5.5 / Grok 4.7  
├── .env.local                            \# OPENAI\_API\_KEY, NEXT\_PUBLIC\_SUPABASE\_URL, SUPABASE\_SERVICE\_ROLE\_KEY  
├── package.json  
├── supabase/  
│   └── migrations/  
│       └── 0001\_initial\_verborbit.sql    \# Komplettes PostgreSQL \+ RLS Schema (Web & Flutter ready)  
├── scripts/  
│   └── generate-verbs-gpt6-luna.ts       \# Batch-Generator mit gpt-6-luna & Structured Outputs  
└── src/  
    ├── types/  
    │   └── verb.schema.ts                \# Zod-Schemas & TypeScript-Typen (Single Source of Truth)  
    ├── core/                             \# PURE LOGIC (0% React\! 1:1 portierbar nach Flutter/Dart)  
    │   ├── compassEngine.ts              \# Deterministische 360°-Kompass-Koordinaten & Polar-Mathematik  
    │   ├── onionScaffolding.ts           \# Zwiebel-Prinzip Filter-Logik (Layer 1, 2, 3\)  
    │   ├── sentenceBracketParser.ts      \# Zerlegt Sätze in Vorfeld, Pos2 (Stamm), Mittelfeld, Satzende (Präfix)  
    │   └── fsrsSpacedRepetition.ts       \# Topografischer Gedächtnis-Algorithmus (FSRS-Lite)  
    ├── data/  
    │   └── seed50Verbs.ts                \# Die initialen 50 Kernverben als sofort lauffähiges Offline-Seed  
    ├── store/  
    │   └── useVerbOrbitStore.ts          \# Zustand-Store (Aktives Verb, Layer, Sprache, Quiz-State, Fortschritt)  
    ├── components/  
    │   ├── orbit/  
    │   │   ├── MindlyOrbitCanvas.tsx     \# Haupt-Planetarium (SVG-Linien, Kompass-Ringe, Zoom-Transition)  
    │   │   ├── OrbitPlanetNode.tsx       \# Einzelner Präfix-Planet mit Sternen & Präpositions-Chunk  
    │   │   └── TopParentBreadcrumb.tsx   \# Oberer Eltern-Kreis an vertikaler Linie (Mindly-Navigation)  
    │   ├── learning/  
    │   │   ├── PhysicsSentenceSling.tsx  \# Framer-Motion Satzklammer-Animation (Trennbar vs. Untrennbar)  
    │   │   ├── DualCodingAnimator.tsx    \# Minimalistische animierte SVG-Strichzeichnungen pro Präfix-Konzept  
    │   │   ├── ChunkSelectorPills.tsx    \# Klickbare Kollokations-Bausteine (z.B. "ankommen \+ auf")  
    │   │   └── NativeAnchorPeek.tsx      \# Press-and-Hold Muttersprachen-Anker (AR mit RTL, EN, TR)  
    │   ├── quiz/  
    │   │   └── TopographicQuizHud.tsx    \# Räumliches Mindmap-Quiz (blendet Text aus, fragt Position ab)  
    │   └── catalog/  
    │       └── VerbGalaxyDrawer.tsx      \# Such- & Filter-Katalog für alle 50–500 Verben nach Wortfeldern  
    └── app/  
        ├── layout.tsx                    \# Lädt Plus Jakarta Sans & Noto Sans Arabic  
        ├── page.tsx                      \# Integriertes Dashboard (Responsive Split-View / Mobile Bottom-Sheet)  
        └── api/  
            └── verbs/route.ts            \# Endpunkt zum Nachladen aus Supabase

## **4\. Datenbank-Architektur (supabase/migrations/0001\_initial\_verborbit.sql)**

Dieses SQL-Schema ist so gebaut, dass sowohl deine **Next.js Web-App** als auch deine spätere **Flutter-App** ohne eine einzige Änderung darauf zugreifen können:

SQL  
\-- Enable UUID extension  
create extension if not exists "uuid-ossp";

\-- 1\. TABELLE: BASISVERBEN (Zentrum der Mindmap)  
create table public.base\_verbs (  
  id text primary key,                        \-- z.B. 'kommen', 'setzen'  
  rank\_number int not null unique,            \-- 1 bis 500 (Häufigkeitsrang)  
  infinitive text not null,  
  cefr\_level text not null check (cefr\_level in ('A1', 'A2', 'B1', 'B2', 'C1')),  
  semantic\_cluster text not null,             \-- 'Bewegung', 'Position', 'Besitz', 'Sprache', 'Alltag', 'Zustand'  
  auxiliary\_verb text not null default 'haben',  
  stem\_present\_3rd text not null,             \-- z.B. 'kommt', 'setzt', 'nimmt'  
  stem\_preterite text not null,               \-- z.B. 'kam', 'setzte', 'nahm'  
  past\_participle text not null,              \-- z.B. 'gekommen', 'gesetzt', 'genommen'  
  translations jsonb not null default '{}',   \-- {"ar": "يأتي", "en": "to come", "tr": "gelmek"}  
  created\_at timestamptz default now()  
);

\-- 2\. TABELLE: PRÄFIX-ÄSTE (Planeten auf dem inneren/äußeren Orbit-Ring)  
create table public.prefix\_branches (  
  id text primary key,                        \-- z.B. 'kommen\_an', 'setzen\_ab'  
  base\_verb\_id text not null references public.base\_verbs(id) on delete cascade,  
  prefix text not null,                       \-- z.B. 'an', 'ab', 'ver'  
  full\_verb text not null,                    \-- z.B. 'ankommen', 'absetzen'  
  is\_separable boolean not null default true, \-- true \= Außenring (gestrichelt), false \= Innenring (durchgezogen)  
  frequency\_stars int not null check (frequency\_stars between 1 and 5),  
  onion\_layer int not null check (onion\_layer between 1 and 3), \-- 1: Überleben (★5), 2: Alltag (★4), 3: Profi (★3)  
  compass\_angle\_deg int not null check (compass\_angle\_deg between 0 and 359),  
  compass\_clock\_label text not null,          \-- z.B. '12:30 Uhr (Kontakt)'  
  color\_hex text not null,                    \-- Semantische Mindly-Farbe  
  locomotive\_logic\_de text not null,          \-- Erklärung der Vorsilben-Logik  
  dual\_coding\_svg\_key text not null,          \-- ID der SVG-Animation ('arrive', 'down\_off', 'together', etc.)  
  chunks jsonb not null default '\[\]',         \-- Array von Bedeutungs-Chunks inkl. Satzklammer-Segmenten & Übersetzungen  
  created\_at timestamptz default now()  
);

\-- 3\. TABELLE: USER SPACED-REPETITION PROGRESS (Für Topografisches Mindmap-Quiz in Web & Flutter)  
create table public.user\_branch\_progress (  
  user\_id uuid not null references auth.users(id) on delete cascade,  
  branch\_id text not null references public.prefix\_branches(id) on delete cascade,  
  base\_verb\_id text not null references public.base\_verbs(id) on delete cascade,  
  stability float not null default 0,         \-- FSRS Gedächtnis-Stabilität  
  difficulty float not null default 5.0,      \-- FSRS Schwierigkeit (1-10)  
  streak int not null default 0,  
  mastered boolean not null default false,  
  next\_review\_at timestamptz not null default now(),  
  last\_reviewed\_at timestamptz default now(),  
  primary key (user\_id, branch\_id)  
);

\-- Indizes für schnelle Abfragen  
create index idx\_branches\_base\_verb on public.prefix\_branches(base\_verb\_id);  
create index idx\_branches\_onion on public.prefix\_branches(onion\_layer);  
create index idx\_user\_progress\_review on public.user\_branch\_progress(user\_id, next\_review\_at);

\-- Row Level Security (RLS)  
alter table public.base\_verbs enable row level security;  
alter table public.prefix\_branches enable row level security;  
alter table public.user\_branch\_progress enable row level security;

create policy "Verben sind öffentlich lesbar" on public.base\_verbs for select using (true);  
create policy "Präfix-Äste sind öffentlich lesbar" on public.prefix\_branches for select using (true);  
create policy "User verwalten eigenen Fortschritt" on public.user\_branch\_progress  
  for all using (auth.uid() \= user\_id);

## **5\. Single Source of Truth: Das Zod- & TypeScript-Schema (src/types/verb.schema.ts)**

Dieses Schema zwingt sowohl deinen TypeScript-Code als auch die **gpt-6-luna API** in exakt dasselbe Format:

TypeScript  
import { z } from "zod";

export const NativeAnchorsSchema \= z.object({  
  ar: z.string().describe("Prägnante arabische Erklärung inkl. Präpositions-Hinweis"),  
  en: z.string().describe("Klare englische Entsprechung"),  
  tr: z.string().describe("Klare türkische Entsprechung"),  
});

export const SentenceBracketSchema \= z.object({  
  subject\_and\_vorfeld: z.string().describe("z.B. 'Mein Zug' oder 'Er'"),  
  verb\_position\_2: z.string().describe("Konjugierter Stamm bei trennbar ('kommt') oder Vollverb bei untrennbar ('versteht')"),  
  middle\_field\_with\_chunk: z.string().describe("Mittelfeld inkl. hervorgehobener Präposition, z.B. 'pünktlich in Berlin'"),  
  sentence\_end\_prefix: z.string().nullable().describe("Abgetrenntes Präfix am Satzende, z.B. 'an', oder null wenn untrennbar"),  
});

export const VerbChunkSchema \= z.object({  
  chunk\_id: z.string(),  
  chunk\_Trigger: z.string().describe("Kollokations-Formel für den Knoten, z.B. 'ankommen \+ in (+Dat)'"),  
  short\_preposition\_badge: z.string().describe("Ultra-kurzes Badge für den runden Planeten, z.B. '+ in / auf'"),  
  visual\_title\_de: z.string().describe("Kurzer bildhafter Titel, z.B. 'Am Reiseziel eintreffen'"),  
  definition\_de: z.string().describe("Einfache DaF-Erklärung auf A2/B1-Niveau"),  
  sentence\_bracket: SentenceBracketSchema,  
  native\_anchors: NativeAnchorsSchema,  
});

export const PrefixBranchSchema \= z.object({  
  id: z.string(),  
  prefix: z.string(),  
  full\_verb: z.string(),  
  is\_separable: z.boolean(),  
  frequency\_stars: z.number().int().min(3).max(5),  
  onion\_layer: z.union(\[z.literal(1), z.literal(2), z.literal(3)\]),  
  compass\_angle\_deg: z.number().int().min(0).max(359),  
  compass\_clock\_label: z.string(),  
  color\_hex: z.string(),  
  locomotive\_logic\_de: z.string(),  
  dual\_coding\_svg\_key: z.enum(\[  
    "arrive",  
    "up\_open",  
    "enter",  
    "forward",  
    "down\_off",  
    "out\_exit",  
    "return",  
    "together",  
    "transform",  
  \]),  
  chunks: z.array(VerbChunkSchema).min(1).max(3),  
});

export const BaseVerbNodeSchema \= z.object({  
  id: z.string(),  
  rank\_number: z.number().int(),  
  infinitive: z.string(),  
  cefr\_level: z.enum(\["A1", "A2", "B1", "B2", "C1"\]),  
  semantic\_cluster: z.enum(\["Bewegung", "Position", "Besitz", "Sprache", "Alltag", "Zustand"\]),  
  auxiliary\_verb: z.enum(\["haben", "sein"\]),  
  stem\_present\_3rd: z.string(),  
  stem\_preterite: z.string(),  
  past\_participle: z.string(),  
  translations: NativeAnchorsSchema,  
  branches: z.array(PrefixBranchSchema).min(3).max(8),  
});

export type BaseVerbNode \= z.infer\<typeof BaseVerbNodeSchema\>;  
export type PrefixBranch \= z.infer\<typeof PrefixBranchSchema\>;  
export type VerbChunk \= z.infer\<typeof VerbChunkSchema\>;

## **6\. Die Pure-Logic-Engine (src/core/compassEngine.ts)**

Diese Datei enthält **0 % React-Code** und berechnet die exakte 360°-Kompass-Geometrie für Web und später Flutter:

TypeScript  
export interface CompassSpec {  
  angleDeg: number;  
  clockLabel: string;  
  colorHex: string;  
  isSeparable: boolean;  
  defaultSvgKey:  
    \| "arrive"  
    \| "up\_open"  
    \| "enter"  
    \| "forward"  
    \| "down\_off"  
    \| "out\_exit"  
    \| "return"  
    \| "together"  
    \| "transform";  
  locomotiveRuleDe: string;  
}

export const DETERMINISTIC\_PREFIX\_COMPASS: Record\<string, CompassSpec\> \= {  
  // NORDEN (12 bis 2 Uhr): Kontakt, Beginn & Öffnung  
  an:     { angleDeg: 15,  clockLabel: "12:30 Uhr (Kontakt)",    colorHex: "\#ff8a8a", isSeparable: true,  defaultSvgKey: "arrive",    locomotiveRuleDe: "Kontakt herstellen oder direkt am Zielpunkt anstoßen." },  
  auf:    { angleDeg: 50,  clockLabel: "2:00 Uhr (Öffnen/Hoch)", colorHex: "\#ffa69e", isSeparable: true,  defaultSvgKey: "up\_open",   locomotiveRuleDe: "Nach oben bewegen, öffnen oder neu starten." },  
  // OSTEN (2:30 bis 4:30 Uhr): Hinein, Vorwärts & Durchbruch  
  rein:   { angleDeg: 75,  clockLabel: "2:30 Uhr (Hinein)",      colorHex: "\#ffd166", isSeparable: true,  defaultSvgKey: "enter",     locomotiveRuleDe: "Von draußen nach drinnen in einen Raum bewegen." },  
  ein:    { angleDeg: 85,  clockLabel: "3:00 Uhr (Eintritt)",    colorHex: "\#ffd166", isSeparable: true,  defaultSvgKey: "enter",     locomotiveRuleDe: "In ein System, einen Raum oder eine Gruppe einfügen." },  
  weiter: { angleDeg: 100, clockLabel: "3:30 Uhr (Fortsetzen)",  colorHex: "\#f9c74f", isSeparable: true,  defaultSvgKey: "forward",   locomotiveRuleDe: "Ohne Unterbrechung fortfahren." },  
  vor:    { angleDeg: 115, clockLabel: "4:00 Uhr (Voraus/Plan)", colorHex: "\#f9c74f", isSeparable: true,  defaultSvgKey: "forward",   locomotiveRuleDe: "Nach vorne zeigen oder zeitlich vorausplanen." },  
  durch:  { angleDeg: 140, clockLabel: "4:30 Uhr (Durchbruch)",  colorHex: "\#f8961e", isSeparable: true,  defaultSvgKey: "forward",   locomotiveRuleDe: "Durch ein Hindernis komplett von Anfang bis Ende." },  
  // SÜDEN (5:30 bis 7:30 Uhr): Schwerkraft, Trennung, Abzug & Raus  
  ab:     { angleDeg: 175, clockLabel: "6:00 Uhr (Abzug/Runter)",colorHex: "\#4cc9f0", isSeparable: true,  defaultSvgKey: "down\_off",  locomotiveRuleDe: "Nach unten abnehmen, reduzieren oder abtrennen." },  
  weg:    { angleDeg: 190, clockLabel: "6:30 Uhr (Entfernen)",   colorHex: "\#38bdf8", isSeparable: true,  defaultSvgKey: "out\_exit",  locomotiveRuleDe: "Komplett von diesem Ort wegbewegen." },  
  aus:    { angleDeg: 205, clockLabel: "7:00 Uhr (Raus/Ende)",   colorHex: "\#4895ef", isSeparable: true,  defaultSvgKey: "out\_exit",  locomotiveRuleDe: "Nach außen bringen, ausschalten oder beenden." },  
  vorbei: { angleDeg: 220, clockLabel: "7:30 Uhr (Kurzbesuch)",  colorHex: "\#f9c74f", isSeparable: true,  defaultSvgKey: "arrive",    locomotiveRuleDe: "Auf dem Weg kurz bei jemandem Halt machen." },  
  // WESTEN (8:00 bis 11:30 Uhr): Rückkehr, Gemeinschaft & Transformation  
  nach:   { angleDeg: 235, clockLabel: "8:00 Uhr (Folgen/Prüfen)",colorHex: "\#90be6d", isSeparable: true, defaultSvgKey: "return",    locomotiveRuleDe: "Hinterhergehen, kontrollieren oder später nachholen." },  
  zurück: { angleDeg: 265, clockLabel: "9:00 Uhr (Rückkehr)",    colorHex: "\#43aa8b", isSeparable: true,  defaultSvgKey: "return",    locomotiveRuleDe: "Zurück zum ursprünglichen Startpunkt." },  
  teil:   { angleDeg: 280, clockLabel: "9:30 Uhr (Teilhabe)",    colorHex: "\#80ed99", isSeparable: true,  defaultSvgKey: "together",  locomotiveRuleDe: "Als aktiver Teil einer Gruppe mitwirken." },  
  mit:    { angleDeg: 295, clockLabel: "10:00 Uhr (Gemeinsam)",  colorHex: "\#7ae582", isSeparable: true,  defaultSvgKey: "together",  locomotiveRuleDe: "Gemeinsam mit anderen in dieselbe Richtung." },  
  zu:     { angleDeg: 325, clockLabel: "11:00 Uhr (Schließen/Ziel)",colorHex: "\#52b788", isSeparable: true, defaultSvgKey: "enter", locomotiveRuleDe: "Schließen oder direkt auf ein Ziel zusteuern." },  
  um:     { angleDeg: 345, clockLabel: "11:30 Uhr (Wechsel)",    colorHex: "\#72efdd", isSeparable: true,  defaultSvgKey: "transform", locomotiveRuleDe: "Einen Zustand, Ort oder Plan komplett umwandeln." },  
  // INNERER MAGNET-RING (Untrennbar\! Klebt auf Position 2 fest am Verb)  
  ver:    { angleDeg: 40,  clockLabel: "Innenring (Veränderung)",colorHex: "\#c77dff", isSeparable: false, defaultSvgKey: "transform", locomotiveRuleDe: "Untrennbar: Verändert den Prozess komplett (oder zeigt einen Fehler)." },  
  be:     { angleDeg: 135, clockLabel: "Innenring (Direkt-Objekt)",colorHex: "\#e0aaff",isSeparable: false, defaultSvgKey: "arrive",   locomotiveRuleDe: "Untrennbar: Richtet die Handlung direkt auf ein Akkusativ-Objekt." },  
  ent:    { angleDeg: 225, clockLabel: "Innenring (Entfernung)", colorHex: "\#b5179e", isSeparable: false, defaultSvgKey: "out\_exit",  locomotiveRuleDe: "Untrennbar: Etwas löst sich ab oder entsteht neu." },  
  er:     { angleDeg: 315, clockLabel: "Innenring (Resultat)",   colorHex: "\#a855f7", isSeparable: false, defaultSvgKey: "up\_open",   locomotiveRuleDe: "Untrennbar: Führt die Handlung bis zum erfolgreichen Ergebnis." },  
};

export function computePolarPosition(  
  centerX: number,  
  centerY: number,  
  outerRadius: number,  
  innerRadius: number,  
  angleDeg: number,  
  isSeparable: boolean  
): { x: number; y: number; radiusUsed: number } {  
  const radiusUsed \= isSeparable ? outerRadius : innerRadius;  
  const rad \= ((angleDeg \- 90) \* Math.PI) / 180;  
  return {  
    x: centerX \+ radiusUsed \* Math.cos(rad),  
    y: centerY \+ radiusUsed \* Math.sin(rad),  
    radiusUsed,  
  };  
}

## **7\. Das gpt-6-luna Batch-Generierungs-Skript (scripts/generate-verbs-gpt6-luna.ts)**

Mit diesem Skript nutzt du **gpt-6-luna** (\$0,10 Input / \$0,50 Output pro 1M Tokens) inklusive **Prompt-Caching** (der lange System-Prompt mit den didaktischen Regeln wird von OpenAI gecacht, was die Kosten nochmals drastisch senkt\!) und **Structured Outputs**, um deine Datenbank von 50 auf 500–1.000 Verben auszubauen:

TypeScript  
import OpenAI from "openai";  
import { zodResponseFormat } from "openai/helpers/zod";  
import { BaseVerbNodeSchema, BaseVerbNode } from "../src/types/verb.schema";  
import { DETERMINISTIC\_PREFIX\_COMPASS } from "../src/core/compassEngine";  
import fs from "fs/promises";

const openai \= new OpenAI({  
  apiKey: process.env.OPENAI\_API\_KEY,  
});

// Dieser System-Prompt bleibt über alle 500 Aufrufe hinweg identisch,  
// sodass das Prompt-Caching von gpt-6-luna (\>75% Cache Hit Rate) maximal greift\!  
const SYSTEM\_PROMPT \= \`  
Du bist ein führender DaF-Linguist (Deutsch als Fremdsprache) und Kognitionspsychologe.  
Deine Aufgabe ist es, für ein gegebenes deutsches Basisverb eine gehirngerechte Mindmap-Datenstruktur nach folgenden 5 eisernen Regeln zu generieren:

1\. ZWIEBEL-PRINZIP (Scaffolding gegen Cognitive Overload):  
   \- Wähle nur die 5 bis 7 im deutschen Alltag häufigsten Präfix-Kombinationen (3 bis 5 Sterne).  
   \- Vergib exakt 3 Verben mit frequency\_stars \= 5 und onion\_layer \= 1 (Überlebens-Verben).  
   \- Vergib 2 bis 3 Verben mit frequency\_stars \= 4 und onion\_layer \= 2 (Alltag).  
   \- Vergib 1 Verb mit frequency\_stars \= 3 und onion\_layer \= 3\.  
   \- Ignoriere seltene 1- oder 2-Sterne-Verben komplett\!

2\. 360°-KOMPASS-TREUE:  
   \- Nutze für bekannte Präfixe (an, auf, ein, vor, durch, ab, aus, nach, zurück, mit, zu, um, ver, be, ent, er) exakt die folgenden Winkel und Farben:  
   \${JSON.stringify(DETERMINISTIC\_PREFIX\_COMPASS)}

3\. KONTEXTUELLES CHUNKING:  
   \- Jedes Präfix-Verb MUSS mindestens einen festen Präpositions- oder Objekt-Chunk enthalten (z.B. "ankommen \+ auf (+Akk)" oder "absetzen \+ von der Steuer").

4\. SATZKLAMMER-PHYSIK (sentence\_bracket):  
   \- Zerlege jeden Beispielsatz exakt in 4 Teile:  
     a) subject\_and\_vorfeld (z.B. "Mein Zug")  
     b) verb\_position\_2 (z.B. "kommt" bei trennbar, oder "versteht" bei untrennbar)  
     c) middle\_field\_with\_chunk (z.B. "heute pünktlich in Berlin")  
     d) sentence\_end\_prefix (z.B. "an" bei trennbaren Verben, oder null bei untrennbaren Verben)

5\. MUTTERSPRACHEN-ANKER (native\_anchors):  
   \- Liefere für jeden Chunk eine sofort einleuchtende, natürliche Erklärung auf Arabisch (ar), Englisch (en) und Türkisch (tr).  
\`;

export async function generateVerbWithGpt6Luna(  
  verbInfinitive: string,  
  rankNumber: number  
): Promise\<BaseVerbNode\> {  
  const response \= await openai.beta.chat.completions.parse({  
    model: "gpt-6-luna",  
    messages: \[  
      { role: "system", content: SYSTEM\_PROMPT },  
      {  
        role: "user",  
        content: \`Generiere den vollständigen VerbOrbit-Datensatz für das Basisverb "\${verbInfinitive}" (Rang \#\${rankNumber}).\`,  
      },  
    \],  
    response\_format: zodResponseFormat(BaseVerbNodeSchema, "verb\_orbit\_node"),  
  });

  const parsed \= response.choices\[0\].message.parsed;  
  if (\!parsed) {  
    throw new Error(\`Fehler beim Parsen von \${verbInfinitive} mit gpt-6-luna\`);  
  }  
  return parsed;  
}

// Beispiel-Batch-Lauf für beliebige Verblisten  
async function runBatch() {  
  const targetVerbs \= \["kommen", "gehen", "setzen", "stellen", "legen", "nehmen", "geben", "halten"\];  
  const results: BaseVerbNode\[\] \= \[\];

  for (let i \= 0; i \< targetVerbs.length; i++) {  
    console.log(\`\[gpt-6-luna\] Generiere \#\${i \+ 1}: \${targetVerbs\[i\]}...\`);  
    const data \= await generateVerbWithGpt6Luna(targetVerbs\[i\], i \+ 1);  
    results.push(data);  
  }

  await fs.writeFile("./src/data/generated-verbs.json", JSON.stringify(results, null, 2), "utf-8");  
  console.log("Fertig\! Gespeichert in src/data/generated-verbs.json");  
}

if (require.main \=== module) {  
  runBatch().catch(console.error);  
}

## **8\. Die Framer-Motion Satzklammer-Komponente (src/components/learning/PhysicsSentenceSling.tsx)**

Das ist die Komponente, die kein Konkurrent (auch nicht Duolingo) hat: Sie nutzt Framer Motion layoutId, damit der Nutzer *physikalisch* sieht, wie das Präfix von Position 2 abspringt und ans Satzende fliegt:

TypeScript  
"use client";

import React, { useState, useEffect } from "react";  
import { motion, AnimatePresence } from "framer-motion";  
import { SentenceBracketSchema } from "@/types/verb.schema";  
import { z } from "zod";

type BracketProps \= {  
  prefix: string;  
  isSeparable: boolean;  
  bracket: z.infer\<typeof SentenceBracketSchema\>;  
};

export const PhysicsSentenceSling: React.FC\<BracketProps\> \= ({  
  prefix,  
  isSeparable,  
  bracket,  
}) \=\> {  
  // Steuert die 2-Phasen-Animation:  
  // Phase "joined": Präfix klebt noch vor dem Verb auf Position 2 (an\|kommt)  
  // Phase "split": Präfix fliegt im hohen Bogen ans Satzende (kommt ... an.)  
  const \[phase, setPhase\] \= useState\<"joined" \| "split"\>("joined");

  useEffect(() \=\> {  
    setPhase("joined");  
    if (isSeparable) {  
      const timer \= setTimeout(() \=\> setPhase("split"), 450);  
      return () \=\> clearTimeout(timer);  
    }  
  }, \[prefix, isSeparable, bracket\]);

  const replayAnimation \= () \=\> {  
    setPhase("joined");  
    if (isSeparable) {  
      setTimeout(() \=\> setPhase("split"), 450);  
    }  
  };

  return (  
    \<div className="bg-slate-900 text-white rounded-2xl p-4 shadow-inner border border-slate-800"\>  
      \<div className="flex items-center justify-between text-\[11px\] font-extrabold uppercase tracking-wider text-slate-400 mb-2"\>  
        \<span\>  
          {isSeparable  
            ? "🧲 Trennbare Satzklammer (Vorsilbe fliegt ans Satzende)"  
            : "🔒 Untrennbarer Magnet (Vorsilbe bleibt auf Position 2)"}  
        \</span\>  
        \<button  
          onClick={replayAnimation}  
          className="text-sky-400 hover:text-sky-300 font-bold transition"  
        \>  
          ↻ Physik wiederholen  
        \</button\>  
      \</div\>

      \<div className="min-h-\[44px\] flex flex-wrap items-center gap-2 text-base sm:text-lg font-extrabold py-1"\>  
        {/\* 1\. Vorfeld / Subjekt \*/}  
        \<span className="text-slate-300"\>{bracket.subject\_and\_vorfeld}\</span\>

        {/\* 2\. Satzposition 2 (Verb-Klammer Start) \*/}  
        \<div className="inline-flex items-center gap-0.5"\>  
          \<AnimatePresence mode="popLayout"\>  
            {(\!isSeparable \|\| phase \=== "joined") && (  
              \<motion.span  
                layoutId={\`prefix-pill-\${prefix}\`}  
                initial={{ scale: 0.9, opacity: 0.8 }}  
                animate={{ scale: 1, opacity: 1 }}  
                exit={{ y: \-22, opacity: 0 }}  
                transition={{ type: "spring", stiffness: 320, damping: 22 }}  
                className={\`px-2 py-0.5 rounded-l-lg font-black \${  
                  isSeparable ? "bg-rose-500 text-white" : "bg-indigo-600 text-white"  
                }\`}  
              \>  
                {prefix}  
              \</motion.span\>  
            )}  
          \</AnimatePresence\>

          \<span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black shadow"\>  
            {bracket.verb\_position\_2}  
          \</span\>  
        \</div\>

        {/\* 3\. Mittelfeld inkl. Präpositions-Chunk \*/}  
        \<span className="text-emerald-300 underline decoration-emerald-500/60 decoration-dashed underline-offset-4"\>  
          {bracket.middle\_field\_with\_chunk}  
        \</span\>

        {/\* 4\. Satzende (Zielpunkt der Präfix-Schleuder bei trennbaren Verben) \*/}  
        {isSeparable && phase \=== "split" && bracket.sentence\_end\_prefix && (  
          \<motion.span  
            layoutId={\`prefix-pill-\${prefix}\`}  
            initial={{ y: \-28, scale: 1.25 }}  
            animate={{ y: 0, scale: 1 }}  
            transition={{ type: "spring", stiffness: 280, damping: 18 }}  
            className="px-2.5 py-0.5 rounded-lg bg-rose-500 text-white font-black shadow-lg shadow-rose-500/30"  
          \>  
            {bracket.sentence\_end\_prefix}.  
          \</motion.span\>  
        )}

        {\!isSeparable && \<span className="text-slate-400"\>.\</span\>}  
      \</div\>  
    \</div\>  
  );  
};

## **9\. Wie wir später nahtlos die Flutter-App andocken (Die 2-Phasen-Roadmap)**

Weil wir diese Clean Architecture nutzen, hast du für die spätere **Flutter-App** zwei extrem schnelle Wege:

> 1. **Weg A (Sofortiger Mobile-Launch in 1 Tag): PWA / Capacitor-Wrapper**  
   * Da unser Next.js-Design „Thumb-Zone First“ ist, kannst du die Web-App sofort als installierbare Mobile-App testen, um echtes Nutzerfeedback von DaF-Schülern zu sammeln.  
> 2. **Weg B (Nativer 120Hz Flutter-Client mit CustomPainter):**  
   * Dein **Supabase-Backend** (base\_verbs, prefix\_branches, user\_branch\_progress) und deine **gpt-6-luna Daten-Pipeline** bleiben **zu 100 % unverändert**.  
   * Du öffnest ein neues Flutter-Projekt in Cursor, wählst **claude-opus-5-5** und gibst ihm den Ordner src/core/ (compassEngine.ts, fsrsSpacedRepetition.ts) und src/types/verb.schema.ts mit dem Befehl: *„Portiere diese reinen TypeScript-Module nach Dart (freezed \+ supabase\_flutter) und baue das MindlyOrbitCanvas mit einem Flutter CustomPainter und AnimationController.“*

## **10\. Dein Ultimativer Start-Prompt für Cursor (Jetzt kopieren & ausführen)**

Gehe jetzt wie folgt vor:

> 1. Speichere deine heruntergeladene HTML-Datei (verborbit-v3.html) und diese Architektur-Spezifikation (ARCHITECTURE\_AND\_SPEC.md) in einem neuen Ordner.  
> 2. Öffne den Ordner in **Cursor**.  
> 3. Stelle im Cursor Agent/Composer das Modell auf **Claude Opus 5.5** (oder **Grok 4.7**) und füge diesen Prompt ein:

**Prompt an Cursor Agent (claude-opus-5-5):**  
„Wir bauen jetzt das produktionsreife MVP von **VerbOrbit** auf Basis von @ARCHITECTURE\_AND\_SPEC.md und dem funktionalen Prototyp @verborbit-v3.html.  
Bitte führe selbstständig im Terminal und im Dateisystem folgende Schritte aus:

1. Initialisiere ein Next.js App-Router Projekt mit TypeScript, Tailwind CSS, framer-motion, zustand, lucide-react und zod (sowie openai für unser gpt-6-luna Batch-Skript).  
2. Erstelle die .cursorrules und lege die komplette Ordnerstruktur (src/types, src/core, src/data, src/store, src/components/orbit, src/components/learning, src/components/quiz, src/components/catalog, supabase/migrations, scripts) exakt wie in @ARCHITECTURE\_AND\_SPEC.md beschrieben an.  
3. Portiere alle 50 Basisverben inklusive aller Präfix-Äste, Chunks und dreisprachigen Anker (AR/EN/TR) aus @verborbit-v3.html vollständig und ohne Datenverlust in src/data/seed50Verbs.ts, validiert gegen BaseVerbNodeSchema in src/types/verb.schema.ts.  
4. Implementiere die 5 kognitiven Kern-Features als modulare React-Komponenten mit Framer Motion:  
   * MindlyOrbitCanvas.tsx (mit äußerem Ring für trennbare Verben, innerem Ring für untrennbare Verben, 360°-Kompass-Winkeln und dem oberen Mindly-Eltern-Knoten an der vertikalen Linie).  
   * PhysicsSentenceSling.tsx (mit der 2-Phasen-layoutId-Animation für die deutsche Satzklammer).  
   * DualCodingAnimator.tsx (alle 9 animierten SVG-Typen).  
   * NativeAnchorPeek.tsx (Arabisch RTL mit Noto Sans Arabic, Englisch, Türkisch \+ Press-and-Hold Blur-Modus \+ Web Speech API Audio).  
   * TopographicQuizHud.tsx (Räumliches Spaced-Repetition-Quiz auf der unbeschrifteten Mindmap).  
5. Prüfe anschließend mit npm run build, dass keine TypeScript- oder Linter-Fehler existieren, und starte den Dev-Server.“