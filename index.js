import { createInitialPrompt, createRefinementPrompt } from './promptEngineer.js';
import { validateMethodology, getCitationFormat } from './researchMethodology.js';
import { formatPaper, generatePdf, getSectionTemplate } from './markdownFormatter.js';
import { validateAcademicQuality, getQualityReport } from './qualityValidator.js';
import { compileTexToPdf, combineSections, createTexFile } from './texProcessor.js';
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
  .option('--tex', 'Generate LaTeX files')
  .option('--compile-tex', 'Compile LaTeX files to PDF')
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
  
  // Generate LaTeX files if requested
  if (options.tex) {
    try {
      const texOutputs = await generateTexFiles(topic, markdownContent, outputDir);
      outputs.push(...texOutputs);
      
      // Compile LaTeX to PDF if requested
      if (options.compileTex) {
        const mainTexPath = texOutputs.find(o => o.type === 'Main TeX')?.path;
        if (mainTexPath) {
          const texPdfPath = await compileTexToPdf(mainTexPath, outputDir);
          outputs.push({ type: 'TeX PDF', path: texPdfPath });
        }
      }
    } catch (texError) {
      console.error('LaTeX generation error:', texError.message);
    }
  }

  console.log('\n📄 Research paper saved to:');
  outputs.forEach(output => {
    console.log(`- ${output.type}: ${output.path}`);
  });
}

/**
 * Generate LaTeX files from markdown content
 * @param {string} topic - Research paper topic
 * @param {string} markdownContent - Paper content in markdown
 * @param {string} outputDir - Directory to save output
 * @returns {Promise<Array>} - List of generated files
 */
async function generateTexFiles(topic, markdownContent, outputDir) {
  const safeTopic = topic.replace(/\s+/g, '_').substring(0, 50);
  const texDir = path.join(outputDir, `${safeTopic}_tex`);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(texDir)) {
    fs.mkdirSync(texDir, { recursive: true });
  }
  
  // Create sections directory
  const sectionsDir = path.join(texDir, 'sections');
  if (!fs.existsSync(sectionsDir)) {
    fs.mkdirSync(sectionsDir, { recursive: true });
  }
  
  const outputs = [];
  
  // Extract and save sections
  const sections = extractSectionsFromMarkdown(markdownContent);
  
  for (const [sectionName, content] of Object.entries(sections)) {
    const sectionFile = path.join(sectionsDir, `${sectionName}.tex`);
    fs.writeFileSync(sectionFile, content, 'utf8');
    outputs.push({ type: `${sectionName} section`, path: sectionFile });
  }
  
  // Copy references.tex
  const referencesSource = path.join(process.cwd(), 'references.tex');
  const referencesDest = path.join(texDir, 'references.tex');
  
  if (fs.existsSync(referencesSource)) {
    fs.copyFileSync(referencesSource, referencesDest);
    outputs.push({ type: 'References', path: referencesDest });
  } else {
    console.warn('references.tex not found, creating empty file');
    fs.writeFileSync(referencesDest, '\\begin{thebibliography}{00}\n\\end{thebibliography}', 'utf8');
    outputs.push({ type: 'References (empty)', path: referencesDest });
  }
  
  // Create main.tex
  const mainTexTemplate = `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{natbib}
\\usepackage{hyperref}
\\usepackage{booktabs}
\\usepackage{float}
\\usepackage{tabularx}
\\usepackage{multicol}
\\usepackage{lipsum}

\\title{${topic}}
\\author{Generated with AI Assistance}
\\date{\\today}

\\begin{document}

\\maketitle

%SECTION_INPUTS%

\\input{${path.join(texDir, 'references.tex').replace(/\\/g, '/')}}

\\end{document}`;

  const mainTexPath = path.join(texDir, 'main.tex');
  fs.writeFileSync(mainTexPath, mainTexTemplate, 'utf8');
  outputs.push({ type: 'Main TeX', path: mainTexPath });
  
  return outputs;
}

/**
 * Extract sections from markdown content and convert to LaTeX
 * @param {string} markdownContent - Paper content in markdown
 * @returns {Object} - Object with section names and LaTeX content
 */
function extractSectionsFromMarkdown(markdownContent) {
  const sections = {
    'abstract': '',
    'introduction': '',
    'literature_review': '',
    'methodology': '',
    'results': '',
    'discussion': '',
    'conclusion': ''
  };
  
  // Extract abstract
  const abstractMatch = markdownContent.match(/##?\s*Abstract\s*([\s\S]*?)(?=##?\s|$)/i);
  if (abstractMatch) {
    sections.abstract = convertMarkdownToLatex(abstractMatch[1]);
  }
  
  // Extract introduction
  const introMatch = markdownContent.match(/##?\s*Introduction\s*([\s\S]*?)(?=##?\s|$)/i);
  if (introMatch) {
    sections.introduction = convertMarkdownToLatex(introMatch[1]);
  }
  
  // Extract literature review
  const litReviewMatch = markdownContent.match(/##?\s*Literature\s*Review\s*([\s\S]*?)(?=##?\s|$)/i);
  if (litReviewMatch) {
    sections.literature_review = convertMarkdownToLatex(litReviewMatch[1]);
  }
  
  // Extract methodology
  const methodMatch = markdownContent.match(/##?\s*Methodology\s*([\s\S]*?)(?=##?\s|$)/i);
  if (methodMatch) {
    sections.methodology = convertMarkdownToLatex(methodMatch[1]);
  }
  
  // Extract results
  const resultsMatch = markdownContent.match(/##?\s*Results\s*([\s\S]*?)(?=##?\s|$)/i);
  if (resultsMatch) {
    sections.results = convertMarkdownToLatex(resultsMatch[1]);
  }
  
  // Extract discussion
  const discussionMatch = markdownContent.match(/##?\s*Discussion\s*([\s\S]*?)(?=##?\s|$)/i);
  if (discussionMatch) {
    sections.discussion = convertMarkdownToLatex(discussionMatch[1]);
  }
  
  // Extract conclusion
  const conclusionMatch = markdownContent.match(/##?\s*Conclusion\s*([\s\S]*?)(?=##?\s|$)/i);
  if (conclusionMatch) {
    sections.conclusion = convertMarkdownToLatex(conclusionMatch[1]);
  }
  
  return sections;
}

/**
 * Convert markdown content to LaTeX
 * @param {string} markdown - Content in markdown format
 * @returns {string} - Content in LaTeX format
 */
function convertMarkdownToLatex(markdown) {
  if (!markdown) return '';
  
  let latex = markdown
    // Convert markdown headings to LaTeX sections
    .replace(/^### (.*?)$/gm, '\\subsubsection{$1}')
    .replace(/^## (.*?)$/gm, '\\subsection{$1}')
    .replace(/^# (.*?)$/gm, '\\section{$1}')
    
    // Convert markdown emphasis
    .replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}')
    .replace(/\*(.*?)\*/g, '\\textit{$1}')
    
    // Convert markdown lists
    .replace(/^- (.*?)$/gm, '\\item $1')
    .replace(/^\d+\. (.*?)$/gm, '\\item $1')
    
    // Wrap lists
    .replace(/(?:^\\item .*?$\n?)+/gm, (match) => {
      if (match.includes('\\item ')) {
        return '\\begin{itemize}\n' + match + '\\end{itemize}\n';
      }
      return match;
    })
    
    // Fix tables - this is a simple conversion
    .replace(/\|([^\n]+)\|/g, (match, content) => {
      const cells = content.split('|').map(cell => cell.trim());
      return cells.join(' & ') + ' \\\\';
    })
    
    // Convert markdown links
    .replace(/\[(.*?)\]\((.*?)\)/g, '\\href{$2}{$1}')
    
    // Fix special characters
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/&/g, '\\&')
    .replace(/~/g, '\\~{}')
    .replace(/\^/g, '\\^{}');
  
  // Clean up extra newlines and spaces
  latex = latex.trim().replace(/\n{3,}/g, '\n\n');
  
  return latex;
}

// Start the paper generation if called directly
if (process.argv[1].includes('index.js')) {
  generateResearchPaper();
}

// Export for potential programmatic usage
export { generateResearchPaper };
