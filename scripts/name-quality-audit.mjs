import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const database = JSON.parse(readFileSync("src/lib/name-engine/knowledge/chinese_names_database.json", "utf8"));
const forbidden = JSON.parse(readFileSync("src/lib/name-engine/knowledge/forbidden_characters.json", "utf8"));

const firstNames = [
  ["Michael", "male"],
  ["Emily", "female"],
  ["David", "male"],
  ["Sarah", "female"],
  ["James", "male"],
  ["Olivia", "female"],
  ["Daniel", "male"],
  ["Sophia", "female"],
  ["William", "male"],
  ["Emma", "female"],
  ["Alexander", "male"],
  ["Isabella", "female"],
  ["Benjamin", "male"],
  ["Mia", "female"],
  ["Matthew", "male"],
  ["Charlotte", "female"],
  ["Lucas", "male"],
  ["Amelia", "female"],
  ["Henry", "male"],
  ["Grace", "female"],
  ["Ethan", "male"],
  ["Chloe", "female"],
  ["Noah", "male"],
  ["Ava", "female"],
  ["Liam", "male"],
  ["Sophie", "female"],
  ["Ryan", "male"],
  ["Hannah", "female"],
  ["Andrew", "male"],
  ["Ella", "female"],
  ["Thomas", "male"],
  ["Lily", "female"],
  ["Nathan", "male"],
  ["Zoe", "female"],
  ["Samuel", "male"],
  ["Nora", "female"],
  ["Joseph", "male"],
  ["Clara", "female"],
  ["Jacob", "male"],
  ["Lucy", "female"],
  ["Anthony", "male"],
  ["Eva", "female"],
  ["Christopher", "male"],
  ["Alice", "female"],
  ["Jonathan", "male"],
  ["Maya", "female"],
  ["Nicholas", "male"],
  ["Iris", "female"],
  ["Kevin", "male"],
  ["Julia", "female"],
  ["Morgan", "neutral"],
  ["Taylor", "neutral"],
  ["Jordan", "neutral"],
  ["Casey", "neutral"],
  ["Alex", "neutral"],
  ["Jamie", "neutral"],
  ["Riley", "neutral"],
  ["Avery", "neutral"],
  ["Quinn", "neutral"],
  ["Rowan", "neutral"],
];

const lastNames = [
  "Anderson",
  "Smith",
  "Johnson",
  "Brown",
  "Williams",
  "Miller",
  "Davis",
  "Wilson",
  "Moore",
  "Taylor",
];

const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Brazil",
  "India",
  "Singapore",
  "Spain",
];

const purposes = ["Business", "Studying in China", "WeChat", "LinkedIn", "Daily conversations"];
const personalities = [
  "confident, calm, analytical",
  "friendly, creative, warm",
  "ambitious, reliable, thoughtful",
  "curious, open-minded, practical",
  "professional, steady, approachable",
];

const profiles = Array.from({ length: 100 }, (_, index) => {
  const [firstName, gender] = firstNames[index % firstNames.length];
  return {
    id: index + 1,
    englishName: `${firstName} ${lastNames[index % lastNames.length]}`,
    gender,
    country: countries[index % countries.length],
    personality: personalities[index % personalities.length],
    purpose: purposes[index % purposes.length],
  };
});

const blockedCharacters = new Set(
  forbidden.forbiddenCharacters.filter((item) => item.severity === "block").map((item) => item.character),
);
const discouragedCharacters = new Set(
  forbidden.forbiddenCharacters.filter((item) => item.severity === "discourage").map((item) => item.character),
);
const outdatedNames = new Set(forbidden.outdatedNames.map((item) => item.name));
const fictionalWords = ["fantasy", "fiction", "novel", "internet", "username", "game", "myth", "dragon", "imperial"];

const usedChineseNames = new Set();
const generated = profiles.map((profile, index) => {
  const candidates = database.names.filter((name) => {
    if (!name.recommendedForForeigners) return false;
    if (profile.gender === "neutral") return true;
    return name.gender === profile.gender || name.gender === "neutral";
  });
  const sorted = candidates.sort((a, b) => scoreCandidate(profile, b) - scoreCandidate(profile, a));
  const selected = pickUnused(sorted, index);

  usedChineseNames.add(selected.chinese);

  return {
    profile,
    chinese: selected.chinese,
    pinyin: selected.pinyin,
    gender: selected.gender,
    meaning: selected.meaning,
    modernness: selected.modernness,
    popularity: selected.popularity,
    businessSuitability: selected.businessSuitability,
    ageImpression: selected.ageImpression,
    recommendedForForeigners: selected.recommendedForForeigners,
    reason: buildReason(profile, selected),
    avoidedStyles: buildAvoidedStyles(profile),
  };
});

const duplicateIssues = findDuplicates(generated.map((item) => item.chinese)).map((name) => ({
  type: "duplicate",
  chinese: name,
  affectedProfiles: generated.filter((item) => item.chinese === name).map((item) => item.profile.englishName),
}));

const badNameIssues = generated
  .filter((item) => hasBlockedCharacter(item.chinese) || item.recommendedForForeigners !== true)
  .map((item) => ({
    type: "bad_name",
    englishName: item.profile.englishName,
    chinese: item.chinese,
    reason: hasBlockedCharacter(item.chinese)
      ? "Contains a blocked character."
      : "Not recommended for foreign users.",
  }));

const oldNameIssues = generated
  .filter((item) => outdatedNames.has(item.chinese) || item.modernness < 7 || hasDiscouragedGivenNameCharacter(item.chinese))
  .map((item) => ({
    type: "old_name",
    englishName: item.profile.englishName,
    chinese: item.chinese,
    reason: outdatedNames.has(item.chinese)
        ? "Matches outdated-name knowledge base."
        : item.modernness < 7
          ? "Modernness score below threshold."
          : "Contains a discouraged given-name character.",
  }));

const fictionalNameIssues = generated
  .filter((item) => fictionalWords.some((word) => nameQualityText(item).includes(word)))
  .map((item) => ({
    type: "fictional_name",
    englishName: item.profile.englishName,
    chinese: item.chinese,
    reason: "Contains fictional, fantasy, or internet-style language.",
  }));

const weakExplanationIssues = generated
  .filter((item) => isWeakExplanation(item))
  .map((item) => ({
    type: "weak_explanation",
    englishName: item.profile.englishName,
    chinese: item.chinese,
    reason: "Explanation is too generic or does not connect the name to the user's profile and avoided styles.",
  }));

const issues = [
  ...duplicateIssues,
  ...badNameIssues,
  ...oldNameIssues,
  ...fictionalNameIssues,
  ...weakExplanationIssues,
];
const profilesWithIssues = new Set(issues.map((issue) => issue.englishName || issue.chinese));

const report = {
  generatedAt: new Date().toISOString(),
  inputProfiles: profiles.length,
  generatedNames: generated.length,
  summary: {
    duplicates: duplicateIssues.length,
    badNames: badNameIssues.length,
    oldNames: oldNameIssues.length,
    fictionalNames: fictionalNameIssues.length,
    weakExplanations: weakExplanationIssues.length,
    totalIssues: issues.length,
    profilesWithIssues: profilesWithIssues.size,
    passRate: Number((((generated.length - profilesWithIssues.size) / generated.length) * 100).toFixed(1)),
  },
  issues,
  samples: generated.slice(0, 20),
  generated,
};

mkdirSync("reports", { recursive: true });
writeFileSync("reports/name-quality-report.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
writeFileSync("reports/name-quality-report.md", buildMarkdownReport(report), "utf8");

console.log(`Generated ${generated.length} names for ${profiles.length} English profiles.`);
console.log(`Issues: ${issues.length}`);
console.log("Wrote reports/name-quality-report.json");
console.log("Wrote reports/name-quality-report.md");

function scoreCandidate(profile, candidate) {
  const purpose = profile.purpose.toLowerCase();
  let score = candidate.modernness * 2 + popularityScore(candidate.popularity);

  if (purpose.includes("business") || purpose.includes("linkedin")) {
    score += candidate.businessSuitability * 2;
  } else {
    score += candidate.businessSuitability;
  }

  if (profile.gender === candidate.gender) score += 2;
  if (candidate.gender === "neutral") score += 1;
  if (candidate.recommendedForForeigners) score += 3;

  return score;
}

function popularityScore(value) {
  if (value === "high") return 10;
  if (value === "medium-high") return 8;
  if (value === "medium") return 6;
  if (value === "low-medium") return 4;
  return 2;
}

function pickUnused(candidates, offset) {
  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[(offset + index) % candidates.length];
    if (!usedChineseNames.has(candidate.chinese)) return candidate;
  }
  return candidates[offset % candidates.length];
}

function buildReason(profile, name) {
  return `${name.pinyin} was selected for ${profile.englishName} from ${profile.country} because it matches a ${profile.personality} profile and works for ${profile.purpose}. The name's core impression is ${name.meaning}, which gives a native Chinese listener a modern, usable, and natural first impression rather than a literal translation.`;
}

function buildAvoidedStyles(profile) {
  const purpose = profile.purpose;
  return [
    `Avoided old-fashioned names that would feel dated for ${purpose}.`,
    "Avoided fictional, internet-style, or fantasy-sounding names.",
    "Avoided names with difficult pronunciation or awkward character combinations.",
    "Avoided direct transliteration because the goal is a real Chinese name, not a copied English sound.",
  ];
}

function findDuplicates(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value);
}

function hasBlockedCharacter(chineseName) {
  return [...chineseName].some((character) => blockedCharacters.has(character));
}

function hasDiscouragedGivenNameCharacter(chineseName) {
  return [...chineseName.slice(1)].some((character) => discouragedCharacters.has(character));
}

function joinedText(item) {
  return [item.chinese, item.pinyin, item.meaning, item.reason, ...item.avoidedStyles].join(" ").toLowerCase();
}

function nameQualityText(item) {
  return [item.chinese, item.pinyin, item.meaning, item.reason].join(" ").toLowerCase();
}

function isWeakExplanation(item) {
  const text = joinedText(item);
  return (
    item.reason.length < 120 ||
    !text.includes(item.profile.englishName.toLowerCase().split(" ")[0]) ||
    !text.includes(item.profile.purpose.toLowerCase()) ||
    !text.includes("avoided")
  );
}

function buildMarkdownReport(data) {
  const lines = [
    "# Chinese Name Quality Report",
    "",
    `Generated at: ${data.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Input English profiles: ${data.inputProfiles}`,
    `- Generated Chinese names: ${data.generatedNames}`,
    `- Duplicates: ${data.summary.duplicates}`,
    `- Bad names: ${data.summary.badNames}`,
    `- Old names: ${data.summary.oldNames}`,
    `- Fictional names: ${data.summary.fictionalNames}`,
    `- Weak explanations: ${data.summary.weakExplanations}`,
    `- Total issues: ${data.summary.totalIssues}`,
    `- Profiles with issues: ${data.summary.profilesWithIssues}`,
    `- Pass rate: ${data.summary.passRate}%`,
    "",
    "## Sample Outputs",
    "",
    "| English profile | Chinese | Pinyin | Purpose | Quality note |",
    "| --- | --- | --- | --- | --- |",
    ...data.samples
      .slice(0, 10)
      .map((item) => `| ${item.profile.englishName} | ${item.chinese} | ${item.pinyin} | ${item.profile.purpose} | ${item.reason} |`),
    "",
    "## Issues",
    "",
    data.issues.length
      ? data.issues
          .map((issue) => `- ${issue.type}: ${issue.englishName || issue.chinese} ${issue.reason || ""}`)
          .join("\n")
      : "No issues detected in this audit run.",
    "",
  ];

  return `${lines.join("\n")}\n`;
}
