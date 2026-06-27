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
