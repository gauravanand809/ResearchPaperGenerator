import puppeteer from 'puppeteer';
import fs from 'fs';

export const formatPaper = (content) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Research Paper</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif;
      line-height: 1.6; 
      margin: 0;
      padding: 0;
      color: #333;
    }
    .paper {
      max-width: 210mm;
      margin: 0 auto;
      padding: 25mm;
    }
    h1, h2, h3, h4 {
      color: #222;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    h1 { font-size: 18pt; }
    h2 { font-size: 16pt; }
    h3 { font-size: 14pt; }
    p, li {
      font-size: 12pt;
      text-align: justify;
      margin-bottom: 0.5em;
    }
    .abstract {
      font-style: italic;
      margin-bottom: 2em;
    }
    .references {
      font-size: 11pt;
    }
  </style>
</head>
<body>
  <div class="paper">
    ${content}
  </div>
</body>
</html>`;
};

export const generatePdf = async (htmlContent, outputPath) => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '25mm',
        right: '25mm',
        bottom: '25mm',
        left: '25mm'
      },
      printBackground: true
    });
  } finally {
    await browser.close();
  }
};

export const getSectionTemplate = (sectionName) => {
  const templates = {
    abstract: `<div class="abstract">
      <h1>Abstract</h1>
      <p>[150-200 word summary of key findings and significance]</p>
    </div>`,
    introduction: `<section>
      <h1>Introduction</h1>
      <h2>Background</h2>
      <p>[Context and importance of the research]</p>
      
      <h2>Research Gap</h2>
      <p>[What's missing in current knowledge]</p>
      
      <h2>Objectives</h2>
      <p>[Clear study goals and hypotheses]</p>
    </section>`,
    methodology: `<section>
      <h1>Methodology</h1>
      <h2>Research Design</h2>
      <p>[Type of study and approach]</p>
      
      <h2>Data Collection</h2>
      <p>[Detailed methods for gathering data]</p>
      
      <h2>Analysis Methods</h2>
      <p>[Statistical/qualitative analysis techniques]</p>
    </section>`
  };
  return templates[sectionName] || `<section><h1>${sectionName}</h1><p>[Content]</p></section>`;
};
