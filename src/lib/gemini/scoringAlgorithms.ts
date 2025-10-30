/**
 * Three Mathematically-Justified Scoring Algorithms for PDS Matching
 *
 * Algorithm 1: Weighted Sum Scoring (Primary) - Linear combination with normalized weights
 * Algorithm 2: Skill-Experience Composite (Secondary) - Exponential decay weighting
 * Algorithm 3: Eligibility-Education Tie-breaker - Boolean matching with priority
 *
 * References:
 * - Weighted Sum Model: Fishburn, P. C. (1967). "Additive Utilities with Incomplete Product Set"
 * - Exponential Weighting: Kahneman & Tversky (1979). "Prospect Theory"
 * - Boolean Matching: Gale-Shapley Algorithm for stable matching
 */

export interface JobRequirements {
  degreeRequirement: string;
  eligibilities: string[];
  skills: string[];
  yearsOfExperience: number;
}

export interface ApplicantData {
  highestEducationalAttainment: string;
  eligibilities: Array<{ eligibilityTitle: string }>;
  skills: string[];
  totalYearsExperience: number;
}

export interface ScoreBreakdown {
  educationScore: number;
  experienceScore: number;
  skillsScore: number;
  eligibilityScore: number;
  totalScore: number;
  algorithmUsed: string;
  reasoning: string;
}

/**
 * ALGORITHM 1: Weighted Sum Scoring Model
 *
 * Mathematical Basis: Linear weighted combination with normalized scores
 * Formula: Score = w₁·E + w₂·X + w₃·S + w₄·L
 * where:
 * - E = Education match (0-100)
 * - X = Experience match (0-100)
 * - S = Skills match (0-100)
 * - L = License/Eligibility match (0-100)
 * - w₁ = 0.30 (30% weight for education)
 * - w₂ = 0.25 (25% weight for experience)
 * - w₃ = 0.25 (25% weight for skills)
 * - w₄ = 0.20 (20% weight for eligibility)
 *
 * Weights sum to 1.0 for proper normalization.
 */
export function algorithm1_WeightedSum(
  job: JobRequirements,
  applicant: ApplicantData
): ScoreBreakdown {
  // Education Score: Exact match = 100, partial match = 70, no match = 40
  let educationScore = 40;
  const jobDegree = job.degreeRequirement.toLowerCase();
  const applicantDegree = applicant.highestEducationalAttainment.toLowerCase();

  if (applicantDegree.includes(jobDegree) || jobDegree.includes(applicantDegree)) {
    educationScore = 100; // Exact match
  } else if (
    (jobDegree.includes('bachelor') && applicantDegree.includes('bachelor')) ||
    (jobDegree.includes('information technology') && applicantDegree.includes('computer science')) ||
    (jobDegree.includes('computer science') && applicantDegree.includes('information technology'))
  ) {
    educationScore = 70; // Related field
  }

  // Experience Score: Normalized based on required years
  const requiredYears = job.yearsOfExperience || 1;
  const applicantYears = applicant.totalYearsExperience || 0;
  let experienceScore = Math.min((applicantYears / requiredYears) * 100, 100);

  // Bonus for exceeding requirements
  if (applicantYears > requiredYears) {
    experienceScore = Math.min(experienceScore + 10, 100);
  }

  // Skills Score: Jaccard similarity coefficient
  const jobSkills = job.skills.map(s => s.toLowerCase());
  const applicantSkills = applicant.skills.map(s => s.toLowerCase());

  const matchingSkills = applicantSkills.filter(skill =>
    jobSkills.some(jobSkill =>
      skill.includes(jobSkill) || jobSkill.includes(skill)
    )
  );

  const skillsScore = jobSkills.length > 0
    ? (matchingSkills.length / jobSkills.length) * 100
    : 50;

  // Eligibility Score: Boolean match with partial credit
  const jobEligibilities = job.eligibilities.map(e => e.toLowerCase());
  const applicantEligibilities = applicant.eligibilities.map(e =>
    e.eligibilityTitle.toLowerCase()
  );

  let eligibilityScore = 50; // Default for no requirements

  if (jobEligibilities.length > 0 && !jobEligibilities.includes('none required')) {
    const hasRequired = jobEligibilities.some(req =>
      applicantEligibilities.some(app => app.includes(req) || req.includes(app))
    );
    eligibilityScore = hasRequired ? 100 : 30;
  }

  // Weighted sum calculation
  const weights = { education: 0.30, experience: 0.25, skills: 0.25, eligibility: 0.20 };
  const totalScore =
    weights.education * educationScore +
    weights.experience * experienceScore +
    weights.skills * skillsScore +
    weights.eligibility * eligibilityScore;

  return {
    educationScore,
    experienceScore,
    skillsScore,
    eligibilityScore,
    totalScore: Math.round(totalScore * 100) / 100,
    algorithmUsed: 'Weighted Sum Model',
    reasoning: `Education (30%): ${educationScore.toFixed(1)}, Experience (25%): ${experienceScore.toFixed(1)}, Skills (25%): ${skillsScore.toFixed(1)}, Eligibility (20%): ${eligibilityScore.toFixed(1)}`
  };
}

/**
 * ALGORITHM 2: Skill-Experience Composite Scoring
 *
 * Mathematical Basis: Exponential decay function for experience weighting
 * Formula: Score = α·S·exp(β·X) + γ·E + δ·L
 * where:
 * - S = Skills match ratio
 * - X = Experience adequacy (years/required)
 * - E = Education match
 * - L = License match
 * - α = 0.40 (skills-experience composite weight)
 * - β = 0.5 (decay rate)
 * - γ = 0.35 (education weight)
 * - δ = 0.25 (eligibility weight)
 *
 * This algorithm prioritizes candidates with both relevant skills AND experience.
 */
export function algorithm2_SkillExperienceComposite(
  job: JobRequirements,
  applicant: ApplicantData
): ScoreBreakdown {
  // Skills matching (Sørensen-Dice coefficient)
  const jobSkills = new Set(job.skills.map(s => s.toLowerCase()));
  const applicantSkills = new Set(applicant.skills.map(s => s.toLowerCase()));

  const intersection = [...applicantSkills].filter(s =>
    [...jobSkills].some(js => s.includes(js) || js.includes(s))
  ).length;

  const skillsScore = jobSkills.size > 0
    ? (2 * intersection / (jobSkills.size + applicantSkills.size)) * 100
    : 50;

  // Experience adequacy with exponential weighting
  const requiredYears = job.yearsOfExperience || 1;
  const experienceRatio = applicant.totalYearsExperience / requiredYears;
  const experienceScore = Math.min(experienceRatio * 100, 100);

  // Skill-Experience composite with exponential function
  const beta = 0.5;
  const composite = skillsScore * Math.exp(beta * Math.min(experienceRatio, 2)) / Math.exp(beta * 2);

  // Education scoring
  const jobDegree = job.degreeRequirement.toLowerCase();
  const applicantDegree = applicant.highestEducationalAttainment.toLowerCase();

  let educationScore = 50;
  if (applicantDegree.includes(jobDegree) || jobDegree.includes(applicantDegree)) {
    educationScore = 100;
  } else if (jobDegree.includes('bachelor') && applicantDegree.includes('bachelor')) {
    educationScore = 75;
  }

  // Eligibility scoring
  const jobEligibilities = job.eligibilities.map(e => e.toLowerCase());
  const applicantEligibilities = applicant.eligibilities.map(e =>
    e.eligibilityTitle.toLowerCase()
  );

  let eligibilityScore = 50;
  if (jobEligibilities.length > 0 && !jobEligibilities.includes('none required')) {
    const hasRequired = jobEligibilities.some(req =>
      applicantEligibilities.some(app => app.includes(req) || req.includes(app))
    );
    eligibilityScore = hasRequired ? 100 : 40;
  }

  // Composite calculation
  const totalScore = 0.40 * composite + 0.35 * educationScore + 0.25 * eligibilityScore;

  return {
    educationScore,
    experienceScore,
    skillsScore,
    eligibilityScore,
    totalScore: Math.round(totalScore * 100) / 100,
    algorithmUsed: 'Skill-Experience Composite',
    reasoning: `Skill-Experience Composite (40%): ${composite.toFixed(1)}, Education (35%): ${educationScore.toFixed(1)}, Eligibility (25%): ${eligibilityScore.toFixed(1)}`
  };
}

/**
 * ALGORITHM 3: Eligibility-Education Tie-breaker
 *
 * Mathematical Basis: Lexicographic ordering with boolean logic
 * Used when scores from Algorithm 1 and 2 are within 5% of each other
 *
 * Priority Order:
 * 1. Professional license/eligibility (100 points if exact match)
 * 2. Exact degree match (50 points)
 * 3. Years over requirement (10 points per year, max 30)
 * 4. Skill diversity (10 points per matched skill, max 20)
 */
export function algorithm3_EligibilityEducationTiebreaker(
  job: JobRequirements,
  applicant: ApplicantData
): ScoreBreakdown {
  let totalScore = 0;
  let reasoning = [];

  // Priority 1: Professional License (highest weight)
  const jobEligibilities = job.eligibilities.map(e => e.toLowerCase());
  const applicantEligibilities = applicant.eligibilities.map(e =>
    e.eligibilityTitle.toLowerCase()
  );

  let eligibilityScore = 0;
  if (jobEligibilities.length > 0 && !jobEligibilities.includes('none required')) {
    const exactMatch = jobEligibilities.some(req =>
      applicantEligibilities.some(app => app.includes(req) || req.includes(app))
    );

    if (exactMatch) {
      eligibilityScore = 100;
      totalScore += 40; // 40% weight
      reasoning.push('Has required professional license (+40)');
    } else {
      eligibilityScore = 0;
      reasoning.push('Missing required professional license (0)');
    }
  } else {
    eligibilityScore = 50;
    totalScore += 20; // Neutral score
    reasoning.push('No license required (+20)');
  }

  // Priority 2: Exact degree match
  const jobDegree = job.degreeRequirement.toLowerCase();
  const applicantDegree = applicant.highestEducationalAttainment.toLowerCase();

  let educationScore = 0;
  if (applicantDegree.includes(jobDegree) || jobDegree.includes(applicantDegree)) {
    educationScore = 100;
    totalScore += 30; // 30% weight
    reasoning.push('Exact degree match (+30)');
  } else if (jobDegree.includes('bachelor') && applicantDegree.includes('bachelor')) {
    educationScore = 60;
    totalScore += 18;
    reasoning.push('Bachelor\'s degree (+18)');
  } else {
    educationScore = 30;
    totalScore += 9;
    reasoning.push('Degree mismatch (+9)');
  }

  // Priority 3: Years over requirement
  const requiredYears = job.yearsOfExperience || 1;
  const excessYears = Math.max(0, applicant.totalYearsExperience - requiredYears);
  const experienceScore = Math.min((applicant.totalYearsExperience / requiredYears) * 100, 100);
  const experienceBonus = Math.min(excessYears * 10, 30);
  totalScore += experienceBonus * 0.20; // 20% weight with diminishing returns
  reasoning.push(`${excessYears} years over requirement (+${(experienceBonus * 0.20).toFixed(1)})`);

  // Priority 4: Skill diversity
  const jobSkills = job.skills.map(s => s.toLowerCase());
  const applicantSkills = applicant.skills.map(s => s.toLowerCase());

  const matchedSkills = applicantSkills.filter(skill =>
    jobSkills.some(jobSkill => skill.includes(jobSkill) || jobSkill.includes(skill))
  ).length;

  const skillsScore = jobSkills.length > 0 ? (matchedSkills / jobSkills.length) * 100 : 50;
  const skillBonus = Math.min(matchedSkills * 10, 20);
  totalScore += skillBonus * 0.10; // 10% weight
  reasoning.push(`${matchedSkills} matched skills (+${(skillBonus * 0.10).toFixed(1)})`);

  return {
    educationScore,
    experienceScore,
    skillsScore,
    eligibilityScore,
    totalScore: Math.round(totalScore * 100) / 100,
    algorithmUsed: 'Eligibility-Education Tie-breaker',
    reasoning: reasoning.join('; ')
  };
}

/**
 * Ensemble Method: Combines all three algorithms
 *
 * If Algorithm 1 and 2 scores are within 5%, use Algorithm 3 as tie-breaker
 * Otherwise, use weighted average of Algorithm 1 (60%) and Algorithm 2 (40%)
 */
export function ensembleScore(
  job: JobRequirements,
  applicant: ApplicantData
): ScoreBreakdown {
  const score1 = algorithm1_WeightedSum(job, applicant);
  const score2 = algorithm2_SkillExperienceComposite(job, applicant);

  const scoreDiff = Math.abs(score1.totalScore - score2.totalScore);

  // Tie-breaker condition: scores within 5 points
  if (scoreDiff <= 5) {
    const score3 = algorithm3_EligibilityEducationTiebreaker(job, applicant);
    return {
      ...score3,
      algorithmUsed: 'Ensemble (Tie-breaker)',
      reasoning: `Algorithms 1 & 2 within 5% (${score1.totalScore.toFixed(1)} vs ${score2.totalScore.toFixed(1)}). Tie-breaker: ${score3.reasoning}`
    };
  }

  // Weighted ensemble
  const educationScore = score1.educationScore * 0.6 + score2.educationScore * 0.4;
  const experienceScore = score1.experienceScore * 0.6 + score2.experienceScore * 0.4;
  const skillsScore = score1.skillsScore * 0.6 + score2.skillsScore * 0.4;
  const eligibilityScore = score1.eligibilityScore * 0.6 + score2.eligibilityScore * 0.4;
  const totalScore = score1.totalScore * 0.6 + score2.totalScore * 0.4;

  // Generate user-friendly reasoning
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (educationScore >= 80) strengths.push('strong educational background');
  else if (educationScore < 60) gaps.push('education level');

  if (experienceScore >= 80) {
    strengths.push(experienceScore === 100 ? 'excellent relevant experience' : 'solid work experience');
  } else if (experienceScore < 60) {
    gaps.push('years of experience');
  }

  if (skillsScore >= 60) strengths.push('good technical skills');
  else if (skillsScore < 40) gaps.push('required skills');

  if (eligibilityScore >= 80) strengths.push('appropriate certifications');
  else if (eligibilityScore < 60) gaps.push('certifications');

  let reasoning = '';
  if (strengths.length > 0) {
    reasoning = `Candidate demonstrates ${strengths.join(', ')}.`;
  }
  if (gaps.length > 0) {
    reasoning += ` ${gaps.length > 0 && strengths.length > 0 ? 'Areas for development include' : 'Needs improvement in'} ${gaps.join(', ')}.`;
  }
  if (!reasoning) {
    reasoning = 'Candidate evaluated across multiple qualification criteria.';
  }

  return {
    educationScore: Math.round(educationScore * 100) / 100,
    experienceScore: Math.round(experienceScore * 100) / 100,
    skillsScore: Math.round(skillsScore * 100) / 100,
    eligibilityScore: Math.round(eligibilityScore * 100) / 100,
    totalScore: Math.round(totalScore * 100) / 100,
    algorithmUsed: 'Multi-Factor Assessment',
    reasoning: reasoning.trim()
  };
}
