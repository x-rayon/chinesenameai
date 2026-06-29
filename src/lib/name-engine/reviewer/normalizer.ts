import type { NameIdea } from "@/lib/types";
import type { ParsedNameIdea } from "../analysis/schema";

export function normalizeNameIdea(name: ParsedNameIdea): NameIdea {
  const style = normalizeStyle(name.style);

  return {
    ...name,
    style,
    naturalnessScore: clampScore(name.naturalnessScore),
    modernnessScore: clampScore(name.modernnessScore),
    pronunciationDifficulty: normalizePronunciationDifficulty(name.pronunciationDifficulty),
    businessFit: clampScore(name.businessFit),
    personalFit: clampScore(name.personalFit),
    suitabilityScore: clampScore(name.suitabilityScore),
    culturalQualityScore: clampScore(name.culturalQualityScore),
    overallConfidence: clampScore(name.overallConfidence),
    nativeImpression: normalizeNativeImpression(name.nativeImpression, style),
    riskWarning: normalizeRiskWarning(name.riskWarning),
    consultantNote: name.consultantNote,
    nativeImpressionTraits: cleanList(name.nativeImpressionTraits),
    rejectedStyles: cleanList(name.rejectedStyles),
    callNameSuggestions: cleanList(name.callNameSuggestions),
    suitableFor: cleanList(name.suitableFor),
    naturalnessConfidence: clampPercent(name.naturalnessConfidence),
  };
}

function clampScore(value: number | undefined) {
  if (!value || Number.isNaN(value)) return undefined;
  return Math.max(1, Math.min(10, Math.round(value)));
}

function clampPercent(value: number | undefined) {
  if (!value || Number.isNaN(value)) return undefined;
  return Math.max(1, Math.min(100, Math.round(value)));
}

function cleanList(values: string[] | undefined) {
  return values?.map((value) => value.trim()).filter(Boolean).slice(0, 6);
}

function normalizeStyle(value: string): NameIdea["style"] {
  const normalized = value.toLowerCase();
  if (normalized.includes("business") || normalized.includes("professional")) return "business";
  if (normalized.includes("literary") || normalized.includes("poetic")) return "literary";
  if (normalized.includes("modern")) return "modern";
  return "classic";
}

function normalizePronunciationDifficulty(value?: string): NonNullable<NameIdea["pronunciationDifficulty"]> | undefined {
  const normalized = value?.toLowerCase() || "";
  if (!normalized) return undefined;
  if (normalized.includes("hard") || normalized.includes("difficult")) return "Hard";
  if (normalized.includes("medium") || normalized.includes("moderate")) return "Medium";
  return "Easy";
}

function normalizeNativeImpression(
  value: string | undefined,
  style: NameIdea["style"],
): NonNullable<NameIdea["nativeImpression"]> {
  const normalized = value?.toLowerCase() || "";
  if (normalized.includes("professional") || normalized.includes("business") || normalized.includes("leader")) {
    return "Professional";
  }
  if (normalized.includes("friendly") || normalized.includes("warm") || normalized.includes("approachable")) {
    return "Friendly";
  }
  if (normalized.includes("literary") || normalized.includes("poetic") || normalized.includes("artistic")) {
    return "Literary";
  }
  if (normalized.includes("modern") || normalized.includes("fresh")) return "Modern";
  if (normalized.includes("elegant") || normalized.includes("refined")) return "Elegant";
  if (style === "business") return "Professional";
  if (style === "literary") return "Literary";
  if (style === "modern") return "Modern";
  return "Elegant";
}

function normalizeRiskWarning(value?: string): NonNullable<NameIdea["riskWarning"]> {
  const normalized = value?.toLowerCase() || "";
  if (normalized.includes("old")) return "Old-fashioned";
  if (normalized.includes("literary") || normalized.includes("poetic")) return "Too literary";
  if (normalized.includes("formal")) return "Slightly formal";
  return "Safe";
}
