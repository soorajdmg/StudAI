export const createStudentProfile = (baseData) => {
  return {
    id: baseData.id || generateStudentId(),
    name: baseData.name,

    academicProfile: {
      level: baseData.academicLevel || 'Undergraduate',
      subjects: baseData.subjects || [],
      gpa: baseData.gpa || 3.0,
      learningStyle: baseData.learningStyle || 'Visual',
      studyPreferences: {
        groupSize: baseData.studyPreferences?.groupSize || 'Small Group (2-4)',
        timePreference: baseData.studyPreferences?.timePreference || 'Afternoon',
        sessionLength: baseData.studyPreferences?.sessionLength || '2 hours',
        studyIntensity: baseData.studyPreferences?.studyIntensity || 'Moderate',
        breakFrequency: baseData.studyPreferences?.breakFrequency || '30 minutes',
        resourcePreference: baseData.studyPreferences?.resourcePreference || 'Digital'
      },
      goals: baseData.academicGoals || [],
      strengths: baseData.academicStrengths || [],
      challenges: baseData.academicChallenges || []
    },

    behavioralProfile: {
      communicationStyle: baseData.communicationStyle || 'Direct',
      workPace: baseData.workPace || 'Steady',
      leadershipTendency: baseData.leadershipTendency || 'Balanced',
      stressManagement: baseData.stressManagement || 'Moderate',
      collaborationPreference: baseData.collaborationPreference || 'Collaborative',
      conflictResolution: baseData.conflictResolution || 'Discussion',
      motivationStyle: baseData.motivationStyle || 'Internal',
      adaptability: baseData.adaptability || 'Flexible'
    },

    logisticsProfile: {
      location: baseData.location || 'Online',
      availability: baseData.availability || getDefaultAvailability(),
      preferredEnvironments: baseData.preferredEnvironments || ['Library', 'Online'],
      transportationMode: baseData.transportationMode || 'Walking',
      timeZone: baseData.timeZone || 'UTC',
      maxTravelDistance: baseData.maxTravelDistance || 5,
      studyBudget: baseData.studyBudget || 'Free resources'
    },

    personalityInsights: {
      mbtiType: baseData.mbtiType || null,
      learningMotivation: baseData.learningMotivation || 'Achievement',
      socialComfort: baseData.socialComfort || 'Moderate',
      riskTolerance: baseData.riskTolerance || 'Moderate',
      planningStyle: baseData.planningStyle || 'Structured',
      feedbackPreference: baseData.feedbackPreference || 'Constructive'
    },

    performanceMetrics: {
      studyHoursPerWeek: baseData.studyHoursPerWeek || 20,
      averageSessionRating: baseData.averageSessionRating || null,
      partnershipHistory: baseData.partnershipHistory || [],
      preferredPartnerCount: baseData.preferredPartnerCount || 1,
      successRate: baseData.successRate || null,
      improvementAreas: baseData.improvementAreas || []
    },

    preferences: {
      matchCriteria: {
        academicWeight: 0.4,
        socialWeight: 0.35,
        logisticsWeight: 0.25
      },
      dealBreakers: baseData.dealBreakers || [],
      mustHaves: baseData.mustHaves || [],
      niceToHaves: baseData.niceToHaves || []
    },

    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    isActive: true
  };
};

const generateStudentId = () => {
  return 'student_' + Math.random().toString(36).substr(2, 9);
};

const getDefaultAvailability = () => {
  return {
    monday: ['9:00-12:00', '14:00-17:00'],
    tuesday: ['9:00-12:00', '14:00-17:00'],
    wednesday: ['9:00-12:00', '14:00-17:00'],
    thursday: ['9:00-12:00', '14:00-17:00'],
    friday: ['9:00-12:00', '14:00-17:00'],
    saturday: ['10:00-16:00'],
    sunday: ['10:00-16:00']
  };
};

export const sampleStudentProfiles = [
  createStudentProfile({
    id: 'student_1',
    name: 'Emma Chen',
    academicLevel: 'Undergraduate',
    subjects: ['Computer Science', 'Mathematics', 'Data Structures'],
    gpa: 3.8,
    learningStyle: 'Visual',
    studyPreferences: {
      groupSize: 'Pair (2)',
      timePreference: 'Morning',
      sessionLength: '3 hours',
      studyIntensity: 'High',
      breakFrequency: '45 minutes',
      resourcePreference: 'Digital'
    },
    communicationStyle: 'Direct',
    workPace: 'Fast',
    leadershipTendency: 'High',
    stressManagement: 'Good',
    collaborationPreference: 'Collaborative',
    location: 'San Francisco, CA',
    preferredEnvironments: ['Library', 'Coffee Shop', 'Online'],
    availability: {
      monday: ['8:00-11:00', '13:00-16:00'],
      tuesday: ['8:00-11:00', '13:00-16:00'],
      wednesday: ['8:00-11:00', '13:00-16:00'],
      thursday: ['8:00-11:00', '13:00-16:00'],
      friday: ['8:00-11:00'],
      saturday: ['9:00-15:00'],
      sunday: ['10:00-14:00']
    },
    academicGoals: ['Ace Data Structures exam', 'Build portfolio projects'],
    studyHoursPerWeek: 35
  }),

  createStudentProfile({
    id: 'student_2',
    name: 'Marcus Johnson',
    academicLevel: 'Graduate',
    subjects: ['Computer Science', 'Machine Learning', 'Algorithms'],
    gpa: 3.6,
    learningStyle: 'Kinesthetic',
    studyPreferences: {
      groupSize: 'Small Group (3-4)',
      timePreference: 'Evening',
      sessionLength: '2 hours',
      studyIntensity: 'Moderate',
      breakFrequency: '30 minutes',
      resourcePreference: 'Mixed'
    },
    communicationStyle: 'Analytical',
    workPace: 'Steady',
    leadershipTendency: 'Balanced',
    stressManagement: 'Moderate',
    collaborationPreference: 'Collaborative',
    location: 'San Francisco, CA',
    preferredEnvironments: ['Study Room', 'Online', 'Home'],
    availability: {
      monday: ['18:00-21:00'],
      tuesday: ['18:00-21:00'],
      wednesday: ['18:00-21:00'],
      thursday: ['18:00-21:00'],
      friday: ['15:00-18:00'],
      saturday: ['10:00-16:00'],
      sunday: ['10:00-16:00']
    },
    academicGoals: ['Master ML algorithms', 'Complete thesis research'],
    studyHoursPerWeek: 25
  }),

  createStudentProfile({
    id: 'student_3',
    name: 'Sofia Rodriguez',
    academicLevel: 'Undergraduate',
    subjects: ['Psychology', 'Statistics', 'Research Methods'],
    gpa: 3.9,
    learningStyle: 'Auditory',
    studyPreferences: {
      groupSize: 'Pair (2)',
      timePreference: 'Afternoon',
      sessionLength: '2.5 hours',
      studyIntensity: 'High',
      breakFrequency: '20 minutes',
      resourcePreference: 'Physical'
    },
    communicationStyle: 'Diplomatic',
    workPace: 'Fast',
    leadershipTendency: 'Moderate',
    stressManagement: 'Good',
    collaborationPreference: 'Discussion-focused',
    location: 'Berkeley, CA',
    preferredEnvironments: ['Library', 'Study Room', 'Quiet Cafe'],
    availability: {
      monday: ['12:00-17:00'],
      tuesday: ['12:00-17:00'],
      wednesday: ['12:00-17:00'],
      thursday: ['12:00-17:00'],
      friday: ['12:00-17:00'],
      saturday: ['9:00-13:00'],
      sunday: ['14:00-18:00']
    },
    academicGoals: ['Excel in statistics', 'Design research study'],
    studyHoursPerWeek: 30
  }),

  createStudentProfile({
    id: 'student_4',
    name: 'David Kim',
    academicLevel: 'Undergraduate',
    subjects: ['Computer Science', 'Web Development', 'Database Systems'],
    gpa: 3.4,
    learningStyle: 'Visual',
    studyPreferences: {
      groupSize: 'Small Group (3-4)',
      timePreference: 'Evening',
      sessionLength: '2 hours',
      studyIntensity: 'Moderate',
      breakFrequency: '25 minutes',
      resourcePreference: 'Digital'
    },
    communicationStyle: 'Casual',
    workPace: 'Moderate',
    leadershipTendency: 'Low',
    stressManagement: 'Moderate',
    collaborationPreference: 'Collaborative',
    location: 'San Francisco, CA',
    preferredEnvironments: ['Online', 'Home', 'Coworking Space'],
    availability: {
      monday: ['19:00-22:00'],
      tuesday: ['19:00-22:00'],
      wednesday: ['19:00-22:00'],
      thursday: ['19:00-22:00'],
      friday: ['19:00-22:00'],
      saturday: ['14:00-20:00'],
      sunday: ['14:00-20:00']
    },
    academicGoals: ['Build full-stack app', 'Improve coding skills'],
    studyHoursPerWeek: 18
  }),

  createStudentProfile({
    id: 'student_5',
    name: 'Aisha Patel',
    academicLevel: 'Graduate',
    subjects: ['Business Administration', 'Finance', 'Strategy'],
    gpa: 3.7,
    learningStyle: 'Reading/Writing',
    studyPreferences: {
      groupSize: 'Pair (2)',
      timePreference: 'Morning',
      sessionLength: '3 hours',
      studyIntensity: 'High',
      breakFrequency: '40 minutes',
      resourcePreference: 'Physical'
    },
    communicationStyle: 'Formal',
    workPace: 'Fast',
    leadershipTendency: 'High',
    stressManagement: 'Good',
    collaborationPreference: 'Structured',
    location: 'Palo Alto, CA',
    preferredEnvironments: ['Library', 'Business Center', 'Study Room'],
    availability: {
      monday: ['7:00-10:00', '14:00-17:00'],
      tuesday: ['7:00-10:00', '14:00-17:00'],
      wednesday: ['7:00-10:00', '14:00-17:00'],
      thursday: ['7:00-10:00', '14:00-17:00'],
      friday: ['7:00-10:00'],
      saturday: ['8:00-12:00'],
      sunday: ['9:00-13:00']
    },
    academicGoals: ['Master case studies', 'Network with professionals'],
    studyHoursPerWeek: 28
  }),

  createStudentProfile({
    id: 'student_6',
    name: 'Alex Thompson',
    academicLevel: 'Undergraduate',
    subjects: ['Physics', 'Mathematics', 'Engineering'],
    gpa: 3.5,
    learningStyle: 'Kinesthetic',
    studyPreferences: {
      groupSize: 'Small Group (3-4)',
      timePreference: 'Afternoon',
      sessionLength: '2.5 hours',
      studyIntensity: 'Moderate',
      breakFrequency: '35 minutes',
      resourcePreference: 'Mixed'
    },
    communicationStyle: 'Analytical',
    workPace: 'Steady',
    leadershipTendency: 'Moderate',
    stressManagement: 'Moderate',
    collaborationPreference: 'Problem-solving focused',
    location: 'Stanford, CA',
    preferredEnvironments: ['Lab', 'Study Room', 'Outdoor Study'],
    availability: {
      monday: ['13:00-18:00'],
      tuesday: ['13:00-18:00'],
      wednesday: ['13:00-18:00'],
      thursday: ['13:00-18:00'],
      friday: ['13:00-18:00'],
      saturday: ['10:00-15:00'],
      sunday: ['11:00-16:00']
    },
    academicGoals: ['Understand quantum mechanics', 'Build engineering project'],
    studyHoursPerWeek: 22
  })
];

export const getCompatiblePartners = (currentStudent, allStudents, maxResults = 5) => {
  return allStudents
    .filter(student => student.id !== currentStudent.id)
    .slice(0, maxResults);
};

export const getStudentById = (studentId) => {
  return sampleStudentProfiles.find(student => student.id === studentId);
};

export const filterStudentsBySubject = (subject, students = sampleStudentProfiles) => {
  return students.filter(student =>
    student.academicProfile.subjects.some(sub =>
      sub.toLowerCase().includes(subject.toLowerCase())
    )
  );
};

export const filterStudentsByLocation = (location, students = sampleStudentProfiles) => {
  return students.filter(student =>
    student.logisticsProfile.location.toLowerCase().includes(location.toLowerCase())
  );
};

export const filterStudentsByLearningStyle = (learningStyle, students = sampleStudentProfiles) => {
  return students.filter(student =>
    student.academicProfile.learningStyle === learningStyle
  );
};

export const getUserStudentProfile = (userProfile) => {
  const profile = userProfile?.learningProfile || userProfile?.assessmentData;

  if (!profile) {
    return createStudentProfile({
      name: userProfile?.name || 'Current User',
      subjects: ['Computer Science'],
      learningStyle: 'Visual',
      location: 'San Francisco, CA'
    });
  }

  const learningStyleMapping = {
    'Quick Learner': 'Visual',
    'Precision Learner': 'Reading/Writing',
    'Balanced Learner': 'Visual',
    'Methodical Builder': 'Kinesthetic',
    'Resilient Improver': 'Auditory',
    'Pattern Master': 'Visual'
  };

  const workPaceMapping = {
    'Quick Learner': 'Fast',
    'Precision Learner': 'Careful',
    'Balanced Learner': 'Steady',
    'Methodical Builder': 'Steady',
    'Resilient Improver': 'Moderate',
    'Pattern Master': 'Fast'
  };

  return createStudentProfile({
    name: userProfile.name || 'Current User',
    subjects: profile.subjects || ['Computer Science'],
    gpa: profile.gpa || 3.5,
    learningStyle: learningStyleMapping[profile.learningType] || 'Visual',
    workPace: workPaceMapping[profile.learningType] || 'Steady',
    studyHoursPerWeek: profile.studyHours || 20,
    location: 'San Francisco, CA',
    academicGoals: profile.goals || ['Improve academic performance'],
    communicationStyle: profile.behavioralData?.confidence > 7 ? 'Direct' : 'Diplomatic'
  });
};