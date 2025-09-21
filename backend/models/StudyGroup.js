const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Group configuration
  group_settings: {
    max_members: { type: Number, default: 8, min: 2, max: 20 },
    is_public: { type: Boolean, default: true },
    requires_approval: { type: Boolean, default: false },
    skill_level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Mixed'], default: 'Mixed' },
    study_intensity: { type: String, enum: ['Casual', 'Regular', 'Intensive'], default: 'Regular' }
  },
  // Academic focus
  academic_focus: {
    primary_subjects: [String],
    learning_objectives: [String],
    target_goals: [String],
    preferred_study_methods: [String],
    difficulty_level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' }
  },
  // Members and roles
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['Creator', 'Moderator', 'Member'], default: 'Member' },
    joined_at: { type: Date, default: Date.now },
    contribution_score: { type: Number, default: 0 },
    attendance_rate: { type: Number, default: 100 },
    last_active: { type: Date, default: Date.now },
    permissions: {
      can_schedule: { type: Boolean, default: false },
      can_invite: { type: Boolean, default: false },
      can_moderate: { type: Boolean, default: false }
    }
  }],
  // Schedule and meeting info
  schedule: {
    regular_meetings: [{
      day_of_week: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      start_time: String, // "14:00"
      duration_minutes: { type: Number, default: 120 },
      timezone: { type: String, default: 'UTC' },
      location: String, // Physical or virtual
      is_recurring: { type: Boolean, default: true }
    }],
    flexible_scheduling: {
      allows_ad_hoc: { type: Boolean, default: true },
      minimum_notice_hours: { type: Number, default: 24 },
      preferred_times: [String]
    }
  },
  // Group performance and analytics
  group_analytics: {
    total_study_hours: { type: Number, default: 0 },
    sessions_completed: { type: Number, default: 0 },
    average_attendance: { type: Number, default: 0 },
    productivity_score: { type: Number, default: 0 },
    collaboration_rating: { type: Number, default: 0 },
    goal_completion_rate: { type: Number, default: 0 }
  },
  // AI-generated insights
  ai_insights: {
    group_compatibility_score: { type: Number, min: 0, max: 100 },
    strength_areas: [String],
    improvement_suggestions: [String],
    optimal_group_size: Number,
    recommended_activities: [String],
    success_prediction: String,
    last_analysis_date: Date
  },
  // Group status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Paused', 'Archived', 'Full'],
    default: 'Active'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private', 'Invite-Only'],
    default: 'Public'
  },
  // Tags and categorization
  tags: [String],
  category: {
    type: String,
    enum: ['Academic', 'Certification', 'Skills', 'Career', 'Personal Development'],
    default: 'Academic'
  }
}, {
  timestamps: true
});

// Indexes
studyGroupSchema.index({ creator: 1 });
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ status: 1, visibility: 1 });
studyGroupSchema.index({ 'academic_focus.primary_subjects': 1 });
studyGroupSchema.index({ tags: 1 });
studyGroupSchema.index({ 'group_settings.skill_level': 1 });
studyGroupSchema.index({ createdAt: -1 });

// Methods
studyGroupSchema.methods.addMember = function(userId, role = 'Member') {
  // Check if user is already a member
  const existingMember = this.members.find(m => m.user.toString() === userId.toString());
  if (existingMember) {
    throw new Error('User is already a member of this group');
  }

  // Check if group is full
  if (this.members.length >= this.group_settings.max_members) {
    throw new Error('Group is full');
  }

  this.members.push({
    user: userId,
    role: role,
    joined_at: new Date(),
    contribution_score: 0,
    attendance_rate: 100,
    last_active: new Date()
  });

  // Update status if group becomes full
  if (this.members.length >= this.group_settings.max_members) {
    this.status = 'Full';
  }

  return this.save();
};

studyGroupSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());

  // Update status if group is no longer full
  if (this.status === 'Full' && this.members.length < this.group_settings.max_members) {
    this.status = 'Active';
  }

  return this.save();
};

studyGroupSchema.methods.updateMemberActivity = function(userId, activityData) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  if (!member) {
    throw new Error('User is not a member of this group');
  }

  member.last_active = new Date();
  if (activityData.contributionScore) {
    member.contribution_score += activityData.contributionScore;
  }
  if (activityData.attendanceRate !== undefined) {
    member.attendance_rate = activityData.attendanceRate;
  }

  return this.save();
};

studyGroupSchema.methods.calculateGroupCompatibility = function() {
  // This would integrate with CompatibilityAnalysis to calculate overall group harmony
  if (this.members.length < 2) return 0;

  // Simplified calculation - in practice, this would use actual compatibility analyses
  const compatibilitySum = this.members.reduce((sum, member) => {
    return sum + (member.contribution_score || 50); // Default neutral score
  }, 0);

  const avgCompatibility = compatibilitySum / this.members.length;
  this.ai_insights.group_compatibility_score = Math.min(avgCompatibility, 100);

  return this.save();
};

studyGroupSchema.methods.updateAnalytics = function(sessionData) {
  this.group_analytics.total_study_hours += sessionData.duration_hours || 0;
  this.group_analytics.sessions_completed += 1;

  if (sessionData.attendance) {
    const attendanceRate = (sessionData.attendance / this.members.length) * 100;
    this.group_analytics.average_attendance =
      (this.group_analytics.average_attendance + attendanceRate) / 2;
  }

  if (sessionData.productivity_score) {
    this.group_analytics.productivity_score = sessionData.productivity_score;
  }

  return this.save();
};

// Static methods
studyGroupSchema.statics.findBySubject = function(subject, limit = 10) {
  return this.find({
    'academic_focus.primary_subjects': subject,
    status: 'Active',
    visibility: { $in: ['Public', 'Invite-Only'] }
  })
  .sort({ 'group_analytics.collaboration_rating': -1 })
  .limit(limit)
  .populate('creator', 'name email')
  .populate('members.user', 'name email learningProfile');
};

studyGroupSchema.statics.findRecommendedGroups = function(userId, userSubjects, limit = 5) {
  return this.find({
    'members.user': { $ne: userId }, // Not already a member
    'academic_focus.primary_subjects': { $in: userSubjects },
    status: 'Active',
    $expr: { $lt: [{ $size: '$members' }, '$group_settings.max_members'] } // Not full
  })
  .sort({ 'ai_insights.group_compatibility_score': -1 })
  .limit(limit)
  .populate('creator', 'name email');
};

studyGroupSchema.statics.getUserGroups = function(userId) {
  return this.find({
    'members.user': userId,
    status: { $in: ['Active', 'Paused'] }
  })
  .sort({ 'members.last_active': -1 })
  .populate('creator', 'name email')
  .populate('members.user', 'name email learningProfile');
};

studyGroupSchema.statics.getGroupStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgMembers: { $avg: { $size: '$members' } },
        avgStudyHours: { $avg: '$group_analytics.total_study_hours' }
      }
    }
  ]);
};

module.exports = mongoose.model('StudyGroup', studyGroupSchema);