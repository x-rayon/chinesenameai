import type { Gender, NameIdea, NameRequest } from "@/lib/types";
import forbiddenKnowledge from "../knowledge/forbidden_characters.json";

type ForbiddenKnowledge = {
  forbiddenCharacters: Array<{ character: string; severity: "block" | "discourage" }>;
  outdatedNames: Array<{ name: string; severity: "block" | "discourage" }>;
  discouragedPatterns: Array<{ examples?: string[] }>;
};

const knowledge = forbiddenKnowledge as ForbiddenKnowledge;
const blockedCharacters = new Set(
  knowledge.forbiddenCharacters.filter((item) => item.severity === "block").map((item) => item.character),
);
const discouragedCharacters = new Set(
  knowledge.forbiddenCharacters.filter((item) => item.severity === "discourage").map((item) => item.character),
);
const outdatedNames = new Set(knowledge.outdatedNames.map((item) => item.name));
const discouragedPatternExamples = new Set(
  knowledge.discouragedPatterns.flatMap((pattern) => pattern.examples || []),
);

export function reviewQualifiedNames(input: NameRequest, names: NameIdea[]) {
  return names.filter((name) => isQualifiedName(input, name));
}

function isQualifiedName(input: NameRequest, name: NameIdea) {
  if (hasForbiddenCharacter(name)) return false;
  if (isOutdatedName(name)) return false;
  if (soundsFictional(name)) return false;
  if (soundsOld(name)) return false;
  if (soundsAwkward(name)) return false;
  if (hasDifficultPronunciation(name)) return false;
  if (!matchesUserProfile(input, name)) return false;
  return true;
}

function hasForbiddenCharacter(name: NameIdea) {
  return [...name.chineseName].some((character) => blockedCharacters.has(character));
}

function isOutdatedName(name: NameIdea) {
  return (
    outdatedNames.has(name.chineseName) ||
    discouragedPatternExamples.has(name.chineseName) ||
    [...name.chineseName].some((character) => discouragedCharacters.has(character) && name.modernnessScore && name.modernnessScore < 8)
  );
}

function soundsFictional(name: NameIdea) {
  const text = nameText(name);
  return (
    text.includes("fantasy") ||
    text.includes("fiction") ||
    text.includes("novel") ||
    text.includes("internet") ||
    text.includes("username") ||
    text.includes("game") ||
    text.includes("mythic") ||
    text.includes("imperial") ||
    text.includes("dragon") ||
    text.includes("legendary") ||
    text.includes("sword") ||
    text.includes("fairy") ||
    text.includes("destined") ||
    name.riskWarning === "Too literary"
  );
}

function soundsOld(name: NameIdea) {
  const text = nameText(name);
  return (
    name.riskWarning === "Old-fashioned" ||
    (name.modernnessScore !== undefined && name.modernnessScore < 7) ||
    text.includes("old-fashioned") ||
    text.includes("dated") ||
    text.includes("older generation") ||
    text.includes("traditional in a dated")
  );
}

function soundsAwkward(name: NameIdea) {
  const text = nameText(name);
  return (
    (name.naturalnessScore !== undefined && name.naturalnessScore < 7) ||
    (name.overallConfidence !== undefined && name.overallConfidence < 7) ||
    text.includes("awkward") ||
    text.includes("strange") ||
    text.includes("unnatural") ||
    text.includes("joke") ||
    text.includes("meme") ||
    text.includes("blunt") ||
    text.includes("boastful")
  );
}

function hasDifficultPronunciation(name: NameIdea) {
  return name.pronunciationDifficulty === "Hard";
}

function matchesUserProfile(input: NameRequest, name: NameIdea) {
  if (!matchesGender(input.gender, name)) return false;

  const purpose = input.purpose.toLowerCase();
  if (purpose.includes("business") || purpose.includes("professional") || purpose.includes("work")) {
    return (name.businessFit ?? name.suitabilityScore ?? 8) >= 7 && name.style !== "literary";
  }

  if (purpose.includes("student") || purpose.includes("study") || purpose.includes("academic")) {
    return name.riskWarning !== "Slightly formal" || (name.personalFit ?? name.suitabilityScore ?? 8) >= 8;
  }

  return (name.suitabilityScore ?? Math.max(name.businessFit ?? 8, name.personalFit ?? 8)) >= 7;
}

function matchesGender(gender: Gender, name: NameIdea) {
  if (gender === "neutral") return true;

  const text = nameText(name);
  if (gender === "male") {
    return !text.includes("woman") && !text.includes("feminine") && !text.includes("delicate feminine");
  }

  return !text.includes("man") && !text.includes("masculine") && !text.includes("strongly male");
}

function nameText(name: NameIdea) {
  return [
    name.chineseName,
    name.pinyin,
    name.englishExplanation,
    name.chineseMeaning,
    name.culturalExplanation,
    name.impressionSummary,
    name.nativeImpression,
    name.riskWarning,
    name.whyItFits,
    name.consultantNote,
    ...(name.nativeImpressionTraits || []),
    ...(name.rejectedStyles || []),
    ...(name.suitableScenarios || []),
    ...(name.suitableFor || []),
  ]
    .join(" ")
    .toLowerCase();
}
