const mongoose = require('mongoose');

const subjectProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject_name: {
    type: String,
    required: true,
    enum: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
      'English', 'History', 'Geography', 'Economics', 'Psychology',
      'Engineering', 'Medicine', 'Business', 'Law', 'Arts', 'Music',
      'Philosophy', 'Political Science', 'Sociology', 'Statistics',
      'Data Science', 'Machine Learning', 'Web Development', 'Mobile Development'
    ]
  },
  proficiency_level: {
    type: String,
    enum: ['Expert', 'Advanced', 'Intermediate', 'Beginner', 'Struggling'],
    required: true
  },
  is_strength: {
    type: Boolean,
    default: false
  },
  confidence_score: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  // Detailed performance metrics
  performance_data: {
    assessment_scores: [{
      score: Number,
      date: { type: Date, default: Date.now },
      assessment_type: String
    }],
    time_spent_studying: { type: Number, default: 0 }, // hours
    concepts_mastered: [String],
    difficulty_areas: [String]
  },
  // Study preferences for this subject
  study_preferences: {
    preferred_methods: [{
      type: String,
      enum: ['Visual', 'Practice Problems', 'Discussion', 'Reading', 'Video', 'Hands-on', 'Group Study']
    }],
    optimal_session_length: { type: Number, default: 60 }, // minutes
    best_time_of_day: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Night'],
      default: 'Afternoon'
    }
  },
  // Goals and aspirations
  learning_goals: [{
    goal: String,
    target_date: Date,
    progress: { type: Number, default: 0 }, // percentage
    is_achieved: { type: Boolean, default: false }
  }],
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for user and subject
subjectProfileSchema.index({ user: 1, subject_name: 1 }, { unique: true });
subjectProfileSchema.index({ subject_name: 1 });
subjectProfileSchema.index({ proficiency_level: 1 });
subjectProfileSchema.index({ is_strength: 1 });
subjectProfileSchema.index({ confidence_score: 1 });

// Methods
subjectProfileSchema.methods.addAssessmentScore = function(score, assessmentType = 'general') {
  this.performance_data.assessment_scores.push({
    score,
    assessment_type: assessmentType,
    date: new Date()
  });

  // Update proficiency level based on recent scores
  const recentScores = this.performance_data.assessment_scores
    .slice(-5) // Last 5 assessments
    .map(s => s.score);

  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  if (avgScore >= 90) this.proficiency_level = 'Expert';
  else if (avgScore >= 80) this.proficiency_level = 'Advanced';
  else if (avgScore >= 70) this.proficiency_level = 'Intermediate';
  else if (avgScore >= 60) this.proficiency_level = 'Beginner';
  else this.proficiency_level = 'Struggling';

  this.is_strength = avgScore >= 80;
  this.last_updated = new Date();

  return this.save();
};

subjectProfileSchema.methods.updateStudyTime = function(minutes) {
  this.performance_data.time_spent_studying += minutes / 60; // Convert to hours
  this.last_updated = new Date();
  return this.save();
};

subjectProfileSchema.methods.addMasteredConcept = function(concept) {
  if (!this.performance_data.concepts_mastered.includes(concept)) {
    this.performance_data.concepts_mastered.push(concept);
    this.last_updated = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

subjectProfileSchema.methods.getCompatibilityData = function() {
  return {
    subject: this.subject_name,
    level: this.proficiency_level,
    isStrength: this.is_strength,
    confidence: this.confidence_score,
    preferredMethods: this.study_preferences.preferred_methods
  };
};

module.exports = mongoose.model('SubjectProfile', subjectProfileSchema);