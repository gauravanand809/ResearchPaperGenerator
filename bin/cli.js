#!/usr/bin/env node

import { generateResearchPaper } from '../index.js';
import { Command } from 'commander';

const program = new Command();

program
  .name('papergpt')
  .description('Generate academic research papers with AI')
  .version('1.0.0')
  .option('-t, --topic <topic>', 'Research topic')
  .option('-o, --output <directory>', 'Output directory')
  .option('-i, --iterations <number>', 'Number of refinement iterations', '2')
  .option('-m, --model <model>', 'LLM model to use')
  .option('--no-pdf', 'Skip PDF generation')
  .option('--no-html', 'Skip HTML generation')
  .option('--tex', 'Generate LaTeX files')
  .option('--compile-tex', 'Compile LaTeX files to PDF')
  .action(() => {
    generateResearchPaper();
  });

program.parse(process.argv);
