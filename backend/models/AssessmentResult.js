const mongoose = require('mongoose');

const assessmentResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessment_type: {
    type: String,
    enum: ['LearningStyle', 'SmartCaliber', 'Subject', 'Compatibility', 'SkillAssessment'],
    required: true
  },
  assessment_session_id: {
    type: String,
    required: true
  },
  // Individual question data
  questions: [{
    question_id: String,
    question_text: String,
    question_type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'behavioral', 'preference']
    },
    user_response: mongoose.Schema.Types.Mixed, // Can be string, number, array, etc.
    correct_answer: mongoose.Schema.Types.Mixed,
    is_correct: Boolean,
    time_taken_seconds: Number,
    answer_changed: { type: Boolean, default: false },
    confidence_level: { type: Number, min: 1, max: 5 }, // User's confidence in their answer
    difficulty_level: { type: Number, min: 1, max: 5 }
  }],
  // Overall session metrics
  session_metrics: {
    total_questions: Number,
    correct_answers: Number,
    final_score: { type: Number, min: 0, max: 100 },
    total_time_seconds: Number,
    average_time_per_question: Number,
    answers_changed_count: Number,
    completion_percentage: { type: Number, default: 100 }
  },
  // Behavioral analysis data
  behavioral_data: {
    mouse_movements: [{
      x: Number,
      y: Number,
      timestamp: Number,
      event_type: String // 'move', 'click', 'scroll'
    }],
    keystroke_patterns: [{
      key: String,
      timestamp: Number,
      duration: Number
    }],
    focus_changes: [{
      timestamp: Number,
      focus_duration: Number,
      element_type: String
    }],
    scroll_behavior: {
      total_scrolls: Number,
      reading_time_distribution: [Number] // Time spent on each section
    },
    hesitation_indicators: {
      long_pauses: Number, // Pauses > 10 seconds
      answer_revisions: Number,
      time_on_difficult_questions: Number
    }
  },
  // AI-derived insights
  ai_analysis: {
    learning_pattern_detected: String,
    confidence_indicators: {
      consistent_performance: Boolean,
      speed_accuracy_balance: String,
      stress_indicators: [String]
    },
    recommendations: [String],
    areas_for_improvement: [String],
    strengths_identified: [String]
  },
  // Subject-specific data (if applicable)
  subject_data: {
    subject_name: String,
    topics_covered: [String],
    mastery_levels: [{
      topic: String,
      mastery_percentage: Number
    }]
  },
  assessment_date: {
    type: Date,
    default: Date.now
  },
  // Metadata
  device_info: {
    user_agent: String,
    screen_resolution: String,
    device_type: String
  },
  environment_factors: {
    time_of_day: String,
    day_of_week: String,
    estimated_noise_level: String,
    self_reported_energy_level: Number
  }
}, {
  timestamps: true
});

// Indexes for performance
assessmentResultSchema.index({ user: 1, assessment_date: -1 });
assessmentResultSchema.index({ assessment_type: 1 });
assessmentResultSchema.index({ assessment_session_id: 1 });
assessmentResultSchema.index({ 'session_metrics.final_score': 1 });
assessmentResultSchema.index({ 'subject_data.subject_name': 1 });

// Methods
assessmentResultSchema.methods.calculateDetailedMetrics = function() {
  const questions = this.questions;
  const totalQuestions = questions.length;

  if (totalQuestions === 0) return;

  // Basic metrics
  const correctAnswers = questions.filter(q => q.is_correct).length;
  const totalTime = questions.reduce((sum, q) => sum + q.time_taken_seconds, 0);
  const answersChanged = questions.filter(q => q.answer_changed).length;

  // Advanced metrics
  const timePerQuestion = questions.map(q => q.time_taken_seconds);
  const averageTime = totalTime / totalQuestions;
  const timeVariance = timePerQuestion.reduce((sum, time) => sum + Math.pow(time - averageTime, 2), 0) / totalQuestions;

  // Update session metrics
  this.session_metrics = {
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
    final_score: Math.round((correctAnswers / totalQuestions) * 100),
    total_time_seconds: totalTime,
    average_time_per_question: Math.round(averageTime),
    answers_changed_count: answersChanged,
    completion_percentage: 100
  };

  // Behavioral analysis
  const longPauses = questions.filter(q => q.time_taken_seconds > 30).length;
  const difficultQuestions = questions.filter(q => q.difficulty_level >= 4);
  const timeOnDifficult = difficultQuestions.reduce((sum, q) => sum + q.time_taken_seconds, 0);

  this.behavioral_data.hesitation_indicators = {
    long_pauses: longPauses,
    answer_revisions: answersChanged,
    time_on_difficult_questions: timeOnDifficult
  };

  return this.save();
};

assessmentResultSchema.methods.generateAIInsights = function() {
  const score = this.session_metrics.final_score;
  const avgTime = this.session_metrics.average_time_per_question;
  const changesCount = this.session_metrics.answers_changed_count;

  let pattern = 'Balanced Learner';
  let recommendations = [];
  let strengths = [];

  // Pattern detection logic
  if (score >= 80 && avgTime <= 15) {
    pattern = 'Quick Learner';
    strengths.push('Fast processing', 'High accuracy');
    recommendations.push('Challenge yourself with more complex problems');
  } else if (score >= 85 && avgTime > 20) {
    pattern = 'Precision Learner';
    strengths.push('Careful analysis', 'Attention to detail');
    recommendations.push('Try time-based challenges to improve speed');
  } else if (changesCount > this.questions.length * 0.3) {
    pattern = 'Resilient Improver';
    strengths.push('Self-correction', 'Persistence');
    recommendations.push('Trust your initial instincts more');
  }

  this.ai_analysis = {
    learning_pattern_detected: pattern,
    confidence_indicators: {
      consistent_performance: Math.abs(score - 75) <= 15,
      speed_accuracy_balance: avgTime <= 20 && score >= 70 ? 'Optimal' : 'Needs Balance',
      stress_indicators: changesCount > 5 ? ['High revision rate'] : []
    },
    recommendations,
    areas_for_improvement: score < 70 ? ['Accuracy improvement needed'] : [],
    strengths_identified: strengths
  };

  return this.save();
};

assessmentResultSchema.statics.getRecentAssessments = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ assessment_date: -1 })
    .limit(limit)
    .populate('user', 'name email');
};

assessmentResultSchema.statics.getPerformanceTrend = function(userId, assessmentType = null) {
  const query = { user: userId };
  if (assessmentType) query.assessment_type = assessmentType;

  return this.find(query)
    .sort({ assessment_date: 1 })
    .select('session_metrics.final_score assessment_date assessment_type');
};

module.exports = mongoose.model('AssessmentResult', assessmentResultSchema);