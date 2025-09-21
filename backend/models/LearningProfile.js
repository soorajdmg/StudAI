const mongoose = require('mongoose');

const learningProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  learning_style: {
    type: String,
    enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing', 'Mixed'],
    required: true
  },
  learning_pace: {
    type: String,
    enum: ['Fast', 'Methodical', 'Steady', 'Variable'],
    required: true
  },
  problem_solving_approach: {
    type: String,
    enum: ['Sequential', 'Intuitive', 'Analytical', 'Creative', 'Systematic'],
    required: true
  },
  stress_response: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  caliber_type: {
    type: String,
    enum: ['Quick Learner', 'Precision Learner', 'Balanced Learner', 'Methodical Builder', 'Resilient Improver', 'Pattern Master'],
    required: true
  },
  confidence_level: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  // Additional AI analysis fields
  behavioral_patterns: {
    focus_duration: { type: Number, default: 30 }, // minutes
    error_recovery_speed: { type: String, enum: ['Fast', 'Medium', 'Slow'], default: 'Medium' },
    collaboration_preference: { type: String, enum: ['Independent', 'Small Group', 'Large Group', 'Pair'], default: 'Small Group' },
    feedback_preference: { type: String, enum: ['Immediate', 'Delayed', 'Detailed', 'Summary'], default: 'Immediate' }
  },
  // Performance metrics from assessments
  performance_metrics: {
    average_accuracy: { type: Number, default: 0 },
    average_response_time: { type: Number, default: 0 },
    consistency_score: { type: Number, default: 0 },
    improvement_rate: { type: Number, default: 0 }
  },
  // AI confidence in this profile
  ai_confidence_score: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  last_assessment_date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
learningProfileSchema.index({ user: 1 });
learningProfileSchema.index({ caliber_type: 1 });
learningProfileSchema.index({ learning_style: 1 });
learningProfileSchema.index({ confidence_level: 1 });

// Methods
learningProfileSchema.methods.updateMetrics = function(assessmentData) {
  const metrics = this.performance_metrics;
  metrics.average_accuracy = assessmentData.accuracy;
  metrics.average_response_time = assessmentData.responseTime;
  metrics.consistency_score = assessmentData.consistency;

  this.last_assessment_date = new Date();
  return this.save();
};

learningProfileSchema.methods.getCompatibilityFactors = function() {
  return {
    learningStyle: this.learning_style,
    pace: this.learning_pace,
    approach: this.problem_solving_approach,
    collaboration: this.behavioral_patterns.collaboration_preference,
    confidence: this.confidence_level
  };
};

module.exports = mongoose.model('LearningProfile', learningProfileSchema);