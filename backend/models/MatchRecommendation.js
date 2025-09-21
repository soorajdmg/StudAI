const mongoose = require('mongoose');

const matchRecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recommended_partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  compatibility_analysis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompatibilityAnalysis',
    required: true
  },
  // Recommendation ranking and scoring
  recommendation_score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  ranking_position: {
    type: Number,
    min: 1,
    required: true
  },
  // Personalized messaging
  personalized_message: {
    headline: String, // e.g., "Perfect Math Study Partner!"
    description: String, // Detailed explanation
    key_benefits: [String], // Why this match is recommended
    success_probability: String, // e.g., "High", "Very High"
  },
  // Specific activity recommendations
  suggested_activities: [{
    activity_name: String,
    activity_type: { type: String, enum: ['Study Session', 'Project Collaboration', 'Exam Prep', 'Skill Exchange', 'Peer Review'] },
    estimated_duration: String,
    difficulty_level: String,
    success_rate: Number,
    preparation_needed: [String]
  }],
  // Match reasoning (AI-generated)
  match_reasoning: {
    primary_factors: [String], // Main reasons for the match
    complementary_strengths: [String], // How they complement each other
    shared_interests: [String], // Common ground
    growth_opportunities: [String], // How they can help each other grow
    potential_outcomes: [String] // Expected positive results
  },
  // User interaction tracking
  user_response: {
    viewed_at: Date,
    response_type: { type: String, enum: ['Interested', 'Not Interested', 'Maybe Later', 'Already Connected'] },
    response_date: Date,
    feedback_notes: String,
    rating: { type: Number, min: 1, max: 5 } // How accurate was this recommendation
  },
  // Connection tracking
  connection_status: {
    status: { type: String, enum: ['Pending', 'Connected', 'Declined', 'Expired'], default: 'Pending' },
    connected_at: Date,
    connection_method: String, // How they connected
    study_sessions_completed: { type: Number, default: 0 },
    partnership_rating: { type: Number, min: 1, max: 5 } // How well the partnership worked
  },
  // Timing and context
  recommendation_context: {
    triggered_by: { type: String, enum: ['New Assessment', 'Profile Update', 'Scheduled Refresh', 'User Request'] },
    user_goals: [String], // What the user was trying to achieve
    urgency_level: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    best_contact_time: String, // When to reach out
    expiry_date: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // 30 days
  },
  // Success prediction
  success_metrics: {
    predicted_satisfaction: { type: Number, min: 0, max: 100 },
    estimated_study_improvement: String, // e.g., "15-25% improvement"
    compatibility_confidence: { type: Number, min: 0, max: 100 },
    risk_factors: [String],
    mitigation_strategies: [String]
  },
  // A/B testing and optimization
  recommendation_variant: {
    algorithm_version: { type: String, default: '1.0' },
    personalization_level: { type: String, enum: ['Basic', 'Standard', 'Advanced'], default: 'Standard' },
    content_variant: String, // For testing different message styles
    presentation_order: Number // For testing ranking algorithms
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Expired', 'Superseded'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Indexes
matchRecommendationSchema.index({ user: 1, ranking_position: 1 });
matchRecommendationSchema.index({ user: 1, recommendation_score: -1 });
matchRecommendationSchema.index({ recommended_partner: 1 });
matchRecommendationSchema.index({ status: 1 });
matchRecommendationSchema.index({ 'user_response.response_type': 1 });
matchRecommendationSchema.index({ 'connection_status.status': 1 });
matchRecommendationSchema.index({ 'recommendation_context.expiry_date': 1 });
matchRecommendationSchema.index({ createdAt: -1 });

// Methods
matchRecommendationSchema.methods.recordUserResponse = function(responseType, notes = '', rating = null) {
  this.user_response = {
    viewed_at: this.user_response.viewed_at || new Date(),
    response_type: responseType,
    response_date: new Date(),
    feedback_notes: notes,
    rating: rating
  };

  // Update connection status based on response
  if (responseType === 'Interested') {
    this.connection_status.status = 'Pending';
  } else if (responseType === 'Not Interested') {
    this.connection_status.status = 'Declined';
  }

  return this.save();
};

matchRecommendationSchema.methods.recordConnection = function(connectionMethod = 'Platform') {
  this.connection_status = {
    status: 'Connected',
    connected_at: new Date(),
    connection_method: connectionMethod,
    study_sessions_completed: 0,
    partnership_rating: null
  };

  return this.save();
};

matchRecommendationSchema.methods.updateStudyProgress = function(sessionsCompleted, partnershipRating = null) {
  this.connection_status.study_sessions_completed = sessionsCompleted;
  if (partnershipRating) {
    this.connection_status.partnership_rating = partnershipRating;
  }

  return this.save();
};

matchRecommendationSchema.methods.isExpired = function() {
  return new Date() > this.recommendation_context.expiry_date;
};

matchRecommendationSchema.methods.generateSummary = function() {
  return {
    partner: this.recommended_partner,
    score: this.recommendation_score,
    headline: this.personalized_message.headline,
    keyBenefits: this.match_reasoning.primary_factors,
    status: this.connection_status.status,
    suggested: this.suggested_activities[0]?.activity_name || 'Study together'
  };
};

// Static methods
matchRecommendationSchema.statics.getActiveRecommendations = function(userId, limit = 10) {
  return this.find({
    user: userId,
    status: 'Active',
    'recommendation_context.expiry_date': { $gt: new Date() }
  })
  .sort({ ranking_position: 1 })
  .limit(limit)
  .populate('recommended_partner', 'name email learningProfile')
  .populate('compatibility_analysis');
};

matchRecommendationSchema.statics.getTopMatches = function(userId, limit = 5) {
  return this.find({
    user: userId,
    status: 'Active',
    recommendation_score: { $gte: 70 }
  })
  .sort({ recommendation_score: -1 })
  .limit(limit)
  .populate('recommended_partner', 'name email learningProfile');
};

matchRecommendationSchema.statics.getRecommendationStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$user_response.response_type',
        count: { $sum: 1 },
        avgRating: { $avg: '$user_response.rating' }
      }
    }
  ]);
};

matchRecommendationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      'recommendation_context.expiry_date': { $lt: new Date() },
      status: 'Active'
    },
    { status: 'Expired' }
  );
};

matchRecommendationSchema.statics.getSuccessMetrics = function() {
  return this.aggregate([
    { $match: { 'connection_status.status': 'Connected' } },
    {
      $group: {
        _id: null,
        totalConnections: { $sum: 1 },
        avgStudySessions: { $avg: '$connection_status.study_sessions_completed' },
        avgPartnershipRating: { $avg: '$connection_status.partnership_rating' },
        avgRecommendationScore: { $avg: '$recommendation_score' }
      }
    }
  ]);
};

module.exports = mongoose.model('MatchRecommendation', matchRecommendationSchema);