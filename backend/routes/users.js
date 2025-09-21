const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Update user profile after learning test
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { learningProfile, testAnswers } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        learningProfile,
        testAnswers,
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        learningProfile: user.learningProfile,
        progress: user.progress,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update progress
router.put('/progress', authMiddleware, async (req, res) => {
  try {
    const { tasksCompleted, stressReliefUsage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $inc: {
          'progress.tasksCompleted': tasksCompleted || 0,
          'progress.stressReliefUsage': stressReliefUsage || 0,
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Progress updated successfully',
      progress: user.progress,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (admin only)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics data (admin only)
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalUsers = await User.countDocuments({});

    const learningTypeStats = await User.aggregate([
      { $match: { learningProfile: { $ne: null } } },
      { $group: { _id: '$learningProfile', count: { $sum: 1 } } },
    ]);

    const avgProgress = await User.aggregate([
      {
        $group: {
          _id: null,
          avgTasksCompleted: { $avg: '$progress.tasksCompleted' },
          avgStressReliefUsage: { $avg: '$progress.stressReliefUsage' },
        }
      }
    ]);

    res.json({
      totalUsers,
      learningTypeStats,
      avgProgress: avgProgress[0] || { avgTasksCompleted: 0, avgStressReliefUsage: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;