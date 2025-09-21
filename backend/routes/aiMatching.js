const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const LearningProfile = require('../models/LearningProfile');
const SubjectProfile = require('../models/SubjectProfile');
const CompatibilityAnalysis = require('../models/CompatibilityAnalysis');
const MatchRecommendation = require('../models/MatchRecommendation');
const { analyzeStudentCompatibility } = require('../services/geminiService');

/**
 * @route   GET /api/matching/profile
 * @desc    Get user's complete learning profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const learningProfile = await LearningProfile.findOne({ user: req.user.id });
    const subjectProfiles = await SubjectProfile.find({ user: req.user.id });

    res.json({
      learningProfile,
      subjectProfiles
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/matching/analyze-compatibility
 * @desc    Analyze compatibility between current user and potential partners
 * @access  Private
 */
router.post('/analyze-compatibility', auth, async (req, res) => {
  try {
    const { partnerIds } = req.body;

    if (!partnerIds || !Array.isArray(partnerIds)) {
      return res.status(400).json({ error: 'Partner IDs array is required' });
    }

    const currentUser = await User.findById(req.user.id);
    const currentProfile = await LearningProfile.findOne({ user: req.user.id });
    const currentSubjects = await SubjectProfile.find({ user: req.user.id });

    if (!currentProfile) {
      return res.status(400).json({ error: 'User learning profile not found' });
    }

    const partners = await User.find({ _id: { $in: partnerIds } });
    const partnerProfiles = await LearningProfile.find({ user: { $in: partnerIds } });
    const partnerSubjects = await SubjectProfile.find({ user: { $in: partnerIds } });

    // Format data for AI analysis
    const studentProfile = {
      name: currentUser.name,
      academicProfile: {
        level: 'Undergraduate', // Could be dynamic
        subjects: currentSubjects.map(s => s.subject_name),
        gpa: 3.5, // Could be calculated from assessments
        learningStyle: currentProfile.learning_style,
        studyPreferences: {
          groupSize: currentProfile.behavioral_patterns.collaboration_preference,
          timePreference: 'Afternoon',
          sessionLength: '2 hours'
        }
      },
      behavioralProfile: {
        communicationStyle: 'Direct',
        workPace: currentProfile.learning_pace,
        leadershipTendency: 'Balanced',
        stressManagement: currentProfile.stress_response,
        collaborationPreference: currentProfile.behavioral_patterns.collaboration_preference
      },
      logisticsProfile: {
        location: 'Online',
        availability: {
          monday: ['14:00-17:00'],
          tuesday: ['14:00-17:00'],
          wednesday: ['14:00-17:00'],
          thursday: ['14:00-17:00'],
          friday: ['14:00-17:00']
        },
        preferredEnvironments: ['Library', 'Online']
      }
    };

    // Format potential partners
    const potentialPartners = partners.map(partner => {
      const profile = partnerProfiles.find(p => p.user.toString() === partner._id.toString());
      const subjects = partnerSubjects.filter(s => s.user.toString() === partner._id.toString());

      return {
        name: partner.name,
        academicProfile: {
          level: 'Undergraduate',
          subjects: subjects.map(s => s.subject_name),
          gpa: 3.5,
          learningStyle: profile?.learning_style || 'Visual',
          studyPreferences: {
            groupSize: profile?.behavioral_patterns?.collaboration_preference || 'Small Group',
            timePreference: 'Afternoon',
            sessionLength: '2 hours'
          }
        },
        behavioralProfile: {
          communicationStyle: 'Direct',
          workPace: profile?.learning_pace || 'Steady',
          leadershipTendency: 'Balanced',
          stressManagement: profile?.stress_response || 'Medium',
          collaborationPreference: profile?.behavioral_patterns?.collaboration_preference || 'Small Group'
        },
        logisticsProfile: {
          location: 'Online',
          availability: {
            monday: ['14:00-17:00'],
            tuesday: ['14:00-17:00'],
            wednesday: ['14:00-17:00'],
            thursday: ['14:00-17:00'],
            friday: ['14:00-17:00']
          },
          preferredEnvironments: ['Library', 'Online']
        }
      };
    });

    // Call AI analysis
    const aiAnalysis = await analyzeStudentCompatibility(studentProfile, potentialPartners);

    // Store results in database
    const compatibilityResults = [];
    for (let i = 0; i < partners.length; i++) {
      const partner = partners[i];
      const analysis = aiAnalysis[i];

      if (analysis) {
        // Check if analysis already exists
        let compatibility = await CompatibilityAnalysis.findOne({
          student_a: req.user.id,
          student_b: partner._id
        });

        if (!compatibility) {
          compatibility = new CompatibilityAnalysis({
            student_a: req.user.id,
            student_b: partner._id,
            compatibility_scores: {
              overall_score: analysis.overallScore || 75,
              academic_score: analysis.dimensionScores?.academic || 75,
              social_score: analysis.dimensionScores?.social || 75,
              logistics_score: analysis.dimensionScores?.logistics || 75
            },
            ai_analysis: {
              confidence_level: 85,
              key_strengths: analysis.strengths || [],
              potential_challenges: analysis.challenges || [],
              raw_ai_response: JSON.stringify(analysis)
            }
          });
        } else {
          // Update existing analysis
          compatibility.compatibility_scores = {
            overall_score: analysis.overallScore || 75,
            academic_score: analysis.dimensionScores?.academic || 75,
            social_score: analysis.dimensionScores?.social || 75,
            logistics_score: analysis.dimensionScores?.logistics || 75
          };
          compatibility.ai_analysis.raw_ai_response = JSON.stringify(analysis);
          compatibility.analysis_metadata.last_updated = new Date();
        }

        await compatibility.save();
        compatibilityResults.push(compatibility);
      }
    }

    res.json({
      success: true,
      compatibilityAnalyses: compatibilityResults,
      aiAnalysis
    });

  } catch (error) {
    console.error('Error analyzing compatibility:', error);
    res.status(500).json({ error: 'Server error during compatibility analysis' });
  }
});

/**
 * @route   GET /api/matching/recommendations
 * @desc    Get AI-powered match recommendations for current user
 * @access  Private
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { limit = 5, minScore = 70 } = req.query;

    const recommendations = await MatchRecommendation.getActiveRecommendations(
      req.user.id,
      parseInt(limit)
    );

    res.json({
      recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/matching/recommendations/:id/respond
 * @desc    Respond to a match recommendation
 * @access  Private
 */
router.post('/recommendations/:id/respond', auth, async (req, res) => {
  try {
    const { responseType, notes, rating } = req.body;

    const recommendation = await MatchRecommendation.findById(req.params.id);
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    if (recommendation.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await recommendation.recordUserResponse(responseType, notes, rating);

    res.json({
      success: true,
      recommendation
    });

  } catch (error) {
    console.error('Error responding to recommendation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/matching/compatibility/:partnerId
 * @desc    Get detailed compatibility analysis with specific partner
 * @access  Private
 */
router.get('/compatibility/:partnerId', auth, async (req, res) => {
  try {
    const compatibility = await CompatibilityAnalysis.findOne({
      $or: [
        { student_a: req.user.id, student_b: req.params.partnerId },
        { student_a: req.params.partnerId, student_b: req.user.id }
      ]
    }).populate('student_a student_b', 'name email');

    if (!compatibility) {
      return res.status(404).json({ error: 'Compatibility analysis not found' });
    }

    res.json(compatibility);

  } catch (error) {
    console.error('Error fetching compatibility:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /api/matching/top-matches
 * @desc    Get top compatibility matches for current user
 * @access  Private
 */
router.get('/top-matches', auth, async (req, res) => {
  try {
    const { limit = 10, minScore = 70 } = req.query;

    const topMatches = await CompatibilityAnalysis.findTopMatches(
      req.user.id,
      parseInt(minScore),
      parseInt(limit)
    );

    res.json({
      matches: topMatches,
      count: topMatches.length
    });

  } catch (error) {
    console.error('Error fetching top matches:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/matching/refresh-recommendations
 * @desc    Trigger refresh of AI recommendations for current user
 * @access  Private
 */
router.post('/refresh-recommendations', auth, async (req, res) => {
  try {
    // This would trigger a background job to refresh recommendations
    // For now, we'll return a simple success response

    res.json({
      success: true,
      message: 'Recommendation refresh triggered',
      estimatedTime: '2-3 minutes'
    });

  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;