export type Gender = "male" | "female" | "neutral";

export type NameRequest = {
  englishName: string;
  gender: Gender;
  country: string;
  personality: string;
  purpose: string;
  mode: "free" | "paid";
};

export type NameIdea = {
  chineseName: string;
  pinyin: string;
  englishExplanation: string;
  chineseMeaning: string;
  culturalExplanation: string;
  suitableScenarios: string[];
  style: "business" | "literary" | "modern" | "classic";
  impressionSummary?: string;
  naturalnessScore?: number;
  modernnessScore?: number;
  pronunciationDifficulty?: "Easy" | "Medium" | "Hard";
  businessFit?: number;
  personalFit?: number;
  suitabilityScore?: number;
  culturalQualityScore?: number;
  overallConfidence?: number;
  nativeImpression?: "Elegant" | "Professional" | "Friendly" | "Literary" | "Modern";
  riskWarning?: "Safe" | "Slightly formal" | "Too literary" | "Old-fashioned";
  whyItFits?: string;
};

export type SignaturePrompts = {
  signaturePrompt: string;
  sealPrompt: string;
};

export type NameReport = {
  input: NameRequest;
  names: NameIdea[];
  stylePicks?: {
    business: string;
    literary: string;
    modern: string;
    classic: string;
  };
  prompts?: SignaturePrompts;
};
