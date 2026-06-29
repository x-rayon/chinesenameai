import type { NameRequest } from "@/lib/types";

export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

export function getCandidateCount(mode: NameRequest["mode"]) {
  return mode === "paid" ? 30 : 3;
}

export function getDisplayCount(mode: NameRequest["mode"]) {
  return mode === "paid" ? 10 : 3;
}
