const mongoose = require('mongoose');
const User = require('../models/User');
const LearningProfile = require('../models/LearningProfile');
const SubjectProfile = require('../models/SubjectProfile');
const AssessmentResult = require('../models/AssessmentResult');
const CompatibilityAnalysis = require('../models/CompatibilityAnalysis');
const MatchRecommendation = require('../models/MatchRecommendation');
const StudyGroup = require('../models/StudyGroup');
const StudySession = require('../models/StudySession');
const PartnershipFeedback = require('../models/PartnershipFeedback');

/**
 * Initialize all database schemas and indexes
 * Run this script to set up the complete database structure
 */
async function initializeSchemas() {
  try {
    console.log('🚀 Initializing StudAI database schemas...');

    // Create indexes for all models
    console.log('📊 Creating indexes...');

    await Promise.all([
      User.createIndexes(),
      LearningProfile.createIndexes(),
      SubjectProfile.createIndexes(),
      AssessmentResult.createIndexes(),
      CompatibilityAnalysis.createIndexes(),
      MatchRecommendation.createIndexes(),
      StudyGroup.createIndexes(),
      StudySession.createIndexes(),
      PartnershipFeedback.createIndexes()
    ]);

    console.log('✅ All indexes created successfully');

    // Create any required collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const requiredCollections = [
      'users', 'learningprofiles', 'subjectprofiles', 'assessmentresults',
      'compatibilityanalyses', 'matchrecommendations', 'studygroups',
      'studysessions', 'partnershipfeedbacks'
    ];

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await mongoose.connection.db.createCollection(collectionName);
        console.log(`📁 Created collection: ${collectionName}`);
      }
    }

    console.log('🎉 Database schema initialization complete!');

  } catch (error) {
    console.error('❌ Error initializing schemas:', error);
    throw error;
  }
}

/**
 * Migration script to add default learning profiles for existing users
 */
async function migrateExistingUsers() {
  try {
    console.log('🔄 Migrating existing users...');

    const users = await User.find({});
    console.log(`Found ${users.length} existing users`);

    for (const user of users) {
      // Check if learning profile already exists
      const existingProfile = await LearningProfile.findOne({ user: user._id });

      if (!existingProfile) {
        // Create default learning profile based on existing data
        const learningProfile = new LearningProfile({
          user: user._id,
          learning_style: mapLearningProfile(user.learningProfile),
          learning_pace: 'Steady',
          problem_solving_approach: 'Analytical',
          stress_response: 'Medium',
          caliber_type: 'Balanced Learner',
          confidence_level: 6,
          behavioral_patterns: {
            focus_duration: 30,
            error_recovery_speed: 'Medium',
            collaboration_preference: 'Small Group',
            feedback_preference: 'Immediate'
          },
          performance_metrics: {
            average_accuracy: 0,
            average_response_time: 0,
            consistency_score: 0,
            improvement_rate: 0
          }
        });

        await learningProfile.save();
        console.log(`✅ Created learning profile for user: ${user.name}`);

        // Create default Computer Science subject profile
        const subjectProfile = new SubjectProfile({
          user: user._id,
          subject_name: 'Computer Science',
          proficiency_level: 'Intermediate',
          is_strength: false,
          confidence_score: 6,
          performance_data: {
            assessment_scores: [],
            time_spent_studying: 0,
            concepts_mastered: [],
            difficulty_areas: []
          },
          study_preferences: {
            preferred_methods: ['Practice Problems', 'Visual'],
            optimal_session_length: 120,
            best_time_of_day: 'Afternoon'
          },
          learning_goals: [{
            goal: 'Improve programming skills',
            target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            progress: 0,
            is_achieved: false
          }]
        });

        await subjectProfile.save();
        console.log(`✅ Created subject profile for user: ${user.name}`);
      }
    }

    console.log('🎉 User migration complete!');

  } catch (error) {
    console.error('❌ Error migrating users:', error);
    throw error;
  }
}

/**
 * Map old learning profile format to new format
 */
function mapLearningProfile(oldProfile) {
  if (!oldProfile) return 'Visual';

  const mapping = {
    'visual': 'Visual',
    'auditory': 'Auditory',
    'kinesthetic': 'Kinesthetic',
    'mixed': 'Visual'
  };

  return mapping[oldProfile.toLowerCase()] || 'Visual';
}

/**
 * Create sample data for development/testing
 */
async function createSampleData() {
  try {
    console.log('🌱 Creating sample data...');

    // Create sample study group
    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('⚠️ No admin user found, skipping sample data creation');
      return;
    }

    const existingGroup = await StudyGroup.findOne({ creator: adminUser._id });
    if (!existingGroup) {
      const sampleGroup = new StudyGroup({
        name: 'Advanced JavaScript Study Group',
        description: 'A group focused on mastering advanced JavaScript concepts and modern frameworks',
        creator: adminUser._id,
        group_settings: {
          max_members: 6,
          is_public: true,
          requires_approval: false,
          skill_level: 'Advanced',
          study_intensity: 'Regular'
        },
        academic_focus: {
          primary_subjects: ['Computer Science', 'Web Development'],
          learning_objectives: ['Master ES6+ features', 'Learn React hooks', 'Understand async programming'],
          target_goals: ['Build a full-stack application', 'Contribute to open source'],
          preferred_study_methods: ['Project-based learning', 'Code reviews', 'Pair programming']
        },
        members: [{
          user: adminUser._id,
          role: 'Creator',
          permissions: {
            can_schedule: true,
            can_invite: true,
            can_moderate: true
          }
        }],
        tags: ['JavaScript', 'React', 'Advanced', 'Programming'],
        category: 'Academic'
      });

      await sampleGroup.save();
      console.log('✅ Created sample study group');
    }

    console.log('🎉 Sample data creation complete!');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  }
}

/**
 * Clean up expired/outdated data
 */
async function cleanupData() {
  try {
    console.log('🧹 Cleaning up expired data...');

    // Clean up expired compatibility analyses
    await CompatibilityAnalysis.cleanupExpired();

    // Clean up expired match recommendations
    await MatchRecommendation.cleanupExpired();

    // Update group statuses based on activity
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - 30); // 30 days ago

    await StudyGroup.updateMany(
      {
        'members.last_active': { $lt: inactiveDate },
        status: 'Active'
      },
      { status: 'Inactive' }
    );

    console.log('✅ Data cleanup complete');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Export functions for individual use
module.exports = {
  initializeSchemas,
  migrateExistingUsers,
  createSampleData,
  cleanupData,
  mapLearningProfile
};

// Run all migrations if called directly
if (require.main === module) {
  const runMigrations = async () => {
    try {
      // Connect to MongoDB if not already connected
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studai');
      }

      await initializeSchemas();
      await migrateExistingUsers();
      await createSampleData();
      await cleanupData();

      console.log('🎉 All migrations completed successfully!');
      process.exit(0);

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  };

  runMigrations();
}