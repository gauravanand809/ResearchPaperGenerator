import { createInitialPrompt, createRefinementPrompt } from './promptEngineer.js';
import { validateMethodology, getCitationFormat } from './researchMethodology.js';
import { formatPaper, generatePdf, getSectionTemplate } from './markdownFormatter.js';
import { validateAcademicQuality, getQualityReport } from './qualityValidator.js';
import { loadConfig } from './config.js';
import { callLLMApi } from './apiService.js';
import dotenv from 'dotenv';
import readline from 'readline-sync';
import fs from 'fs';
import path from 'path';
import { createSpinner } from 'nanospinner';
import { Command } from 'commander';

// Load environment variables
dotenv.config();

// Parse command line arguments
const program = new Command();
program
  .name('research-paper-generator')
  .description('Generate academic research papers with AI')
  .version('1.0.0')
  .option('-t, --topic <topic>', 'Research topic')
  .option('-o, --output <directory>', 'Output directory', process.env.OUTPUT_DIR || '/home/gaurav/Desktop')
  .option('-i, --iterations <number>', 'Number of refinement iterations', '2')
  .option('-m, --model <model>', 'LLM model to use', process.env.DEFAULT_MODEL || 'deepseek/deepseek-chat-v3-0324:free')
  .option('--no-pdf', 'Skip PDF generation')
  .option('--no-html', 'Skip HTML generation')
  .parse(process.argv);

const options = program.opts();

async function generateResearchPaper() {
  try {
    // Load configuration
    const config = loadConfig();
    
    // Get topic from CLI args or prompt user
    const topic = options.topic || getResearchTopic();
    
    console.log(`\n📝 Generating research paper on: "${topic}"\n`);
    
    // Generate initial draft
    const spinner = createSpinner('Generating initial draft...').start();
    let paper;
    try {
      paper = await generateInitialDraft(topic, config);
      spinner.success({ text: 'Initial draft generated!' });
    } catch (error) {
      spinner.error({ text: `Failed to generate initial draft: ${error.message}` });
      process.exit(1);
    }
    
    // Refine paper in iterations
    const iterations = parseInt(options.iterations);
    for (let i = 0; i < iterations; i++) {
      const refineSpinner = createSpinner(`Refining paper (iteration ${i + 1}/${iterations})...`).start();
      try {
        paper = await refinePaper(paper, config);
        refineSpinner.success({ text: `Refinement ${i + 1}/${iterations} completed!` });
      } catch (error) {
        refineSpinner.error({ text: `Refinement failed: ${error.message}` });
        // Continue with current version rather than exiting
        console.log('Continuing with current version...');
      }
    }

    // Format and save outputs
    const saveSpinner = createSpinner('Saving outputs...').start();
    try {
      // Check paper quality
      const qualityReport = getQualityReport(paper);
      console.log('\nQuality Report:', qualityReport);
      
      if (qualityReport.status === 'FAIL') {
        console.warn('\n⚠️  Warning: Paper quality does not meet all criteria.');
        console.warn('Recommendations:');
        qualityReport.recommendations.forEach(rec => console.warn(`- ${rec}`));
      }
      
      // Format as HTML for better PDF generation
      const htmlPaper = formatPaper(paper);
      
      // Save outputs
      await saveOutputs(topic, htmlPaper, paper, options.output);
      saveSpinner.success({ text: 'All outputs saved successfully!' });
    } catch (error) {
      saveSpinner.error({ text: `Failed to save outputs: ${error.message}` });
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function getResearchTopic() {
  const topic = readline.question('Enter your research topic: ');
  if (!topic.trim()) {
    throw new Error('Topic cannot be empty');
  }
  return topic;
}

async function generateInitialDraft(topic, config) {
  const prompt = createInitialPrompt(topic);
  return callLLMApi(prompt, {
    model: options.model,
    temperature: config.initialDraftTemperature || 0.7,
    maxTokens: config.maxTokens || 8000
  });
}

async function refinePaper(currentContent, config) {
  const prompt = createRefinementPrompt(currentContent);
  return callLLMApi(prompt, {
    model: options.model,
    temperature: config.refinementTemperature || 0.5,
    maxTokens: config.maxTokens || 8000
  });
}

async function saveOutputs(topic, htmlContent, markdownContent, outputDir) {
  const safeTopic = topic.length > 50 
    ? topic.substring(0, 50) + '_' + Date.now().toString().slice(-4)
    : topic.replace(/\s+/g, '_');

  const basePath = path.join(outputDir, `Research_Paper_${safeTopic}`);
  const outputs = [];
  
  // Save Markdown
  const mdPath = `${basePath}.md`;
  fs.writeFileSync(mdPath, markdownContent);
  outputs.push({ type: 'Markdown', path: mdPath });
  
  // Save HTML if not disabled
  if (options.html) {
    const htmlPath = `${basePath}.html`;
    fs.writeFileSync(htmlPath, htmlContent);
    outputs.push({ type: 'HTML', path: htmlPath });
  }
  
  // Generate PDF if not disabled
  if (options.pdf) {
    const pdfPath = `${basePath}.pdf`;
    await generatePdf(htmlContent, pdfPath);
    outputs.push({ type: 'PDF', path: pdfPath });
  }

  console.log('\n📄 Research paper saved to:');
  outputs.forEach(output => {
    console.log(`- ${output.type}: ${output.path}`);
  });
}

// Start the paper generation if called directly
if (process.argv[1].includes('index.js')) {
  generateResearchPaper();
}

// Export for potential programmatic usage
export { generateResearchPaper };
