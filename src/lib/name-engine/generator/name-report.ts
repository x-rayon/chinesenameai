import type { NameIdea, NameReport, NameRequest } from "@/lib/types";
import { reportSchema } from "../analysis/schema";
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENAI_MODEL,
  getCandidateCount,
  getDisplayCount,
} from "../knowledge/config";
import { buildGeminiNameReportPrompt, buildOpenAINameReportPrompt } from "../prompts/name-report";
import { rankNameIdeas } from "../ranking/rank-name-ideas";
import { normalizeNameIdea } from "../reviewer/normalizer";
import { reviewQualifiedNames } from "../reviewer/reviewer";
import { cleanJsonText } from "../utils/json";
import {
  extractGeminiOutputText,
  postGeminiGenerateContent,
  postOpenAIChatCompletionWithFallback,
} from "./providers";

export async function generateNameReport(input: NameRequest): Promise<NameReport> {
  const candidateCount = getCandidateCount(input.mode);
  const displayCount = getDisplayCount(input.mode);

  if ((process.env.AI_PROVIDER || "openai").toLowerCase() === "gemini") {
    return generateGeminiNameReport(input, candidateCount, displayCount);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI is not configured.");
  }

  const completion = await postOpenAIChatCompletionWithFallback({
    model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content:
          "Return JSON with fields: names, optional stylePicks, optional prompts. Use culturally natural Chinese names, not transliteration only.",
      },
      { role: "user", content: buildOpenAINameReportPrompt(input, candidateCount) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.8,
  });

  const content = completion.choices?.[0]?.message?.content || "{}";
  const parsed = reportSchema.parse(JSON.parse(cleanJsonText(content)));

  return {
    input,
    names: selectQualifiedNames(input, parsed.names.map(normalizeNameIdea), displayCount),
    stylePicks: parsed.stylePicks,
    prompts: parsed.prompts,
  };
}

async function generateGeminiNameReport(
  input: NameRequest,
  candidateCount: number,
  displayCount: number,
): Promise<NameReport> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini is not configured.");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const data = await postGeminiGenerateContent(model, {
    contents: [{ parts: [{ text: buildGeminiNameReportPrompt(input, candidateCount) }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
      maxOutputTokens: input.mode === "paid" ? 16000 : 4096,
    },
  });

  const content = extractGeminiOutputText(data);
  const parsed = reportSchema.parse(JSON.parse(cleanJsonText(content)));

  return {
    input,
    names: selectQualifiedNames(input, parsed.names.map(normalizeNameIdea), displayCount),
    stylePicks: parsed.stylePicks,
    prompts: parsed.prompts,
  };
}

function selectQualifiedNames(input: NameRequest, names: NameIdea[], displayCount: number) {
  return rankNameIdeas(reviewQualifiedNames(input, names)).slice(0, Math.min(displayCount, 10));
}
