const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  study_group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  session_title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  session_description: {
    type: String,
    maxlength: 1000
  },
  // Session scheduling
  scheduled_start: {
    type: Date,
    required: true
  },
  scheduled_end: {
    type: Date,
    required: true
  },
  actual_start: Date,
  actual_end: Date,
  timezone: {
    type: String,
    default: 'UTC'
  },
  // Session details
  session_type: {
    type: String,
    enum: ['Regular Study', 'Exam Prep', 'Project Work', 'Discussion', 'Peer Review', 'Skill Share'],
    default: 'Regular Study'
  },
  subjects_covered: [String],
  learning_objectives: [String],
  materials_needed: [String],
  // Location and format
  format: {
    type: String,
    enum: ['In-Person', 'Virtual', 'Hybrid'],
    required: true
  },
  location_details: {
    venue_name: String,
    address: String,
    room_number: String,
    virtual_link: String,
    access_instructions: String
  },
  // Participants
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rsvp_status: { type: String, enum: ['Going', 'Maybe', 'Not Going', 'No Response'], default: 'No Response' },
    rsvp_date: Date,
    attended: { type: Boolean, default: false },
    check_in_time: Date,
    check_out_time: Date,
    contribution_rating: { type: Number, min: 1, max: 5 },
    feedback_notes: String
  }],
  // Session content and progress
  agenda: [{
    item: String,
    estimated_duration: Number, // minutes
    responsible_person: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Skipped'], default: 'Pending' },
    actual_duration: Number,
    notes: String
  }],
  session_notes: {
    key_topics_covered: [String],
    important_insights: [String],
    decisions_made: [String],
    action_items: [{
      task: String,
      assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      due_date: Date,
      status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' }
    }],
    resources_shared: [String],
    follow_up_needed: [String]
  },
  // Performance metrics
  session_metrics: {
    attendance_rate: Number, // percentage
    engagement_score: { type: Number, min: 1, max: 10 },
    productivity_rating: { type: Number, min: 1, max: 10 },
    collaboration_quality: { type: Number, min: 1, max: 10 },
    goal_achievement: { type: Number, min: 0, max: 100 }, // percentage
    overall_satisfaction: { type: Number, min: 1, max: 5 }
  },
  // AI analysis
  ai_insights: {
    session_effectiveness: String,
    participation_analysis: String,
    improvement_suggestions: [String],
    highlight_moments: [String],
    next_session_recommendations: [String]
  },
  // Status and metadata
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Postponed'],
    default: 'Scheduled'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cancellation_reason: String,
  rescheduled_from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudySession'
  }
}, {
  timestamps: true
});

// Indexes
studySessionSchema.index({ study_group: 1, scheduled_start: 1 });
studySessionSchema.index({ 'participants.user': 1 });
studySessionSchema.index({ scheduled_start: 1 });
studySessionSchema.index({ status: 1 });
studySessionSchema.index({ created_by: 1 });
studySessionSchema.index({ subjects_covered: 1 });

// Methods
studySessionSchema.methods.addParticipant = function(userId, rsvpStatus = 'No Response') {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    throw new Error('User is already a participant');
  }

  this.participants.push({
    user: userId,
    rsvp_status: rsvpStatus,
    rsvp_date: new Date()
  });

  return this.save();
};

studySessionSchema.methods.updateRSVP = function(userId, status) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not a participant in this session');
  }

  participant.rsvp_status = status;
  participant.rsvp_date = new Date();

  return this.save();
};

studySessionSchema.methods.checkInParticipant = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not a participant in this session');
  }

  participant.attended = true;
  participant.check_in_time = new Date();

  // Start session if not already started
  if (!this.actual_start) {
    this.actual_start = new Date();
    this.status = 'In Progress';
  }

  return this.save();
};

studySessionSchema.methods.checkOutParticipant = function(userId, contributionRating = null, feedback = '') {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not a participant in this session');
  }

  participant.check_out_time = new Date();
  if (contributionRating) {
    participant.contribution_rating = contributionRating;
  }
  if (feedback) {
    participant.feedback_notes = feedback;
  }

  return this.save();
};

studySessionSchema.methods.completeSession = function(sessionMetrics = {}) {
  this.status = 'Completed';
  this.actual_end = new Date();

  // Calculate attendance rate
  const attendedCount = this.participants.filter(p => p.attended).length;
  const totalParticipants = this.participants.length;
  this.session_metrics.attendance_rate = totalParticipants > 0 ? (attendedCount / totalParticipants) * 100 : 0;

  // Update other metrics if provided
  Object.assign(this.session_metrics, sessionMetrics);

  return this.save();
};

studySessionSchema.methods.generateSummary = function() {
  return {
    title: this.session_title,
    duration: this.actual_end && this.actual_start ?
      Math.round((this.actual_end - this.actual_start) / (1000 * 60)) : // minutes
      Math.round((this.scheduled_end - this.scheduled_start) / (1000 * 60)),
    attendance: this.session_metrics.attendance_rate || 0,
    subjects: this.subjects_covered,
    keyInsights: this.session_notes.important_insights || [],
    actionItems: this.session_notes.action_items.filter(item => item.status === 'Pending').length,
    satisfaction: this.session_metrics.overall_satisfaction || 0
  };
};

// Static methods
studySessionSchema.statics.getUpcomingSessions = function(userId, limit = 10) {
  return this.find({
    'participants.user': userId,
    scheduled_start: { $gte: new Date() },
    status: 'Scheduled'
  })
  .sort({ scheduled_start: 1 })
  .limit(limit)
  .populate('study_group', 'name')
  .populate('created_by', 'name email');
};

studySessionSchema.statics.getSessionHistory = function(userId, limit = 20) {
  return this.find({
    'participants.user': userId,
    status: 'Completed'
  })
  .sort({ actual_end: -1 })
  .limit(limit)
  .populate('study_group', 'name');
};

studySessionSchema.statics.getGroupSessions = function(groupId, status = null) {
  const query = { study_group: groupId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ scheduled_start: -1 })
    .populate('created_by', 'name email')
    .populate('participants.user', 'name email');
};

studySessionSchema.statics.getSessionStats = function(groupId = null) {
  const matchStage = groupId ? { study_group: mongoose.Types.ObjectId(groupId) } : {};

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgAttendance: { $avg: '$session_metrics.attendance_rate' },
        avgSatisfaction: { $avg: '$session_metrics.overall_satisfaction' },
        totalStudyHours: {
          $sum: {
            $divide: [
              { $subtract: ['$actual_end', '$actual_start'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('StudySession', studySessionSchema);