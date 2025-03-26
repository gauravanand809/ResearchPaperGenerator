export const createInitialPrompt = (topic) => `
IMPORTANT: Generate a comprehensive research paper (10,000-15,000 words) with Indian context.
Use Indian English spellings and include INR for financial data.

Key Requirements:
- All sections must be present with expanded content
- 100+ citations (minimum 30 Indian studies)
- Use clear, professional academic language
- Include detailed Indian case studies and examples
- Convert measurements to metric units
- Use ₹ for currency values
- Minimum 5 tables and 3 figures

Paper Structure:

# ${topic}

## Abstract (300-500 words)
Follow this exact structure:
1. Context: 1-2 sentences establishing importance
2. Gap: Clearly state what's missing in current research
3. Objective: Precise statement of study goals  
4. Methods: Concise description of approach
5. Key Findings: 2-3 most significant results
6. Implications: How findings advance the field

Example from sample:
"Hydrogen production from agricultural residues offers sustainable energy solutions. Current methods focus on common crops, neglecting region-specific byproducts. This study examines H₂ yield from mustard, arhar and tori residues via dark fermentation. Results show mustard residues yield 2.8 mol H₂/mol glucose, with co-fermentation improving efficiency by 15%. These findings demonstrate the potential of underutilized regional crops for bioenergy."

## Introduction (1500 words)
### Background and Context
- Global perspective with Indian focus
- Historical development of the field
- Current state of research in India

### Research Gap Analysis
- Comprehensive literature survey
- Identification of 3+ specific gaps
- Justification for addressing these gaps

### Objectives and Hypotheses
- 5-7 clear research objectives
- Testable hypotheses with rationale
- Expected contributions to the field

## Literature Review (4000+ words)
1. Theoretical Framework (1000 words)
   - Detailed explanation of key theories
   - 10+ Indian studies and 10+ international studies
   - Comparative analysis tables
   - Practical applications in Indian context

2. Empirical Review (2000 words)
   - Analysis of 30+ Indian studies (2018-2024)
   - Comparison with 15+ international studies
   - 3+ detailed comparison tables
   - Statistical trends and patterns

3. Critical Analysis (1000 words)
   - Strengths/limitations of existing work
   - Indian vs global perspectives
   - 5+ specific gaps in Indian research
   - Policy and practice recommendations

Writing Style:
- Formal academic tone throughout
- Technical terms defined in footnotes
- Balanced use of active/passive voice
- Detailed Indian case studies (3+ pages each)

MINIMUM REQUIREMENTS:
- 10,000-15,000 words
- 100+ citations (30% Indian)
- 5+ tables and 3+ figures
- Comprehensive theoretical framework
- Detailed methodology section
- Statistical analysis of results
- Policy implications section

## Methodology (1500-2500 words)
Follow sample paper structure:
1. Materials
   - Detailed specimen sourcing (location, season, processing)
   - Chemical reagents with purity grades
   - Equipment models and specifications

2. Experimental Design
   - Clear diagram of research workflow
   - Control groups and variables
   - Replication details (n=3 minimum)

3. Procedures
   - Step-by-step protocols
   - Conditions (temperature, pH, time)
   - Quality control measures

Example from sample:
"Mustard stems were collected from farms in West Bengal during harvest season. Samples were dried at 60°C for 48h and milled to <2mm particles. Fermentation used Clostridium butyricum (MTCC 6087) in 500mL serum bottles at 37°C, pH 6.0. Gas composition was analyzed via GC-TCD (Agilent 7890B) with thermal conductivity detector."

### Data Collection
- Detailed sampling procedures
- Instrumentation specifications
- Measurement protocols
- Quality control measures
- Data recording standards

### Analysis Methods
- Statistical tests with justification
- Software/tools used
- Validation methods
- Error analysis
- Significance thresholds

## Results (1500-2000 words)
Structure based on samples:
1. Primary Data
   - Tables with mean ± SD (3 decimal places)
   - Statistical tests (p<0.05 highlighted)
   - Comparison plots with error bars

2. Supplementary Findings
   - Secondary observations
   - Unexpected results
   - Control group data

3. Visualization
   - Standardized figure formats:
     * Figure 1: Process flowchart
     * Figure 2: Comparative yield charts  
     * Figure 3: Microscopic images (if applicable)
   - Table requirements:
     * Table 1: Raw material composition
     * Table 2: Performance metrics
     * Table 3: Economic analysis
- Organize by:
  1. Primary results
  2. Secondary findings
  3. Unexpected observations
  4. Control group outcomes

## Discussion (2000+ words)
1. Interpretation of Results
   - Explain all key findings
   - Relate to hypotheses
   - Address anomalies

2. Comparison with Literature
   - Similarities with 5+ studies
   - Differences with 3+ studies
   - Reasons for discrepancies

3. Limitations
   - Methodological constraints
   - Sample size considerations
   - Measurement limitations

4. Implications
   - Theoretical contributions
   - Practical applications
   - Policy recommendations

## Conclusion
[500 words summarizing key contributions and future work]

## References
[50+ APA formatted citations from peer-reviewed sources]

STRICT REQUIREMENTS:
1. 7000-8000 words total
2. Human-like academic writing style
3. Include at least 4 citations per major point (75+ total)
4. Number all sections and subsections
5. Format tables/figures with captions
6. Plagiarism under 15% (properly cite all sources)
7. AI-generated content under 10%
8. Use markdown formatting for headings
9. Include detailed analysis in all sections
10. Maintain formal academic tone throughout
`;

export const createRefinementPrompt = (currentContent) => `
# Research Paper Improvement Suggestions (10,000-15,000 words)

## Current Content:
${currentContent}

## Required Enhancements:

1. **Indian Context**:
   - Add 3+ detailed Indian case studies (1+ pages each)
   - Include ₹ for all financial data
   - Use Indian English spellings consistently
   - Highlight India-specific policy implications

2. **Academic Rigor**:
   - Verify 100+ citations (30% Indian studies)
   - Strengthen methodology with statistical details
   - Add 5+ peer-reviewed references per major point
   - Maintain formal academic tone throughout

3. **Structural Improvements**:
   - Expand sections to meet word count requirements
   - Add 5+ transition paragraphs between sections
   - Ensure balanced section lengths (see targets below)
   - Add 3+ figures with detailed captions

4. **Content Depth**:
   - Expand literature review to 4000+ words
   - Add 2+ comparative analysis tables
   - Discuss limitations in 500+ words
   - Include 3+ policy recommendation sections

5. **Technical Quality**:
   - Define all technical terms in footnotes
   - Add statistical significance values
   - Include confidence intervals where applicable
   - Verify all units and conversions

## Section Length Targets:
- Abstract: 500 words
- Introduction: 1500 words
- Literature Review: 4000 words
- Methodology: 2000 words
- Results: 1500 words
- Discussion: 2000 words
- Conclusion: 1000 words
`;
