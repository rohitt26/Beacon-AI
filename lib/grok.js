/**
 * AI helper using OpenRouter's free-tier API.
 * Uses DeepSeek R1 (free) — no credit card required.
 * Sign up at https://openrouter.ai to get a free API key.
 * Free models: 50 req/day without purchase, 1000 req/day after $10 credit.
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
// Free model options (add :free suffix for zero-cost models):
//   "deepseek/deepseek-r1:free"
//   "meta-llama/llama-3.3-70b-instruct:free"
//   "google/gemma-3-27b-it:free"
const AI_MODELS = [
  "openrouter/free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
];

/**
 * Send a prompt to the AI and get a text response.
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - The AI response text
 */
export async function askGrok(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Get a free key at https://openrouter.ai"
    );
  }

  let lastError = null;

  for (const model of AI_MODELS) {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "AI Career Coach",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";

      if (!text) {
        throw new Error("Empty response from AI API");
      }

      // DeepSeek R1 models output reasoning blocks natively, scrub them to prevent JSON parsing issues downstream
      return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    } catch (error) {
      lastError = error;
      console.warn(`Model ${model} failed, trying next...`);
      // Continue to the next model in the array
    }
  }

  throw new Error(`All free models failed. Last error: ${lastError?.message}`);
}
