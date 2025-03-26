import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

/**
 * Compiles LaTeX files to generate a PDF
 * @param {string} mainTexFile - Path to main .tex file
 * @param {string} outputDir - Directory for output files
 * @returns {Promise<string>} - Path to the generated PDF
 */
export const compileTexToPdf = async (mainTexFile, outputDir) => {
  try {
    const texFileName = path.basename(mainTexFile);
    const texDirPath = path.dirname(mainTexFile);
    const outputFileName = path.parse(texFileName).name;
    
    console.log(`Compiling ${texFileName} to PDF...`);
    
    // Run pdflatex twice to resolve references
    await execPromise(`cd "${texDirPath}" && pdflatex -interaction=nonstopmode "${texFileName}"`);
    await execPromise(`cd "${texDirPath}" && pdflatex -interaction=nonstopmode "${texFileName}"`);
    
    const pdfPath = path.join(texDirPath, `${outputFileName}.pdf`);
    const outputPath = path.join(outputDir, `${outputFileName}.pdf`);
    
    // Copy the generated PDF to output directory
    if (texDirPath !== outputDir) {
      fs.copyFileSync(pdfPath, outputPath);
    }
    
    console.log(`PDF generated at: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('LaTeX compilation error:', error.message);
    throw new Error(`Failed to compile LaTeX document: ${error.message}`);
  }
};

/**
 * Extracts sections from separate .tex files and combines them into a main document
 * @param {string} sectionsDir - Directory containing section files
 * @param {string} mainTexTemplate - Template for main .tex file
 * @param {string} outputPath - Path to save the combined .tex file
 * @returns {Promise<string>} - Path to the generated main .tex file
 */
export const combineSections = async (sectionsDir, mainTexTemplate, outputPath) => {
  try {
    let mainContent = fs.readFileSync(mainTexTemplate, 'utf8');
    const sectionFiles = fs.readdirSync(sectionsDir).filter(file => 
      file.endsWith('.tex') && !file.includes('main')
    );
    
    // Sort sections in logical order
    const sectionOrder = [
      'introduction',
      'literature_review',
      'methodology',
      'results',
      'discussion',
      'conclusion'
    ];
    
    sectionFiles.sort((a, b) => {
      const aName = path.basename(a, '.tex');
      const bName = path.basename(b, '.tex');
      return sectionOrder.indexOf(aName) - sectionOrder.indexOf(bName);
    });
    
    // Replace section placeholders with \input commands
    let sectionCommands = '';
    sectionFiles.forEach(file => {
      const sectionPath = path.join(sectionsDir, file).replace(/\\/g, '/');
      sectionCommands += `\\input{${sectionPath}}\n`;
    });
    
    // Replace placeholder in main template
    mainContent = mainContent.replace('%SECTION_INPUTS%', sectionCommands);
    
    // Write the combined file
    fs.writeFileSync(outputPath, mainContent);
    console.log(`Combined TeX file saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error combining LaTeX sections:', error.message);
    throw new Error(`Failed to combine LaTeX sections: ${error.message}`);
  }
};

/**
 * Creates a new .tex file from content
 * @param {string} content - The LaTeX content 
 * @param {string} outputPath - Path to save the .tex file
 * @returns {string} - Path to the created file
 */
export const createTexFile = (content, outputPath) => {
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`Created TeX file at: ${outputPath}`);
  return outputPath;
};
