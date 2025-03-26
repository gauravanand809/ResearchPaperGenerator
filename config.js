import fs from 'fs';
import path from 'path';

// Default configuration
const defaultConfig = {
  // API configuration
  models: {
    primary: "deepseek/deepseek-chat-v3-0324:free",
    fallbacks: [
      "google/gemini-pro",
      "openai/gpt-3.5-turbo",
      "deepseek/deepseek-chat-v3-0324:free",
    ],
  },

  // Generation parameters
  initialDraftTemperature: 0.7,
  refinementTemperature: 0.5,
  maxTokens: 100000,

  // Output settings
  outputDir: process.env.OUTPUT_DIR || "/home/gaurav/Desktop",

  // Research paper settings
  paperSettings: {
    minWordCount: 7000,
    recommendedWordCount: 10000,
    minCitations: 75,
    recommendedCitations: 100,
  },

  // Validation thresholds
  qualityThresholds: {
    minSectionCount: 6,
    minLitReviewCitations: 50,
    minTablesCount: 5,
  },
};

/**
 * Load configuration from a file or return default
 * @returns {Object} Configuration object
 */
export function loadConfig() {
  const configPath = path.join(process.cwd(), 'paper-config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return { ...defaultConfig, ...userConfig };
    }
  } catch (error) {
    console.warn(`Warning: Could not load config file (${error.message}). Using defaults.`);
  }
  
  return defaultConfig;
}

/**
 * Save current configuration to a file
 * @param {Object} config - Configuration object to save
 * @returns {Boolean} Success status
 */
export function saveConfig(config) {
  const configPath = path.join(process.cwd(), 'paper-config.json');
  
  try {
    fs.writeFileSync(
      configPath, 
      JSON.stringify({ ...defaultConfig, ...config }, null, 2),
      'utf8'
    );
    return true;
  } catch (error) {
    console.error(`Error saving config: ${error.message}`);
    return false;
  }
}
