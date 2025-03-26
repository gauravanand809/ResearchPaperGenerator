export const validateMethodology = (methodology) => {
  // Check for required components
  const requiredComponents = [
    'researchDesign',
    'dataCollection',
    'analysisMethods',
    'validityMeasures',
    'limitations'
  ];

  const missingComponents = requiredComponents.filter(comp => 
    !methodology.toLowerCase().includes(comp.toLowerCase())
  );

  return {
    isValid: missingComponents.length === 0,
    missingComponents,
    score: (requiredComponents.length - missingComponents.length) / requiredComponents.length
  };
};

export const getCitationFormat = () => `
## Citation Format Guidelines:
- APA 7th edition style
- Include DOI/URL for all references
- Minimum 50 references
- Recent studies (2018-2024) prioritized
- Peer-reviewed sources preferred
`;

export const getPeerReviewChecklist = () => `
# Academic Peer Review Checklist:
1. Theoretical Foundation:
   - Clear research questions
   - Appropriate theoretical framework
   - Literature review depth

2. Methodology:
   - Reproducible methods
   - Appropriate sample size
   - Valid measurement tools

3. Results:
   - Statistical significance
   - Data visualization quality
   - Clear presentation

4. Discussion:
   - Interpretation of results
   - Comparison with prior work
   - Limitations addressed
`;
