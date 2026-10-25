import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
  type Card,
  type Grade,
  type ReviewLog,
} from "ts-fsrs";

/** Pinned scheduler. Do not hand-edit weights. */
export const FSRS_PACKAGE_VERSION = "ts-fsrs@5.4.2";
export const DESIRED_RETENTION = 0.9;

const scheduler = fsrs({
  request_retention: DESIRED_RETENTION,
  enable_fuzz: false,
});

export { Rating, State };
export type { Card, Grade, ReviewLog };

export type StoredCard = {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: State;
  last_review?: string;
};

export type StoredReviewLog = {
  rating: Rating;
  state: State;
  due: string;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  review: string;
};

export function emptyCard(now: Date): Card {
  return createEmptyCard(now);
}

export function reviewCard(card: Card, now: Date, grade: Grade): { card: Card; log: ReviewLog } {
  return scheduler.next(card, now, grade);
}

export function serializeCard(card: Card): StoredCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  };
}

export function hydrateCard(stored: StoredCard): Card {
  return {
    due: new Date(stored.due),
    stability: stored.stability,
    difficulty: stored.difficulty,
    elapsed_days: stored.elapsed_days,
    scheduled_days: stored.scheduled_days,
    learning_steps: stored.learning_steps,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state,
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  };
}

export function serializeLog(log: ReviewLog): StoredReviewLog {
  return {
    rating: log.rating,
    state: log.state,
    due: log.due.toISOString(),
    stability: log.stability,
    difficulty: log.difficulty,
    scheduled_days: log.scheduled_days,
    learning_steps: log.learning_steps,
    review: log.review.toISOString(),
  };
}

/** The field the demo reads after reload. It mirrors the scheduler due date. */
export function dueAt(card: Card | StoredCard): string {
  return card.due instanceof Date ? card.due.toISOString() : card.due;
}
