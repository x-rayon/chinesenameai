import type { NameIdea } from "@/lib/types";

export function rankNameIdeas(names: NameIdea[]) {
  return [...names].sort((a, b) => qualityScore(b) - qualityScore(a));
}

function qualityScore(name: NameIdea) {
  const suitability = name.suitabilityScore ?? Math.max(name.businessFit ?? 8, name.personalFit ?? 8);
  return (
    (name.naturalnessScore ?? 8) * 0.3 +
    (name.modernnessScore ?? 8) * 0.18 +
    suitability * 0.22 +
    (name.culturalQualityScore ?? 8) * 0.16 +
    (name.overallConfidence ?? 8) * 0.14
  );
}
