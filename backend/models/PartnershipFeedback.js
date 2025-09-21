const mongoose = require('mongoose');

const partnershipFeedbackSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  study_session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudySession',
    required: false // Can be general partnership feedback or session-specific
  },
  partnership_duration: {
    start_date: Date,
    end_date: Date,
    total_sessions: { type: Number, default: 1 },
    total_hours: { type: Number, default: 0 }
  },
  // Detailed ratings
  ratings: {
    overall_satisfaction: { type: Number, min: 1, max: 5, required: true },
    communication_quality: { type: Number, min: 1, max: 5, required: true },
    reliability: { type: Number, min: 1, max: 5, required: true },
    helpfulness: { type: Number, min: 1, max: 5, required: true },
    knowledge_sharing: { type: Number, min: 1, max: 5, required: true },
    motivation_impact: { type: Number, min: 1, max: 5, required: true },
    time_management: { type: Number, min: 1, max: 5, required: true },
    goal_achievement: { type: Number, min: 1, max: 5, required: true }
  },
  // Specific feedback areas
  strengths: [{
    category: { type: String, enum: ['Communication', 'Teaching', 'Motivation', 'Organization', 'Knowledge', 'Patience', 'Creativity'] },
    description: String,
    specific_examples: [String]
  }],
  improvements: [{
    category: { type: String, enum: ['Communication', 'Punctuality', 'Preparation', 'Focus', 'Participation', 'Flexibility'] },
    description: String,
    suggestions: [String],
    severity: { type: String, enum: ['Minor', 'Moderate', 'Major'], default: 'Minor' }
  }],
  // Detailed written feedback
  written_feedback: {
    what_worked_well: String,
    what_could_improve: String,
    memorable_moments: String,
    impact_on_learning: String,
    would_recommend: { type: Boolean, required: true },
    would_study_again: { type: Boolean, required: true }
  },
  // Study effectiveness
  learning_outcomes: {
    concepts_learned: [String],
    skills_improved: [String],
    confidence_gained: [String],
    goals_achieved: [String],
    academic_improvement: {
      subject: String,
      before_score: Number,
      after_score: Number,
      improvement_percentage: Number
    }
  },
  // Partnership dynamics
  collaboration_analysis: {
    leadership_balance: { type: String, enum: ['Well-balanced', 'One-sided', 'Unclear'], default: 'Well-balanced' },
    participation_equality: { type: String, enum: ['Equal', 'Unequal', 'Variable'], default: 'Equal' },
    conflict_resolution: { type: String, enum: ['Excellent', 'Good', 'Poor', 'N/A'], default: 'N/A' },
    study_style_compatibility: { type: Number, min: 1, max: 5 },
    pace_alignment: { type: Number, min: 1, max: 5 }
  },
  // Future recommendations
  future_collaboration: {
    likelihood: { type: String, enum: ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely'] },
    recommended_subjects: [String],
    recommended_session_types: [String],
    optimal_session_length: String,
    suggested_improvements: [String]
  },
  // Verification and authenticity
  verification: {
    is_verified: { type: Boolean, default: false },
    verification_method: String,
    verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verification_date: Date,
    authenticity_score: { type: Number, min: 0, max: 100, default: 50 }
  },
  // AI analysis of feedback
  ai_analysis: {
    sentiment_score: { type: Number, min: -1, max: 1 }, // -1 negative, 0 neutral, 1 positive
    key_themes: [String],
    credibility_assessment: { type: Number, min: 0, max: 100 },
    improvement_priorities: [String],
    partnership_success_indicators: [String],
    red_flags: [String]
  },
  // Metadata
  feedback_type: {
    type: String,
    enum: ['Session Feedback', 'Partnership Review', 'Final Assessment', 'Incident Report'],
    default: 'Session Feedback'
  },
  privacy_level: {
    type: String,
    enum: ['Public', 'Anonymous', 'Private'],
    default: 'Anonymous'
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Published', 'Disputed'],
    default: 'Submitted'
  },
  submission_context: {
    triggered_by: String, // What prompted this feedback
    submission_device: String,
    completion_time_seconds: Number
  }
}, {
  timestamps: true
});

// Compound indexes
partnershipFeedbackSchema.index({ reviewer: 1, partner: 1, createdAt: -1 });
partnershipFeedbackSchema.index({ partner: 1, status: 1 });
partnershipFeedbackSchema.index({ study_session: 1 });
partnershipFeedbackSchema.index({ 'ratings.overall_satisfaction': -1 });
partnershipFeedbackSchema.index({ feedback_type: 1 });
partnershipFeedbackSchema.index({ privacy_level: 1 });

// Methods
partnershipFeedbackSchema.methods.calculateOverallScore = function() {
  const ratings = this.ratings;
  const weights = {
    overall_satisfaction: 0.25,
    communication_quality: 0.15,
    reliability: 0.15,
    helpfulness: 0.15,
    knowledge_sharing: 0.1,
    motivation_impact: 0.1,
    time_management: 0.05,
    goal_achievement: 0.05
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [criterion, weight] of Object.entries(weights)) {
    if (ratings[criterion] !== undefined) {
      weightedSum += ratings[criterion] * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 20) / 4 : 0; // Convert to 5-point scale
};

partnershipFeedbackSchema.methods.generateSummary = function() {
  const overallScore = this.calculateOverallScore();
  const isPositive = overallScore >= 3.5;
  const hasImprovements = this.improvements && this.improvements.length > 0;

  return {
    overallScore,
    sentiment: isPositive ? 'Positive' : 'Neutral/Negative',
    topStrengths: this.strengths.slice(0, 3).map(s => s.category),
    mainImprovements: this.improvements.slice(0, 2).map(i => i.category),
    wouldRecommend: this.written_feedback.would_recommend,
    keyInsight: this.written_feedback.what_worked_well || 'No specific insight provided'
  };
};

partnershipFeedbackSchema.methods.analyzeWithAI = function() {
  // This would integrate with an AI service to analyze text feedback
  const positiveWords = ['excellent', 'great', 'helpful', 'patient', 'knowledgeable', 'clear'];
  const negativeWords = ['poor', 'unclear', 'unhelpful', 'late', 'unprepared', 'difficult'];

  const feedbackText = [
    this.written_feedback.what_worked_well,
    this.written_feedback.what_could_improve,
    this.written_feedback.impact_on_learning
  ].join(' ').toLowerCase();

  let sentimentScore = 0;
  const words = feedbackText.split(/\s+/);

  words.forEach(word => {
    if (positiveWords.includes(word)) sentimentScore += 0.1;
    if (negativeWords.includes(word)) sentimentScore -= 0.1;
  });

  // Clamp between -1 and 1
  sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

  // Extract key themes (simplified)
  const themes = [];
  if (feedbackText.includes('communication')) themes.push('Communication');
  if (feedbackText.includes('time') || feedbackText.includes('punctual')) themes.push('Time Management');
  if (feedbackText.includes('help') || feedbackText.includes('support')) themes.push('Helpfulness');
  if (feedbackText.includes('knowledge') || feedbackText.includes('expert')) themes.push('Knowledge Sharing');

  this.ai_analysis = {
    sentiment_score: sentimentScore,
    key_themes: themes,
    credibility_assessment: 85, // Would be calculated based on various factors
    improvement_priorities: this.improvements.map(i => i.category),
    partnership_success_indicators: this.strengths.map(s => s.category)
  };

  return this.save();
};

// Static methods
partnershipFeedbackSchema.statics.getPartnerRating = function(partnerId) {
  return this.aggregate([
    { $match: { partner: mongoose.Types.ObjectId(partnerId), status: 'Published' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$ratings.overall_satisfaction' },
        totalReviews: { $sum: 1 },
        recommendationRate: {
          $avg: { $cond: ['$written_feedback.would_recommend', 1, 0] }
        }
      }
    }
  ]);
};

partnershipFeedbackSchema.statics.getDetailedPartnerAnalysis = function(partnerId) {
  return this.aggregate([
    { $match: { partner: mongoose.Types.ObjectId(partnerId), status: 'Published' } },
    {
      $group: {
        _id: null,
        averageRatings: {
          communication: { $avg: '$ratings.communication_quality' },
          reliability: { $avg: '$ratings.reliability' },
          helpfulness: { $avg: '$ratings.helpfulness' },
          knowledge: { $avg: '$ratings.knowledge_sharing' }
        },
        commonStrengths: { $push: '$strengths.category' },
        commonImprovements: { $push: '$improvements.category' },
        totalHours: { $sum: '$partnership_duration.total_hours' },
        totalSessions: { $sum: '$partnership_duration.total_sessions' }
      }
    }
  ]);
};

partnershipFeedbackSchema.statics.getFeedbackTrends = function(partnerId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);

  return this.find({
    partner: partnerId,
    createdAt: { $gte: startDate },
    status: 'Published'
  })
  .sort({ createdAt: 1 })
  .select('ratings.overall_satisfaction createdAt written_feedback.would_recommend');
};

partnershipFeedbackSchema.statics.getTopPerformers = function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'Published' } },
    {
      $group: {
        _id: '$partner',
        averageRating: { $avg: '$ratings.overall_satisfaction' },
        reviewCount: { $sum: 1 },
        recommendationRate: {
          $avg: { $cond: ['$written_feedback.would_recommend', 1, 0] }
        }
      }
    },
    { $match: { reviewCount: { $gte: 3 } } }, // Minimum 3 reviews
    { $sort: { averageRating: -1, recommendationRate: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('PartnershipFeedback', partnershipFeedbackSchema);