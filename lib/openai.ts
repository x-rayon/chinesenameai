import { execFile } from "node:child_process";
import { request as httpsRequest } from "node:https";
import { promisify } from "node:util";
import { z } from "zod";
import type { NameReport, NameRequest } from "@/lib/types";

const execFileAsync = promisify(execFile);

const nameIdeaSchema = z.object({
  chineseName: z.string(),
  pinyin: z.string(),
  englishExplanation: z.string(),
  chineseMeaning: z.string(),
  culturalExplanation: z.string(),
  suitableScenarios: z.array(z.string()).min(1),
  style: z.enum(["business", "literary", "modern", "classic"]),
  impressionSummary: z.string().optional(),
  naturalnessScore: z.number().min(1).max(10).optional(),
  modernnessScore: z.number().min(1).max(10).optional(),
  pronunciationDifficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  businessFit: z.number().min(1).max(10).optional(),
  personalFit: z.number().min(1).max(10).optional(),
  suitabilityScore: z.number().min(1).max(10).optional(),
  culturalQualityScore: z.number().min(1).max(10).optional(),
  overallConfidence: z.number().min(1).max(10).optional(),
  nativeImpression: z.enum(["Elegant", "Professional", "Friendly", "Literary", "Modern"]).optional(),
  riskWarning: z.enum(["Safe", "Slightly formal", "Too literary", "Old-fashioned"]).optional(),
  whyItFits: z.string().optional(),
});

const reportSchema = z.object({
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

export async function generateNameReport(input: NameRequest): Promise<NameReport> {
  const candidateCount = input.mode === "paid" ? 30 : 3;
  const displayCount = input.mode === "paid" ? 10 : 3;

  if ((process.env.AI_PROVIDER || "openai").toLowerCase() === "gemini") {
    return generateGeminiNameReport(input, candidateCount, displayCount);
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI is not configured.");
  }

  const prompt = [
    "You are ChineseNameAI, a careful bilingual naming consultant.",
    `Generate exactly ${candidateCount} suitable Chinese full names for a foreign user.`,
    "Return strict JSON only. No markdown.",
    "Each name must include chineseName, pinyin, englishExplanation, chineseMeaning, culturalExplanation, suitableScenarios, style, impressionSummary, naturalnessScore, modernnessScore, pronunciationDifficulty, businessFit, personalFit, suitabilityScore, culturalQualityScore, overallConfidence, nativeImpression, riskWarning, and whyItFits.",
    "Scores must be realistic 1-10 integers. Rank candidates by naturalness, modernness, suitability, cultural quality, and overall confidence. pronunciationDifficulty must be Easy, Medium, or Hard. nativeImpression must be Elegant, Professional, Friendly, Literary, or Modern. riskWarning must be Safe, Slightly formal, Too literary, or Old-fashioned.",
    "Use plain, consumer-friendly English. Avoid archaic or academic words such as sagacious. Match the user's gender; if gender is neutral, avoid gendered words such as man or woman.",
    "For paid mode include stylePicks and prompts with Chinese signature and seal image-generation prompts.",
    `Input: ${JSON.stringify(input)}`,
  ].join("\n");

  const completion = await postOpenAIChatCompletionWithFallback({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Return JSON with fields: names, optional stylePicks, optional prompts. Use culturally natural Chinese names, not transliteration only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });
  const content = completion.choices?.[0]?.message?.content || "{}";
  const parsed = reportSchema.parse(JSON.parse(cleanJsonText(content)));

  return {
    input,
    names: rankNameIdeas(parsed.names).slice(0, displayCount),
    stylePicks: parsed.stylePicks,
    prompts: parsed.prompts,
  };
}

async function generateGeminiNameReport(input: NameRequest, candidateCount: number, displayCount: number): Promise<NameReport> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini is not configured.");
  }

  const prompt = [
    "You are ChineseNameAI, a careful bilingual naming consultant.",
    `Generate exactly ${candidateCount} suitable Chinese full names for a foreign user.`,
    "Return strict JSON only. No markdown, no code fences.",
    "JSON schema: {\"names\":[{\"chineseName\":\"\",\"pinyin\":\"\",\"englishExplanation\":\"\",\"chineseMeaning\":\"\",\"culturalExplanation\":\"\",\"suitableScenarios\":[\"\"],\"style\":\"business|literary|modern|classic\",\"impressionSummary\":\"This name gives the impression of...\",\"naturalnessScore\":9,\"modernnessScore\":8,\"pronunciationDifficulty\":\"Easy|Medium|Hard\",\"businessFit\":8,\"personalFit\":8,\"suitabilityScore\":8,\"culturalQualityScore\":9,\"overallConfidence\":9,\"nativeImpression\":\"Elegant|Professional|Friendly|Literary|Modern\",\"riskWarning\":\"Safe|Slightly formal|Too literary|Old-fashioned\",\"whyItFits\":\"\"}],\"stylePicks\":{\"business\":\"\",\"literary\":\"\",\"modern\":\"\",\"classic\":\"\"},\"prompts\":{\"signaturePrompt\":\"\",\"sealPrompt\":\"\"}}",
    "Each name must include chineseName, pinyin, englishExplanation, chineseMeaning, culturalExplanation, suitableScenarios, style, impressionSummary, naturalnessScore, modernnessScore, pronunciationDifficulty, businessFit, personalFit, suitabilityScore, culturalQualityScore, overallConfidence, nativeImpression, riskWarning, and whyItFits.",
    "Scores must be realistic 1-10 integers based on how a native Chinese speaker would perceive the name. Rank candidates by naturalness, modernness, suitability, cultural quality, and overall confidence.",
    "Use plain, consumer-friendly English. Avoid archaic or academic words such as sagacious. Match the user's gender; if gender is neutral, avoid gendered words such as man or woman.",
    "For free mode, stylePicks and prompts may be omitted. For paid mode, include stylePicks and prompts.",
    `Input: ${JSON.stringify(input)}`,
  ].join("\n");

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const data = await postGeminiGenerateContent(model, {
    contents: [{ parts: [{ text: prompt }] }],
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
    names: rankNameIdeas(parsed.names).slice(0, displayCount),
    stylePicks: parsed.stylePicks,
    prompts: parsed.prompts,
  };
}

function rankNameIdeas(names: z.infer<typeof nameIdeaSchema>[]) {
  return [...names].sort((a, b) => qualityScore(b) - qualityScore(a));
}

function qualityScore(name: z.infer<typeof nameIdeaSchema>) {
  const suitability = name.suitabilityScore ?? Math.max(name.businessFit ?? 8, name.personalFit ?? 8);
  return (
    (name.naturalnessScore ?? 8) * 0.3 +
    (name.modernnessScore ?? 8) * 0.18 +
    suitability * 0.22 +
    (name.culturalQualityScore ?? 8) * 0.16 +
    (name.overallConfidence ?? 8) * 0.14
  );
}

async function postGeminiGenerateContent(
  model: string,
  payload: Record<string, unknown>,
): Promise<{
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  steps?: Array<{ type?: string; content?: Array<{ text?: string; type?: string }> }>;
}> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errorText.slice(0, 300)}`);
    }

    return (await response.json()) as GeminiResponse;
  } catch (error) {
    if (process.platform !== "win32") throw error;
    return postGeminiGenerateContentWithPowerShell(endpoint, model, payload);
  }
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  steps?: Array<{ type?: string; content?: Array<{ text?: string; type?: string }> }>;
};

async function postGeminiGenerateContentWithPowerShell(
  endpoint: string,
  model: string,
  payload: Record<string, unknown>,
) {
  const encodedBody = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const command = [
    "[Console]::OutputEncoding = [Text.UTF8Encoding]::new();",
    "$OutputEncoding = [Text.UTF8Encoding]::new();",
    "$body = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:GEMINI_REQUEST_BODY));",
    "$bodyBytes = [Text.Encoding]::UTF8.GetBytes($body);",
    "$headers = @{ 'Content-Type' = 'application/json'; 'x-goog-api-key' = $env:GEMINI_API_KEY };",
    "$uri = $env:GEMINI_ENDPOINT;",
    "$response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $bodyBytes -TimeoutSec 90 -UseBasicParsing;",
    "$stream = $response.RawContentStream;",
    "if ($stream.CanSeek) { $stream.Position = 0 };",
    "$ms = New-Object IO.MemoryStream;",
    "$stream.CopyTo($ms);",
    "[Convert]::ToBase64String($ms.ToArray())",
  ].join(" ");

  const { stdout, stderr } = await execFileAsync("powershell.exe", ["-NoProfile", "-Command", command], {
    env: {
      ...process.env,
      GEMINI_REQUEST_BODY: encodedBody,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
      GEMINI_ENDPOINT: endpoint,
      GEMINI_MODEL: model,
    },
    timeout: 100000,
    maxBuffer: 1024 * 1024 * 5,
  });

  const raw = stdout.trim();
  if (!raw) {
    throw new Error(`Gemini PowerShell fallback returned no output. ${stderr.slice(0, 300)}`);
  }

  const text = Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(text) as GeminiResponse;
}

function extractGeminiOutputText(data: {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  steps?: Array<{ type?: string; content?: Array<{ text?: string; type?: string }> }>;
}) {
  const interactionText =
    data.steps
      ?.filter((step) => step.type === "model_output")
      .flatMap((step) => step.content || [])
      .map((part) => part.text || "")
      .join("") || "";

  if (interactionText) return interactionText;

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "{}";
}

function cleanJsonText(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const withoutFence = fenced?.[1]?.trim() || trimmed;
  const start = withoutFence.indexOf("{");
  if (start === -1) return withoutFence;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < withoutFence.length; index += 1) {
    const char = withoutFence[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = inString;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      return withoutFence.slice(start, index + 1);
    }
  }

  return withoutFence;
}

function postOpenAIChatCompletion(payload: Record<string, unknown>) {
  return new Promise<{ choices?: Array<{ message?: { content?: string } }> }>((resolve, reject) => {
    const body = JSON.stringify(payload);
    const request = httpsRequest(
      {
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        method: "POST",
        timeout: 90000,
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
            reject(new Error(`OpenAI API error ${response.statusCode}: ${text.slice(0, 300)}`));
            return;
          }
          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error("OpenAI returned invalid JSON."));
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("OpenAI request timed out."));
    });
    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

async function postOpenAIChatCompletionWithFallback(payload: Record<string, unknown>) {
  try {
    return await postOpenAIChatCompletion(payload);
  } catch (error) {
    if (process.platform !== "win32") throw error;
    return postOpenAIChatCompletionWithPowerShell(payload);
  }
}

async function postOpenAIChatCompletionWithPowerShell(payload: Record<string, unknown>) {
  const encodedBody = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const command = [
    "[Console]::OutputEncoding = [Text.UTF8Encoding]::new();",
    "$OutputEncoding = [Text.UTF8Encoding]::new();",
    "$body = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:OPENAI_REQUEST_BODY));",
    "$bodyBytes = [Text.Encoding]::UTF8.GetBytes($body);",
    "$headers = @{ Authorization = ('Bearer ' + $env:OPENAI_API_KEY); 'Content-Type' = 'application/json' };",
    "$response = Invoke-WebRequest -Uri 'https://api.openai.com/v1/chat/completions' -Method Post -Headers $headers -Body $bodyBytes -TimeoutSec 90 -UseBasicParsing;",
    "$stream = $response.RawContentStream;",
    "if ($stream.CanSeek) { $stream.Position = 0 };",
    "$ms = New-Object IO.MemoryStream;",
    "$stream.CopyTo($ms);",
    "[Convert]::ToBase64String($ms.ToArray())",
  ].join(" ");

  const { stdout, stderr } = await execFileAsync("powershell.exe", ["-NoProfile", "-Command", command], {
    env: {
      ...process.env,
      OPENAI_REQUEST_BODY: encodedBody,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    },
    timeout: 100000,
    maxBuffer: 1024 * 1024 * 5,
  });

  const raw = stdout.trim();
  if (!raw) {
    throw new Error(`OpenAI PowerShell fallback returned no output. ${stderr.slice(0, 300)}`);
  }

  const text = Buffer.from(raw, "base64").toString("utf8");
  return JSON.parse(text) as { choices?: Array<{ message?: { content?: string } }> };
}
