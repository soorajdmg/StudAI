const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Analyze student compatibility using Gemini AI
 * @param {Object} studentProfile - Current student's profile
 * @param {Array} potentialPartners - Array of potential partner profiles
 * @returns {Array} Compatibility analysis results
 */
const analyzeStudentCompatibility = async (studentProfile, potentialPartners) => {
  console.log('🤖 Starting Gemini AI compatibility analysis...');
  console.log('Student profile:', studentProfile.name, 'vs', potentialPartners.length, 'potential partners');

  try {
    if (!API_KEY) {
      console.log('⚠️ Using fallback matching (no valid API key)');
      return getFallbackMatches(studentProfile, potentialPartners);
    }

    console.log('✅ API Key found, calling Gemini API...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildCompatibilityPrompt(studentProfile, potentialPartners);

    console.log('📝 Generated prompt length:', prompt.length);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('🎯 Gemini response received:', text.substring(0, 200) + '...');
    const parsed = parseCompatibilityResponse(text, studentProfile, potentialPartners);
    console.log('✨ Successfully parsed', parsed.length, 'AI matches');
    return parsed;
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    console.log('🔄 Falling back to intelligent rule-based matching...');
    return getFallbackMatches(studentProfile, potentialPartners);
  }
};

const buildCompatibilityPrompt = (student, partners) => {
  return `
You are an AI assistant specialized in analyzing student compatibility for study partnerships.

STUDENT PROFILE:
Name: ${student.name}
Academic Level: ${student.academicProfile.level}
Subjects: ${student.academicProfile.subjects.join(', ')}
GPA: ${student.academicProfile.gpa}
Learning Style: ${student.academicProfile.learningStyle}
Study Preferences: ${JSON.stringify(student.academicProfile.studyPreferences)}

Behavioral Profile:
- Communication Style: ${student.behavioralProfile.communicationStyle}
- Work Pace: ${student.behavioralProfile.workPace}
- Leadership Tendency: ${student.behavioralProfile.leadershipTendency}
- Stress Management: ${student.behavioralProfile.stressManagement}
- Collaboration Preference: ${student.behavioralProfile.collaborationPreference}

Availability: ${JSON.stringify(student.logisticsProfile.availability)}
Location: ${student.logisticsProfile.location}
Preferred Study Environments: ${student.logisticsProfile.preferredEnvironments.join(', ')}

POTENTIAL PARTNERS:
${partners.map((partner, index) => `
Partner ${index + 1}: ${partner.name}
Academic: Level ${partner.academicProfile.level}, GPA ${partner.academicProfile.gpa}
Subjects: ${partner.academicProfile.subjects.join(', ')}
Learning Style: ${partner.academicProfile.learningStyle}
Communication: ${partner.behavioralProfile.communicationStyle}
Work Pace: ${partner.behavioralProfile.workPace}
Availability: ${JSON.stringify(partner.logisticsProfile.availability)}
Location: ${partner.logisticsProfile.location}
`).join('')}

ANALYSIS REQUIREMENTS:
Analyze compatibility across three dimensions:

1. ACADEMIC COMPATIBILITY (40% weight):
- Subject overlap and complementarity
- Learning style synergy
- Academic level alignment
- Study goal compatibility

2. SOCIAL COMPATIBILITY (35% weight):
- Communication style match
- Work pace alignment
- Leadership dynamic balance
- Collaboration preference fit

3. LOGISTICS COMPATIBILITY (25% weight):
- Schedule overlap
- Location proximity
- Environment preferences
- Meeting frequency feasibility

For each potential partner, provide:
1. Overall compatibility score (0-100)
2. Dimension breakdown scores
3. Key strengths of the partnership
4. Potential challenges
5. Specific study activity recommendations
6. Personalized explanation for why this match works

Format your response as JSON:
{
  "matches": [
    {
      "partnerId": "partner_name",
      "overallScore": 85,
      "dimensionScores": {
        "academic": 90,
        "social": 80,
        "logistics": 85
      },
      "strengths": ["strength1", "strength2"],
      "challenges": ["challenge1", "challenge2"],
      "recommendations": ["rec1", "rec2"],
      "explanation": "Detailed explanation of why this partnership would work well..."
    }
  ]
}

Rank partners by overall compatibility score and provide detailed, personalized insights.
`;
};

const parseCompatibilityResponse = (response, student, partners) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.matches || [];
    }
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
  }

  return getFallbackMatches(student, partners);
};

const getFallbackMatches = (student, partners) => {
  console.log('🧠 Generating intelligent fallback matches using rule-based AI...');

  return partners.map(partner => {
    const academicScore = calculateAcademicCompatibility(student, partner);
    const socialScore = calculateSocialCompatibility(student, partner);
    const logisticsScore = calculateLogisticsCompatibility(student, partner);

    const overallScore = Math.round(
      academicScore * 0.4 + socialScore * 0.35 + logisticsScore * 0.25
    );

    const match = {
      partnerId: partner.name,
      overallScore,
      dimensionScores: {
        academic: academicScore,
        social: socialScore,
        logistics: logisticsScore
      },
      strengths: identifyStrengths(student, partner),
      challenges: identifyChallenges(student, partner),
      recommendations: generateRecommendations(student, partner),
      explanation: generateExplanation(student, partner, overallScore)
    };

    console.log(`📊 ${partner.name}: ${overallScore}% overall (${academicScore}% academic, ${socialScore}% social, ${logisticsScore}% logistics)`);
    return match;
  }).sort((a, b) => b.overallScore - a.overallScore);
};

const calculateAcademicCompatibility = (student, partner) => {
  let score = 0;

  const commonSubjects = student.academicProfile.subjects.filter(
    subject => partner.academicProfile.subjects.includes(subject)
  );
  score += Math.min(commonSubjects.length * 20, 40);

  const gpaDiff = Math.abs(student.academicProfile.gpa - partner.academicProfile.gpa);
  score += Math.max(30 - gpaDiff * 10, 0);

  if (student.academicProfile.learningStyle === partner.academicProfile.learningStyle) {
    score += 20;
  } else if (areComplementaryLearningStyles(student.academicProfile.learningStyle, partner.academicProfile.learningStyle)) {
    score += 15;
  }

  const prefScore = calculatePreferenceAlignment(
    student.academicProfile.studyPreferences,
    partner.academicProfile.studyPreferences
  );
  score += prefScore * 10;

  return Math.min(score, 100);
};

const calculateSocialCompatibility = (student, partner) => {
  let score = 0;

  if (student.behavioralProfile.communicationStyle === partner.behavioralProfile.communicationStyle) {
    score += 25;
  } else if (areComplementaryCommunicationStyles(
    student.behavioralProfile.communicationStyle,
    partner.behavioralProfile.communicationStyle
  )) {
    score += 20;
  }

  if (student.behavioralProfile.workPace === partner.behavioralProfile.workPace) {
    score += 25;
  } else {
    score += 10;
  }

  const leadershipScore = calculateLeadershipDynamic(
    student.behavioralProfile.leadershipTendency,
    partner.behavioralProfile.leadershipTendency
  );
  score += leadershipScore;

  if (student.behavioralProfile.collaborationPreference === partner.behavioralProfile.collaborationPreference) {
    score += 25;
  }

  return Math.min(score, 100);
};

const calculateLogisticsCompatibility = (student, partner) => {
  let score = 0;

  const scheduleOverlap = calculateScheduleOverlap(
    student.logisticsProfile.availability,
    partner.logisticsProfile.availability
  );
  score += scheduleOverlap * 40;

  if (student.logisticsProfile.location === partner.logisticsProfile.location) {
    score += 30;
  } else {
    score += 15;
  }

  const commonEnvironments = student.logisticsProfile.preferredEnvironments.filter(
    env => partner.logisticsProfile.preferredEnvironments.includes(env)
  );
  score += Math.min(commonEnvironments.length * 15, 30);

  return Math.min(score, 100);
};

const areComplementaryLearningStyles = (style1, style2) => {
  const complementaryPairs = [
    ['Visual', 'Kinesthetic'],
    ['Auditory', 'Reading/Writing'],
    ['Sequential', 'Global']
  ];

  return complementaryPairs.some(pair =>
    (pair.includes(style1) && pair.includes(style2)) && style1 !== style2
  );
};

const areComplementaryCommunicationStyles = (style1, style2) => {
  const complementaryPairs = [
    ['Direct', 'Diplomatic'],
    ['Analytical', 'Intuitive'],
    ['Formal', 'Casual']
  ];

  return complementaryPairs.some(pair =>
    (pair.includes(style1) && pair.includes(style2)) && style1 !== style2
  );
};

const calculatePreferenceAlignment = (prefs1, prefs2) => {
  if (!prefs1 || !prefs2) return 0;

  let alignmentScore = 0;
  const totalPrefs = Object.keys(prefs1).length;

  for (const [key, value] of Object.entries(prefs1)) {
    if (prefs2[key] === value) {
      alignmentScore += 1;
    }
  }

  return totalPrefs > 0 ? alignmentScore / totalPrefs : 0;
};

const calculateLeadershipDynamic = (tendency1, tendency2) => {
  if (tendency1 === 'Balanced' || tendency2 === 'Balanced') return 25;
  if (tendency1 === tendency2) return tendency1 === 'High' ? 15 : 20;
  return 25;
};

const calculateScheduleOverlap = (schedule1, schedule2) => {
  if (!schedule1 || !schedule2) return 0;

  let overlapHours = 0;
  for (const day of Object.keys(schedule1)) {
    if (schedule2[day]) {
      const overlap = getTimeOverlap(schedule1[day], schedule2[day]);
      overlapHours += overlap;
    }
  }

  return Math.min(overlapHours / 40, 1);
};

const getTimeOverlap = (timeSlots1, timeSlots2) => {
  if (!Array.isArray(timeSlots1) || !Array.isArray(timeSlots2)) return 0;

  let overlap = 0;
  for (const slot1 of timeSlots1) {
    for (const slot2 of timeSlots2) {
      if (slot1 === slot2) overlap += 1;
    }
  }

  return overlap;
};

const identifyStrengths = (student, partner) => {
  const strengths = [];

  const commonSubjects = student.academicProfile.subjects.filter(
    subject => partner.academicProfile.subjects.includes(subject)
  );

  if (commonSubjects.length > 0) {
    strengths.push(`Shared expertise in ${commonSubjects.join(', ')}`);
  }

  if (student.behavioralProfile.communicationStyle === partner.behavioralProfile.communicationStyle) {
    strengths.push('Compatible communication styles');
  }

  if (student.logisticsProfile.location === partner.logisticsProfile.location) {
    strengths.push('Same location for easy meetups');
  }

  return strengths;
};

const identifyChallenges = (student, partner) => {
  const challenges = [];

  const gpaDiff = Math.abs(student.academicProfile.gpa - partner.academicProfile.gpa);
  if (gpaDiff > 0.5) {
    challenges.push('Different academic performance levels');
  }

  if (student.behavioralProfile.workPace !== partner.behavioralProfile.workPace) {
    challenges.push('Different work paces may require adjustment');
  }

  return challenges;
};

const generateRecommendations = (student, partner) => {
  const recommendations = [];

  const commonSubjects = student.academicProfile.subjects.filter(
    subject => partner.academicProfile.subjects.includes(subject)
  );

  if (commonSubjects.length > 0) {
    recommendations.push(`Focus on collaborative projects in ${commonSubjects[0]}`);
  }

  recommendations.push('Start with short study sessions to build rapport');
  recommendations.push('Establish clear communication preferences early');

  return recommendations;
};

const generateExplanation = (student, partner, score) => {
  if (score >= 85) {
    return `Excellent compatibility! You both share similar academic interests and study approaches, making this an ideal partnership for achieving your learning goals.`;
  } else if (score >= 70) {
    return `Good potential for a successful study partnership. Some differences in approach could actually be beneficial for diverse perspectives.`;
  } else if (score >= 55) {
    return `Moderate compatibility. This partnership could work with clear communication and mutual understanding of different study styles.`;
  } else {
    return `Lower compatibility detected. Consider this partnership for specific projects rather than regular study sessions.`;
  }
};

module.exports = {
  analyzeStudentCompatibility
};