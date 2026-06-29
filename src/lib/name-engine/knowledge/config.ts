import type { NameRequest } from "@/lib/types";

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
export const INTERNAL_CANDIDATE_COUNT = 30;

export function getCandidateCount(_mode: NameRequest["mode"]) {
  return INTERNAL_CANDIDATE_COUNT;
}

export function getDisplayCount(mode: NameRequest["mode"]) {
  return mode === "paid" ? 10 : 3;
}
