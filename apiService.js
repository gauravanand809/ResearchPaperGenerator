import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost",
    "X-Title": "Research Paper Generator"
  }
});

/**
 * Call LLM API with fallback handling
 * @param {string} prompt - The prompt to send
 * @param {Object} options - API call options
 * @returns {Promise<string>} - The response content
 */
export async function callLLMApi(prompt, options = {}) {
  const {
    model = "deepseek/deepseek-chat-v3-0324:free",
    temperature = 0.7,
    maxTokens = 8000,
    attempt = 1,
    maxAttempts = 3,
    fallbackModels = [
      "google/gemini-pro",
      "openai/gpt-3.5-turbo"
    ]
  } = options;

  try {
    const currentModel = attempt > 1 && fallbackModels.length >= attempt - 1
      ? fallbackModels[attempt - 2]
      : model;
    
    console.log(`Using model: ${currentModel} (attempt ${attempt}/${maxAttempts})`);

    const response = await openai.chat.completions.create({
      model: currentModel,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens: maxTokens
    });
    
    if (process.env.DEBUG === 'true') {
      console.log('API response:', JSON.stringify(response, null, 2));
    }
    
    const content = extractContent(response);
    
    if (!content) {
      throw new Error('No content in response');
    }
    
    return typeof content === 'string' ? content : JSON.stringify(content);
  } catch (error) {
    console.error(`API error (attempt ${attempt}/${maxAttempts}):`, error.message);
    
    // Retry with fallback model if available
    if (attempt < maxAttempts) {
      return callLLMApi(prompt, {
        ...options,
        attempt: attempt + 1,
      });
    }
    
    throw new Error(`API failed after ${maxAttempts} attempts: ${error.message}`);
  }
}

/**
 * Extract content from an API response
 * @param {Object} response - The API response
 * @returns {string|null} - The extracted content
 */
function extractContent(response) {
  return response?.choices?.[0]?.message?.content || 
         response?.data?.choices?.[0]?.message?.content ||
         response?.message?.content ||
         response?.choices?.[0]?.text ||
         response?.data?.choices?.[0]?.text ||
         response?.text ||
         null;
}
