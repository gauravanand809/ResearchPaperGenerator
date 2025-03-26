export const validateAcademicQuality = (content) => {
  // Section validation with strict formatting
  const sectionChecks = {
    hasAbstract: /^## Abstract(\s|$)/m.test(content),
    hasIntroduction: /^## Introduction(\s|$)/m.test(content),
    hasLiteratureReview: /^## Literature Review(\s|$)/m.test(content),
    hasMethodology: /^## Methodology(\s|$)/m.test(content),
    hasResults: /^## Results(\s|$)/m.test(content),
    hasDiscussion: /^## Discussion(\s|$)/m.test(content),
    hasConclusion: /^## Conclusion(\s|$)/m.test(content),
    hasReferences: /^## References(\s|$)/m.test(content)
  };

  // Quantitative checks
  const citationCount = (content.match(/\([A-Za-z]+, \d{4}\)/g) || []).length;
  const wordCount = content.split(/\s+/).length;
  const tablesCount = (content.match(/\|.+\|/g) || []).length;
  const theoryKeywords = ['framework', 'theory', 'model', 'concept'];
  const hasTheory = theoryKeywords.some(kw => content.includes(kw));

  // Literature Review specific checks
  const litReviewSection = content.match(/## Literature Review([\s\S]*?)## Methodology/)?.[1] || '';
  const litReviewCitations = (litReviewSection.match(/\([A-Za-z]+, \d{4}\)/g) || []).length;
  const litReviewWordCount = litReviewSection.split(/\s+/).length;

  return {
    passes: Object.values(sectionChecks).every(Boolean) &&
            citationCount >= 100 &&
            wordCount >= 10000 && wordCount <= 15000 &&
            tablesCount >= 5 &&
            litReviewCitations >= 50 &&
            litReviewWordCount >= 4000 &&
            hasTheory,
    details: {
      ...sectionChecks,
      citationCount,
      wordCount,
      tablesCount,
      litReviewCitations,
      litReviewWordCount,
      hasTheory,
      meetsCitationRequirement: citationCount >= 100,
      meetsLengthRequirement: wordCount >= 10000 && wordCount <= 15000,
      meetsTableRequirement: tablesCount >= 5,
      meetsLitReviewRequirements: litReviewCitations >= 50 && litReviewWordCount >= 4000,
      hasTheoreticalFramework: hasTheory
    }
  };
};

export const getQualityReport = (content) => {
  const validation = validateAcademicQuality(content);
  const missingSections = Object.entries(validation.details)
    .filter(([key, val]) => key.startsWith('has') && !val)
    .map(([key]) => key.replace('has', ''));

  return {
    status: validation.passes ? 'PASS' : 'FAIL',
    missingSections,
    wordCount: validation.details.wordCount,
    citationCount: validation.details.citationCount,
    tablesCount: validation.details.tablesCount,
    recommendations: validation.passes ? [] : [
      ...(validation.details.wordCount < 10000 ? ['Increase length to 10,000+ words'] : []),
      ...(validation.details.citationCount < 100 ? ['Add more citations (need 100+)'] : []),
      ...(validation.details.tablesCount < 5 ? ['Add more comparative tables (need 5+)'] : []),
      ...(validation.details.litReviewCitations < 50 ? ['Literature Review needs 50+ citations'] : []),
      ...(!validation.details.hasTheoreticalFramework ? ['Strengthen theoretical framework'] : [])
    ]
  };
};
