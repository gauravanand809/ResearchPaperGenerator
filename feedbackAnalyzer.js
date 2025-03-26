export const analyzeFeedback = (feedback) => {
  const analysis = {
    needsMoreDetail: feedback.includes('more detail') || feedback.includes('expand'),
    needsMoreCitations: feedback.includes('citation') || feedback.includes('reference'),
    needsBetterStructure: feedback.includes('structure') || feedback.includes('flow'),
    needsMoreHumanLike: feedback.includes('human') || feedback.includes('natural'),
    needsMoreAnalysis: feedback.includes('analysis') || feedback.includes('interpretation')
  };

  return {
    ...analysis,
    actionItems: Object.entries(analysis)
      .filter(([_, needs]) => needs)
      .map(([area]) => area.replace('needs', 'improve'))
  };
};

export const generateImprovementPrompt = (feedback, currentContent) => {
  const analysis = analyzeFeedback(feedback);
  const improvements = analysis.actionItems.join(', ');
  
  return `Please improve this research paper by:
1. Adding more depth and detail to all sections
2. Ensuring human-like, natural academic writing
3. Keeping AI-generated content under 10%
4. Maintaining plagiarism under 15%
5. Specifically addressing: ${improvements}

Current content:
${currentContent}

Make all improvements while:
- Increasing word count to 7000-8000 words
- Adding more citations and references
- Improving flow and readability
- Maintaining academic rigor`;
};
