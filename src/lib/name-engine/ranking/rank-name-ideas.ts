import type { NameIdea } from "@/lib/types";
import nameDatabase from "../knowledge/chinese_names_database.json";
import preferredCharacters from "../knowledge/preferred_characters.json";

export function rankNameIdeas(names: NameIdea[]) {
  return [...names].sort((a, b) => scoreName(b).total - scoreName(a).total);
}

export function scoreName(name: NameIdea) {
  const factors = {
    naturalness: scoreNaturalness(name),
    professionalism: scoreProfessionalism(name),
    modernness: scoreModernness(name),
    meaning: scoreMeaning(name),
    pronunciation: scorePronunciation(name),
    popularity: scorePopularity(name),
  };

  return {
    factors,
    total:
      factors.naturalness * 0.3 +
      factors.professionalism * 0.18 +
      factors.modernness * 0.18 +
      factors.meaning * 0.16 +
      factors.pronunciation * 0.1 +
      factors.popularity * 0.08,
  };
}

function scoreNaturalness(name: NameIdea) {
  let score = name.naturalnessScore ?? 8;
  if (name.riskWarning === "Safe") score += 0.5;
  if (name.riskWarning === "Slightly formal") score -= 0.5;
  if (name.riskWarning === "Too literary" || name.riskWarning === "Old-fashioned") score -= 2;
  if ((name.naturalnessConfidence ?? 90) >= 95) score += 0.5;
  return clampScore(score);
}

function scoreProfessionalism(name: NameIdea) {
  let score = name.businessFit ?? name.suitabilityScore ?? 8;
  if (name.nativeImpression === "Professional") score += 1;
  if (name.style === "business") score += 0.75;
  if (name.style === "literary") score -= 0.75;
  if (containsAny(name.suitableFor, ["Business", "LinkedIn"])) score += 0.5;
  return clampScore(score);
}

function scoreModernness(name: NameIdea) {
  let score = name.modernnessScore ?? 8;
  if (name.style === "modern") score += 0.5;
  if (name.riskWarning === "Old-fashioned") score -= 2;
  return clampScore(score);
}

function scoreMeaning(name: NameIdea) {
  let score = name.culturalQualityScore ?? 8;
  const combinedMeaning = [name.englishExplanation, name.chineseMeaning, name.culturalExplanation, name.whyItFits]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (combinedMeaning.includes("awkward") || combinedMeaning.includes("blunt")) score -= 2;
  if (combinedMeaning.includes("natural") || combinedMeaning.includes("balanced")) score += 0.5;
  if (combinedMeaning.includes("trust") || combinedMeaning.includes("integrity")) score += 0.5;
  if (combinedMeaning.length > 120) score += 0.25;
  return clampScore(score);
}

function scorePronunciation(name: NameIdea) {
  if (name.pronunciationDifficulty === "Easy") return 10;
  if (name.pronunciationDifficulty === "Medium") return 7;
  if (name.pronunciationDifficulty === "Hard") return 3;
  return 8;
}

function scorePopularity(name: NameIdea) {
  const databaseMatch = namesByChinese.get(name.chineseName);
  if (databaseMatch) return popularityToScore(databaseMatch.popularity);

  const surname = name.chineseName.slice(0, 1);
  const givenNameCharacters = [...name.chineseName.slice(1)];
  let score = commonSurnames.has(surname) ? 7 : 5;

  for (const character of givenNameCharacters) {
    const preferred = preferredCharacterMap.get(character);
    if (!preferred) continue;
    score += preferred.usageFrequency === "high" ? 0.75 : 0.4;
  }

  return clampScore(score);
}

function popularityToScore(popularity: string) {
  if (popularity === "high") return 10;
  if (popularity === "medium-high") return 8.5;
  if (popularity === "medium") return 7;
  if (popularity === "low-medium") return 5.5;
  return 4;
}

function containsAny(values: string[] | undefined, needles: string[]) {
  const haystack = values?.join(" ").toLowerCase() || "";
  return needles.some((needle) => haystack.includes(needle.toLowerCase()));
}

function clampScore(value: number) {
  return Math.max(1, Math.min(10, Number(value.toFixed(2))));
}

type NameDatabase = {
  names: Array<{ chinese: string; popularity: string }>;
};

type PreferredCharacters = {
  characters: Array<{ character: string; usageFrequency: string }>;
};

const namesByChinese = new Map(
  (nameDatabase as NameDatabase).names.map((name) => [name.chinese, name]),
);

const preferredCharacterMap = new Map(
  (preferredCharacters as PreferredCharacters).characters.map((item) => [item.character, item]),
);

const commonSurnames = new Set(["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "马", "林", "何"]);
