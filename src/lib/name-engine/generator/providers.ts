import { execFile } from "node:child_process";
import { request as httpsRequest } from "node:https";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  steps?: Array<{ type?: string; content?: Array<{ text?: string; type?: string }> }>;
};

type OpenAIChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

export async function postGeminiGenerateContent(
  model: string,
  payload: Record<string, unknown>,
): Promise<GeminiResponse> {
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

export function extractGeminiOutputText(data: GeminiResponse) {
  const interactionText =
    data.steps
      ?.filter((step) => step.type === "model_output")
      .flatMap((step) => step.content || [])
      .map((part) => part.text || "")
      .join("") || "";

  if (interactionText) return interactionText;

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "{}";
}

function postOpenAIChatCompletion(payload: Record<string, unknown>) {
  return new Promise<OpenAIChatCompletionResponse>((resolve, reject) => {
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

export async function postOpenAIChatCompletionWithFallback(payload: Record<string, unknown>) {
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
  return JSON.parse(text) as OpenAIChatCompletionResponse;
}
