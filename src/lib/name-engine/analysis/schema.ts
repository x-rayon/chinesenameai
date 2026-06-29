import { z } from "zod";

const scoreSchema = z.coerce.number().min(1).max(10).optional();

export const nameIdeaSchema = z.object({
  chineseName: z.string(),
  pinyin: z.string(),
  englishExplanation: z.string(),
  chineseMeaning: z.string(),
  culturalExplanation: z.string(),
  suitableScenarios: z.array(z.string()).min(1),
  style: z.string(),
  impressionSummary: z.string().optional(),
  naturalnessScore: scoreSchema,
  modernnessScore: scoreSchema,
  pronunciationDifficulty: z.string().optional(),
  businessFit: scoreSchema,
  personalFit: scoreSchema,
  suitabilityScore: scoreSchema,
  culturalQualityScore: scoreSchema,
  overallConfidence: scoreSchema,
  nativeImpression: z.string().optional(),
  riskWarning: z.string().optional(),
  whyItFits: z.string().optional(),
  consultantNote: z.string().optional(),
  nativeImpressionTraits: z.array(z.string()).optional(),
  rejectedStyles: z.array(z.string()).optional(),
  callNameSuggestions: z.array(z.string()).optional(),
  suitableFor: z.array(z.string()).optional(),
  naturalnessConfidence: z.coerce.number().min(1).max(100).optional(),
});

export const reportSchema = z.object({
  names: z.array(nameIdeaSchema),
  stylePicks: z
    .object({
      business: z.string(),
      literary: z.string(),
      modern: z.string(),
      classic: z.string(),
    })
    .optional(),
  prompts: z
    .object({
      signaturePrompt: z.string(),
      sealPrompt: z.string(),
    })
    .optional(),
});

export type ParsedNameIdea = z.infer<typeof nameIdeaSchema>;
