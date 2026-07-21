interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  >;
}

interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export async function chatCompletion(
  messages: ChatCompletionMessage[],
  options: { temperature?: number; response_format?: { type: "json_object" } } = {}
): Promise<ChatCompletionResponse> {
  const baseUrl = process.env.LLM_API_BASE_URL || "http://127.0.0.1:20128/v1";
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "cheapest";

  if (!apiKey) {
    throw new Error("Missing LLM_API_KEY environment variable.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: options.temperature ?? 0.2,
        ...(options.response_format ? { response_format: options.response_format } : {}),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LLM API returned status ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("AI sedang sibuk, coba lagi (timeout)");
    }
    throw error;
  }
}
