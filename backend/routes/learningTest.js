const express = require('express');

const router = express.Router();

// Learning style test questions
const testQuestions = [
  {
    id: 1,
    question: "When learning something new, I prefer to:",
    options: [
      { value: 'visual', text: 'Read diagrams, charts, or written instructions' },
      { value: 'auditory', text: 'Listen to explanations or discussions' },
      { value: 'kinesthetic', text: 'Try it hands-on and learn by doing' },
      { value: 'mixed', text: 'Use a combination of all methods' }
    ]
  },
  {
    id: 2,
    question: "When studying for an exam, I find it most helpful to:",
    options: [
      { value: 'visual', text: 'Create colorful notes and mind maps' },
      { value: 'auditory', text: 'Record myself reading notes and listen back' },
      { value: 'kinesthetic', text: 'Practice with flashcards and quizzes' },
      { value: 'mixed', text: 'Use multiple study methods together' }
    ]
  },
  {
    id: 3,
    question: "In a classroom, I learn best when:",
    options: [
      { value: 'visual', text: 'The teacher uses slides and visual aids' },
      { value: 'auditory', text: 'The teacher explains concepts verbally' },
      { value: 'kinesthetic', text: 'There are interactive activities and exercises' },
      { value: 'mixed', text: 'Multiple teaching methods are used' }
    ]
  },
  {
    id: 4,
    question: "When I need to remember information, I:",
    options: [
      { value: 'visual', text: 'Picture it in my mind or write it down' },
      { value: 'auditory', text: 'Repeat it out loud or create a rhyme' },
      { value: 'kinesthetic', text: 'Connect it to physical movements or experiences' },
      { value: 'mixed', text: 'Use various memory techniques' }
    ]
  },
  {
    id: 5,
    question: "When solving problems, I tend to:",
    options: [
      { value: 'visual', text: 'Draw diagrams or make lists' },
      { value: 'auditory', text: 'Talk through the problem out loud' },
      { value: 'kinesthetic', text: 'Jump in and try different solutions' },
      { value: 'mixed', text: 'Combine different approaches as needed' }
    ]
  }
];

// Get test questions
router.get('/questions', (req, res) => {
  try {
    res.json({ questions: testQuestions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Calculate learning profile from answers
router.post('/calculate', (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || answers.length !== testQuestions.length) {
      return res.status(400).json({ message: 'Invalid answers provided' });
    }

    const scores = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      mixed: 0
    };

    // Count answers for each learning type
    answers.forEach(answer => {
      if (scores.hasOwnProperty(answer)) {
        scores[answer]++;
      }
    });

    // Determine dominant learning style
    let dominantStyle = Object.keys(scores).reduce((a, b) =>
      scores[a] > scores[b] ? a : b
    );

    // If mixed is highest or there's a tie, classify as mixed
    const maxScore = Math.max(...Object.values(scores));
    const stylesWithMaxScore = Object.keys(scores).filter(style => scores[style] === maxScore);

    if (stylesWithMaxScore.length > 1 || dominantStyle === 'mixed') {
      dominantStyle = 'mixed';
    }

    // Get profile description
    const profileDescriptions = {
      visual: {
        type: 'Visual Learner',
        description: 'You learn best through visual aids like diagrams, charts, and written materials.',
        icon: '🎨',
        tips: [
          'Use colorful notes and highlighters',
          'Create mind maps and diagrams',
          'Watch educational videos',
          'Use flashcards with images'
        ]
      },
      auditory: {
        type: 'Auditory Learner',
        description: 'You learn best through listening and verbal communication.',
        icon: '🎧',
        tips: [
          'Listen to recorded lectures',
          'Study with background music',
          'Join study groups for discussion',
          'Read notes aloud'
        ]
      },
      kinesthetic: {
        type: 'Kinesthetic Learner',
        description: 'You learn best through hands-on activities and movement.',
        icon: '✋',
        tips: [
          'Use interactive learning tools',
          'Take frequent study breaks',
          'Practice with real examples',
          'Use physical flashcards'
        ]
      },
      mixed: {
        type: 'Mixed Learner',
        description: 'You benefit from a combination of different learning approaches.',
        icon: '🌟',
        tips: [
          'Use multiple study methods',
          'Vary your learning activities',
          'Combine visual, audio, and hands-on approaches',
          'Adapt your method to the subject'
        ]
      }
    };

    res.json({
      learningProfile: dominantStyle,
      scores,
      profile: profileDescriptions[dominantStyle]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;