import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { NameRequest } from "@/lib/types";

const requiredFields =
  "Each name must include chineseName, pinyin, englishExplanation, chineseMeaning, culturalExplanation, suitableScenarios, style, impressionSummary, naturalnessScore, modernnessScore, pronunciationDifficulty, businessFit, personalFit, suitabilityScore, culturalQualityScore, overallConfidence, nativeImpression, riskWarning, whyItFits, consultantNote, nativeImpressionTraits, rejectedStyles, callNameSuggestions, suitableFor, and naturalnessConfidence.";

const consultantVoice =
  "Write like a thoughtful Chinese naming consultant, not a generator. Explain why you would personally recommend or reject a style. Use plain, consumer-friendly English. Avoid archaic or academic words such as sagacious. Match the user's gender; if gender is neutral, avoid gendered words such as man or woman.";

const humanReviewFields =
  "nativeImpressionTraits should be 3-5 concise traits a native Chinese person may perceive. rejectedStyles should mention styles intentionally avoided, such as old-fashioned names, difficult pronunciation, internet-style names, or overly literary names. callNameSuggestions should include natural short forms like Xiao + given-name character or A + given-name character. suitableFor should include realistic contexts such as Business, WeChat, LinkedIn, Studying in China, Daily conversations.";

const internalCandidateInstructions =
  "This is an internal candidate-generation task for the Name Engine. Do not write user-facing report copy and do not assume all candidates will be shown to the user. Create around 30 candidate names, then the engine will rank and display only the strongest names. Each candidate must clearly include: Reason (use whyItFits and consultantNote), Confidence (use overallConfidence and naturalnessConfidence), Style (use style), and Modernness (use modernnessScore).";

const explanationInstructions =
  "Explanation requirements: do not only explain individual characters. Every explanation must explain why the full name fits this specific user profile, including the user's English name, country or background, personality, gender preference, and purpose. englishExplanation should summarize the practical impression of the whole name. chineseMeaning may explain character meanings briefly, but must connect them to the user. culturalExplanation should explain how a native Chinese speaker would hear the name in real life. whyItFits must be profile-specific and mention why this name was selected over other possible styles. consultantNote should sound like direct advice from a native Chinese naming consultant. rejectedStyles must explain why unsuitable directions were avoided, such as names that are too old-fashioned, too literary, too internet-like, too hard to pronounce, too cute, too aggressive, or too close to transliteration.";

export function buildOpenAINameReportPrompt(input: NameRequest, candidateCount: number) {
  return [
    "You are ChineseNameAI, a careful bilingual naming consultant.",
    buildModernRulesSection(),
    internalCandidateInstructions,
    `Generate approximately ${candidateCount} suitable Chinese full-name candidates for a foreign user.`,
    "Return strict JSON only. No markdown.",
    requiredFields,
    "Scores must be realistic 1-10 integers. Rank candidates by naturalness, modernness, suitability, cultural quality, and overall confidence. pronunciationDifficulty must be Easy, Medium, or Hard. nativeImpression must be Elegant, Professional, Friendly, Literary, or Modern. riskWarning must be Safe, Slightly formal, Too literary, or Old-fashioned.",
    consultantVoice,
    explanationInstructions,
    humanReviewFields,
    "For paid mode include stylePicks and prompts with Chinese signature and seal image-generation prompts.",
    `Input: ${JSON.stringify(input)}`,
  ].join("\n");
}

export function buildGeminiNameReportPrompt(input: NameRequest, candidateCount: number) {
  return [
    "You are ChineseNameAI, a careful bilingual naming consultant.",
    buildModernRulesSection(),
    internalCandidateInstructions,
    `Generate approximately ${candidateCount} suitable Chinese full-name candidates for a foreign user.`,
    "Return strict JSON only. No markdown, no code fences.",
    "JSON schema: {\"names\":[{\"chineseName\":\"\",\"pinyin\":\"\",\"englishExplanation\":\"\",\"chineseMeaning\":\"\",\"culturalExplanation\":\"\",\"suitableScenarios\":[\"\"],\"style\":\"business|literary|modern|classic\",\"impressionSummary\":\"This name gives the impression of...\",\"naturalnessScore\":9,\"modernnessScore\":8,\"pronunciationDifficulty\":\"Easy|Medium|Hard\",\"businessFit\":8,\"personalFit\":8,\"suitabilityScore\":8,\"culturalQualityScore\":9,\"overallConfidence\":9,\"nativeImpression\":\"Elegant|Professional|Friendly|Literary|Modern\",\"riskWarning\":\"Safe|Slightly formal|Too literary|Old-fashioned\",\"whyItFits\":\"\",\"consultantNote\":\"\",\"nativeImpressionTraits\":[\"Professional\",\"Trustworthy\",\"Calm\",\"Educated\"],\"rejectedStyles\":[\"Old-fashioned names\",\"Difficult pronunciation\",\"Internet-style names\",\"Overly literary names\"],\"callNameSuggestions\":[\"Xiao Ming\",\"A De\"],\"suitableFor\":[\"Business\",\"WeChat\",\"LinkedIn\",\"Studying in China\",\"Daily conversations\"],\"naturalnessConfidence\":98}],\"stylePicks\":{\"business\":\"\",\"literary\":\"\",\"modern\":\"\",\"classic\":\"\"},\"prompts\":{\"signaturePrompt\":\"\",\"sealPrompt\":\"\"}}",
    requiredFields,
    "Scores must be realistic 1-10 integers based on how a native Chinese speaker would perceive the name. Rank candidates by naturalness, modernness, suitability, cultural quality, and overall confidence.",
    consultantVoice,
    explanationInstructions,
    humanReviewFields,
    "For free mode, stylePicks and prompts may be omitted. For paid mode, include stylePicks and prompts.",
    `Input: ${JSON.stringify(input)}`,
  ].join("\n");
}

function buildModernRulesSection() {
  return ["Modern Chinese naming rules:", loadModernRules()].join("\n\n");
}

function loadModernRules() {
  return readFileSync(join(process.cwd(), "src/lib/name-engine/knowledge/modern_rules.md"), "utf8");
}
