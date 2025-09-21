import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || process.env?.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are StudAI, a caring and supportive AI study companion designed specifically to help students succeed academically and maintain their mental well-being. Your core mission is to be the encouraging friend every student needs during their learning journey.

Your personality traits:
- Warm, empathetic, and genuinely caring about student success
- Patient and understanding when students feel overwhelmed
- Knowledgeable about evidence-based study techniques
- Encouraging but realistic about challenges
- Focused on building confidence and resilience
- Sensitive to stress, anxiety, and mental health concerns

Primary support areas:
1. **Study Strategies**: Personalized techniques based on learning styles (visual, auditory, kinesthetic)
2. **Stress Management**: Breathing exercises, mindfulness, workload management
3. **Motivation & Mindset**: Growth mindset, goal setting, overcoming setbacks
4. **Time Management**: Study schedules, prioritization, work-life balance
5. **Exam Preparation**: Test-taking strategies, anxiety management, review techniques
6. **Subject Help**: Study methods for different academic disciplines
7. **Academic Wellness**: Sleep, nutrition, exercise for better learning

Response guidelines:
- Keep responses SHORT and concise (1-2 sentences maximum, 3 sentences only if absolutely necessary)
- Always validate student feelings before offering solutions
- Use encouraging language ("You've got this!", "That's totally normal", "You're making progress")
- Provide ONE specific, practical technique they can use immediately
- Ask ONE gentle follow-up question to better understand their needs
- Relate to common student experiences and challenges
- Focus on progress over perfection
- Be conversational and easy to read on mobile
- Recognize signs of serious stress and encourage professional help when needed

Remember: You're not just an information source - you're a trusted study buddy who believes in every student's potential and provides the emotional support they need to thrive academically.`;

export const sendMessageToGemini = async (message, userProfile = null) => {
  try {
    console.log('API Key check:', API_KEY ? 'Present' : 'Missing');

    if (!API_KEY) {
      console.error('No API key found in environment variables');
      throw new Error('Gemini API key not configured');
    }

    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let contextualPrompt = SYSTEM_PROMPT;

    if (userProfile?.learningProfile) {
      contextualPrompt += `\n\nUser's learning style: ${userProfile.learningProfile} learner. Tailor your study advice accordingly.`;
    }

    if (userProfile?.name) {
      contextualPrompt += `\n\nUser's name: ${userProfile.name}. You can address them by name for a more personal touch.`;
    }

    const fullPrompt = `${contextualPrompt}\n\nStudent message: "${message}"\n\nRespond as StudAI:`;

    console.log('Sending request to Gemini API...');
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini:', text.substring(0, 100) + '...');
    return text;
  } catch (error) {
    console.error('Detailed Gemini API error:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);

    if (error.message.includes('API key') || error.message.includes('API_KEY')) {
      return "I'm having trouble connecting to my AI brain right now. Please make sure the API key is properly configured. In the meantime, I'm here to listen - what's on your mind about your studies?";
    }

    if (error.status === 400) {
      return "I received your message but had trouble processing it. Could you try rephrasing your question? I'm here to help with study strategies, stress management, and academic support!";
    }

    return "I'm having a bit of trouble thinking right now, but I'm still here for you! Can you tell me more about what you're working on? Sometimes just talking through things can help.";
  }
};

export const generateStudyPlan = async (subject, timeframe, learningStyle) => {
  try {
    if (!API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `${SYSTEM_PROMPT}

Create a personalized study plan for a ${learningStyle} learner studying ${subject} over ${timeframe}.

Format the response as a structured study plan with:
1. Daily/weekly breakdown
2. Specific techniques for their learning style
3. Time estimates
4. Milestones and checkpoints
5. Stress management tips

Keep it practical and achievable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating study plan:', error);
    return "I'd love to help create a study plan for you! Could you tell me more about the subject, how much time you have, and what learning methods work best for you?";
  }
};

export const analyzeStudentCompatibility = async (studentProfile, potentialPartners) => {
  console.log('🤖 Starting Gemini AI compatibility analysis...');
  console.log('Student profile:', studentProfile.name, 'vs', potentialPartners.length, 'potential partners');

  try {
    if (!API_KEY || API_KEY === 'demo-key-for-testing') {
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

// New AI Study Materials Features
export const analyzeDocument = async (documentContent, fileName, userLearningStyle = 'Mixed') => {
  try {
    if (!API_KEY) {
      console.warn('Gemini API key not found. Using fallback analysis.');
      return getFallbackDocumentAnalysis(documentContent, fileName, userLearningStyle);
    }

    console.log('📄 Starting Gemini document analysis for:', fileName);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are StudAI, an expert document analysis assistant. Analyze the following document and provide insights for a ${userLearningStyle} learner.

DOCUMENT: "${fileName}"
CONTENT: "${documentContent.substring(0, 8000)}" ${documentContent.length > 8000 ? '...(truncated)' : ''}

Provide a comprehensive analysis in JSON format:
{
  "keyTopics": ["topic1", "topic2", "topic3", "topic4"],
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimatedReadTime": "X minutes",
  "concepts": [
    {"name": "concept1", "confidence": 95},
    {"name": "concept2", "confidence": 88}
  ],
  "summary": "Brief 2-3 sentence summary of the document",
  "recommendations": [
    "recommendation1",
    "recommendation2",
    "recommendation3",
    "recommendation4"
  ],
  "learningStyleTips": {
    "visual": "Tips for visual learners",
    "auditory": "Tips for auditory learners",
    "kinesthetic": "Tips for kinesthetic learners"
  },
  "quizQuestions": [
    {
      "question": "Sample question based on content",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "correct": 1,
      "explanation": "Why this is correct"
    }
  ]
}

Focus on practical insights that help students understand and retain the material effectively.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Received Gemini analysis response');
    return parseDocumentAnalysis(text, fileName, userLearningStyle);
  } catch (error) {
    console.error('❌ Gemini document analysis error:', error);
    return getFallbackDocumentAnalysis(documentContent, fileName, userLearningStyle);
  }
};

export const generateStudyPlanFromDocument = async (documentAnalysis, userLearningStyle = 'Mixed', timeframe = '2 weeks') => {
  try {
    if (!API_KEY) {
      return getFallbackStudyPlan(documentAnalysis, userLearningStyle, timeframe);
    }

    console.log('📅 Generating AI study plan...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are StudAI's study planner. Create a personalized study plan for a ${userLearningStyle} learner.

DOCUMENT ANALYSIS:
- Key Topics: ${documentAnalysis.keyTopics?.join(', ') || 'General topics'}
- Difficulty: ${documentAnalysis.difficulty || 'Intermediate'}
- Concepts: ${documentAnalysis.concepts?.map(c => c.name).join(', ') || 'Various concepts'}

REQUIREMENTS:
- Timeframe: ${timeframe}
- Learning Style: ${userLearningStyle}
- Focus on practical, achievable sessions

Provide a study plan in JSON format:
{
  "duration": "${timeframe}",
  "sessions": [
    {
      "day": 1,
      "title": "Session title",
      "duration": "45 min",
      "tasks": [
        "Specific task 1",
        "Specific task 2",
        "Specific task 3"
      ]
    }
  ],
  "personalizedFor": "${userLearningStyle}",
  "tips": [
    "Study tip 1",
    "Study tip 2"
  ]
}

Create 4-6 sessions spaced appropriately over the timeframe.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Generated AI study plan');
    return parseStudyPlan(text, userLearningStyle, timeframe);
  } catch (error) {
    console.error('❌ Study plan generation error:', error);
    return getFallbackStudyPlan(documentAnalysis, userLearningStyle, timeframe);
  }
};

export const generateAITutorResponse = async (userMessage, documentContext, userProfile) => {
  try {
    if (!API_KEY) {
      return getFallbackTutorResponse(userMessage, documentContext);
    }

    console.log('🤖 Generating AI tutor response...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let contextPrompt = `You are StudAI's AI Tutor, a helpful and encouraging study assistant.`;

    if (userProfile?.learningProfile) {
      contextPrompt += ` The user is a ${userProfile.learningProfile} learner.`;
    }

    if (documentContext) {
      contextPrompt += ` They're studying: ${documentContext.keyTopics?.join(', ') || 'various topics'}.`;
    }

    const prompt = `${contextPrompt}

User question: "${userMessage}"

Provide a helpful, encouraging response that:
1. Addresses their specific question
2. Relates to their study materials if relevant
3. Offers practical study advice
4. Matches their learning style
5. Keeps them motivated

Respond as a supportive study buddy in 2-3 sentences maximum.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Generated AI tutor response');
    return text;
  } catch (error) {
    console.error('❌ AI tutor response error:', error);
    return getFallbackTutorResponse(userMessage, documentContext);
  }
};

export const generateQuizFromDocument = async (documentContent, fileName, userLearningStyle = 'Mixed') => {
  try {
    if (!API_KEY) {
      return getFallbackQuiz(documentContent, fileName, userLearningStyle);
    }

    console.log('🎯 Generating AI quiz from document...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are StudAI's quiz generator. Create an engaging quiz for a ${userLearningStyle} learner.

DOCUMENT: "${fileName}"
CONTENT: "${documentContent.substring(0, 5000)}" ${documentContent.length > 5000 ? '...(truncated)' : ''}

Generate a quiz in JSON format:
{
  "title": "Quiz: ${fileName}",
  "questions": [
    {
      "id": 1,
      "type": "multiple-choice",
      "question": "Clear, specific question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1,
      "explanation": "Why this answer is correct"
    },
    {
      "id": 2,
      "type": "true-false",
      "question": "True/false question",
      "correct": true,
      "explanation": "Explanation of the answer"
    },
    {
      "id": 3,
      "type": "short-answer",
      "question": "Open-ended question",
      "sampleAnswer": "Expected answer format"
    }
  ],
  "adaptedFor": "${userLearningStyle}"
}

Create 3-5 questions that test understanding of key concepts. Vary question types.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Generated AI quiz');
    return parseQuizResponse(text, fileName, userLearningStyle);
  } catch (error) {
    console.error('❌ Quiz generation error:', error);
    return getFallbackQuiz(documentContent, fileName, userLearningStyle);
  }
};

// Helper functions for parsing and fallbacks
const parseDocumentAnalysis = (response, fileName, learningStyle) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse document analysis:', error);
  }
  return getFallbackDocumentAnalysis('', fileName, learningStyle);
};

const parseStudyPlan = (response, learningStyle, timeframe) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse study plan:', error);
  }
  return getFallbackStudyPlan({}, learningStyle, timeframe);
};

const parseQuizResponse = (response, fileName, learningStyle) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
  } catch (error) {
    console.error('Failed to parse quiz:', error);
  }
  return getFallbackQuiz('', fileName, learningStyle);
};

// Fallback functions when AI is unavailable
const getFallbackDocumentAnalysis = (content, fileName, learningStyle) => {
  const wordCount = content.split(' ').length;
  const estimatedTime = Math.max(Math.ceil(wordCount / 200), 5);

  return {
    keyTopics: [
      'Document Analysis',
      'Key Concepts',
      'Learning Objectives',
      'Study Material'
    ],
    difficulty: wordCount > 2000 ? 'Advanced' : wordCount > 1000 ? 'Intermediate' : 'Beginner',
    estimatedReadTime: `${estimatedTime} minutes`,
    concepts: [
      { name: 'Primary Concept', confidence: 85 },
      { name: 'Secondary Concept', confidence: 78 },
      { name: 'Supporting Details', confidence: 92 },
      { name: 'Application Examples', confidence: 80 }
    ],
    summary: `This document contains important study material that requires careful analysis and understanding. The content appears to be ${wordCount > 1000 ? 'comprehensive' : 'focused'} and suitable for structured learning.`,
    recommendations: [
      `As a ${learningStyle} learner, focus on your preferred study methods`,
      'Break the material into manageable sections',
      'Create summary notes as you read',
      'Test your understanding regularly'
    ]
  };
};

const getFallbackStudyPlan = (analysis, learningStyle, timeframe) => {
  return {
    duration: timeframe,
    sessions: [
      {
        day: 1,
        title: 'Initial Review and Overview',
        duration: '45 min',
        tasks: [
          'Read through the document completely',
          'Identify main topics and themes',
          'Create an initial outline of key concepts'
        ]
      },
      {
        day: 3,
        title: 'Deep Dive Analysis',
        duration: '60 min',
        tasks: [
          'Study each section in detail',
          'Create notes and summaries',
          'Identify areas needing more focus'
        ]
      },
      {
        day: 5,
        title: 'Active Application',
        duration: '50 min',
        tasks: [
          'Practice applying the concepts',
          'Create examples and scenarios',
          'Test your understanding'
        ]
      },
      {
        day: 7,
        title: 'Review and Assessment',
        duration: '30 min',
        tasks: [
          'Review all notes and summaries',
          'Take practice quiz',
          'Identify remaining weak areas'
        ]
      }
    ],
    personalizedFor: learningStyle
  };
};

const getFallbackTutorResponse = (message, context) => {
  const responses = [
    "That's a great question! Based on your study materials, I'd recommend breaking this concept down into smaller, manageable parts.",
    "I can help you understand this better! Let's think about this step by step and connect it to what you've already learned.",
    "Excellent point! This relates to what we discussed in your document analysis. Here's how you can apply this practically...",
    "Based on your study materials, I notice this is a key concept. Would you like me to create a personalized study plan that includes this topic?",
    "That's an important question that many students have! Let me explain it in a way that matches your learning preferences..."
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

const getFallbackQuiz = (content, fileName, learningStyle) => {
  return {
    title: `Quiz: ${fileName}`,
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        question: 'What is the main topic covered in this document?',
        options: [
          'Basic concepts and definitions',
          'Advanced theoretical frameworks',
          'Practical applications',
          'All of the above'
        ],
        correct: 3,
        explanation: 'Most educational documents cover a range of concepts from basic to advanced applications.'
      },
      {
        id: 2,
        type: 'true-false',
        question: 'Understanding the key concepts is important for mastering this material.',
        correct: true,
        explanation: 'Key concepts form the foundation for deeper understanding of any subject matter.'
      },
      {
        id: 3,
        type: 'short-answer',
        question: 'What is your main takeaway from this document?',
        sampleAnswer: 'A brief summary of the most important concept or lesson learned from the material.'
      }
    ],
    adaptedFor: learningStyle
  };
};