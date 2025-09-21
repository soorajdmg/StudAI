const mongoose = require('mongoose');

const compatibilityAnalysisSchema = new mongoose.Schema({
  student_a: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student_b: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Overall compatibility scores
  compatibility_scores: {
    overall_score: { type: Number, min: 0, max: 100, required: true },
    academic_score: { type: Number, min: 0, max: 100, required: true },
    social_score: { type: Number, min: 0, max: 100, required: true },
    logistics_score: { type: Number, min: 0, max: 100, required: true }
  },
  // Detailed analysis breakdown
  academic_analysis: {
    subject_overlap: [{
      subject: String,
      student_a_level: String,
      student_b_level: String,
      compatibility_score: Number
    }],
    learning_style_synergy: {
      student_a_style: String,
      student_b_style: String,
      synergy_type: { type: String, enum: ['Complementary', 'Similar', 'Conflicting'] },
      synergy_score: Number
    },
    pace_alignment: {
      student_a_pace: String,
      student_b_pace: String,
      alignment_score: Number
    },
    goals_alignment: [{
      shared_goal: String,
      importance_level: Number
    }]
  },
  // Social compatibility factors
  social_analysis: {
    communication_styles: {
      student_a_style: String,
      student_b_style: String,
      compatibility_type: String,
      communication_score: Number
    },
    collaboration_preferences: {
      student_a_pref: String,
      student_b_pref: String,
      collaboration_score: Number
    },
    leadership_dynamics: {
      student_a_tendency: String,
      student_b_tendency: String,
      dynamic_balance: String,
      balance_score: Number
    },
    conflict_resolution: {
      compatibility_score: Number,
      resolution_styles: [String]
    }
  },
  // Practical logistics
  logistics_analysis: {
    schedule_overlap: {
      common_time_slots: [{
        day: String,
        time_range: String,
        duration_hours: Number
      }],
      overlap_percentage: Number,
      optimal_meeting_times: [String]
    },
    location_proximity: {
      student_a_location: String,
      student_b_location: String,
      distance_km: Number,
      proximity_score: Number,
      meeting_feasibility: String
    },
    study_environment_preferences: {
      shared_environments: [String],
      environment_compatibility_score: Number
    }
  },
  // AI-generated insights
  ai_analysis: {
    ai_model_used: { type: String, default: 'Gemini-1.5-Flash' },
    confidence_level: { type: Number, min: 0, max: 100 },
    raw_ai_response: String, // Store the full AI response
    key_strengths: [String],
    potential_challenges: [String],
    success_indicators: [String],
    risk_factors: [String]
  },
  // Recommendations
  recommendations: {
    study_arrangements: [{
      activity_type: String,
      recommended_frequency: String,
      optimal_duration: String,
      environment_suggestion: String,
      success_tips: [String]
    }],
    communication_strategies: [String],
    goal_setting_suggestions: [String],
    progress_tracking_methods: [String]
  },
  // Prediction metrics
  success_prediction: {
    predicted_success_rate: { type: Number, min: 0, max: 100 },
    confidence_interval: {
      lower_bound: Number,
      upper_bound: Number
    },
    key_success_factors: [String],
    monitoring_metrics: [String]
  },
  // Meta information
  analysis_metadata: {
    analysis_version: { type: String, default: '1.0' },
    data_completeness_score: Number, // How much data was available for analysis
    analysis_method: { type: String, enum: ['AI', 'Rule-based', 'Hybrid'], default: 'Hybrid' },
    processing_time_ms: Number,
    last_updated: { type: Date, default: Date.now }
  },
  analysis_date: {
    type: Date,
    default: Date.now
  },
  // Status tracking
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Outdated', 'Disputed'],
    default: 'Active'
  },
  expires_at: {
    type: Date,
    default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
  }
}, {
  timestamps: true
});

// Compound indexes
compatibilityAnalysisSchema.index({ student_a: 1, student_b: 1 }, { unique: true });
compatibilityAnalysisSchema.index({ student_a: 1 });
compatibilityAnalysisSchema.index({ student_b: 1 });
compatibilityAnalysisSchema.index({ 'compatibility_scores.overall_score': -1 });
compatibilityAnalysisSchema.index({ analysis_date: -1 });
compatibilityAnalysisSchema.index({ status: 1 });
compatibilityAnalysisSchema.index({ expires_at: 1 });

// Methods
compatibilityAnalysisSchema.methods.updateFromAI = function(aiResponse, confidenceLevel) {
  this.ai_analysis.confidence_level = confidenceLevel;
  this.ai_analysis.raw_ai_response = JSON.stringify(aiResponse);

  if (aiResponse.strengths) this.ai_analysis.key_strengths = aiResponse.strengths;
  if (aiResponse.challenges) this.ai_analysis.potential_challenges = aiResponse.challenges;
  if (aiResponse.recommendations) {
    this.recommendations.study_arrangements = aiResponse.recommendations.map(rec => ({
      activity_type: rec.type || 'General Study',
      recommended_frequency: rec.frequency || 'Weekly',
      optimal_duration: rec.duration || '2 hours',
      environment_suggestion: rec.environment || 'Library',
      success_tips: rec.tips || []
    }));
  }

  this.analysis_metadata.last_updated = new Date();
  return this.save();
};

compatibilityAnalysisSchema.methods.calculateOverallScore = function() {
  const { academic_score, social_score, logistics_score } = this.compatibility_scores;

  // Weighted average: Academic 40%, Social 35%, Logistics 25%
  const overall = Math.round(
    academic_score * 0.4 +
    social_score * 0.35 +
    logistics_score * 0.25
  );

  this.compatibility_scores.overall_score = overall;
  return this.save();
};

compatibilityAnalysisSchema.methods.isExpired = function() {
  return new Date() > this.expires_at;
};

compatibilityAnalysisSchema.methods.refresh = function() {
  this.expires_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  this.analysis_metadata.last_updated = new Date();
  return this.save();
};

// Static methods
compatibilityAnalysisSchema.statics.findByStudent = function(studentId, limit = 10) {
  return this.find({
    $or: [
      { student_a: studentId },
      { student_b: studentId }
    ],
    status: 'Active'
  })
  .sort({ 'compatibility_scores.overall_score': -1 })
  .limit(limit)
  .populate('student_a student_b', 'name email');
};

compatibilityAnalysisSchema.statics.findTopMatches = function(studentId, minScore = 70, limit = 5) {
  return this.find({
    $or: [
      { student_a: studentId },
      { student_b: studentId }
    ],
    'compatibility_scores.overall_score': { $gte: minScore },
    status: 'Active'
  })
  .sort({ 'compatibility_scores.overall_score': -1 })
  .limit(limit)
  .populate('student_a student_b', 'name email learningProfile');
};

compatibilityAnalysisSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    { expires_at: { $lt: new Date() } },
    { status: 'Outdated' }
  );
};

module.exports = mongoose.model('CompatibilityAnalysis', compatibilityAnalysisSchema);