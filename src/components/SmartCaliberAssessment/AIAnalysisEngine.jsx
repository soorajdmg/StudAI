// AI Analysis Engine for Smart Caliber Assessment
class AIAnalysisEngine {
  constructor() {
    this.learningPatterns = {
      sequential: 'methodical, step-by-step approach',
      intuitive: 'quick insights, pattern recognition',
      analytical: 'deep processing, systematic analysis',
      experimental: 'trial-and-error, adaptive learning'
    }

    this.caliberTypes = {
      'rapid_processor': {
        name: '⚡ Rapid Processor',
        description: 'Processes information quickly with high accuracy under time pressure',
        characteristics: ['Fast response times', 'Maintains accuracy under pressure', 'Thrives in fast-paced environments']
      },
      'deep_thinker': {
        name: '🧠 Deep Thinker',
        description: 'Takes time to process but delivers highly accurate and thoughtful responses',
        characteristics: ['Longer response times', 'High accuracy rates', 'Prefers thorough analysis']
      },
      'adaptive_learner': {
        name: '🔄 Adaptive Learner',
        description: 'Adjusts approach based on task difficulty and format preferences',
        characteristics: ['Variable response patterns', 'Format-dependent performance', 'Strategic adaptation']
      },
      'pattern_specialist': {
        name: '🎯 Pattern Specialist',
        description: 'Excels at recognizing patterns and applying learned concepts consistently',
        characteristics: ['Strong in pattern recognition', 'Consistent performance', 'Transfer learning ability']
      },
      'versatile_performer': {
        name: '🌟 Versatile Performer',
        description: 'Balanced performance across different formats and difficulty levels',
        characteristics: ['Consistent across formats', 'Balanced speed-accuracy', 'Well-rounded approach']
      },
      'growth_mindset': {
        name: '📈 Growth Mindset',
        description: 'Shows clear improvement patterns and learns from mistakes effectively',
        characteristics: ['Improving performance', 'Error recovery', 'Learning from feedback']
      }
    }
  }

  // Main analysis function
  analyzeCaliberProfile(testResults, sessionData, userPreferences) {
    const speedProfile = this.calculateSpeedProfile(testResults)
    const accuracyProfile = this.calculateAccuracyProfile(testResults)
    const styleAuthenticity = this.calculateStyleAuthenticity(testResults, userPreferences)
    const behavioralPattern = this.analyzeBehavioralPattern(sessionData)
    const problemSolvingApproach = this.detectProblemSolvingApproach(testResults, sessionData)
    const caliberClassification = this.classifyCaliberType(speedProfile, accuracyProfile, behavioralPattern, styleAuthenticity)

    return {
      caliberType: caliberClassification,
      profiles: {
        speed: speedProfile,
        accuracy: accuracyProfile,
        authenticity: styleAuthenticity,
        behavioral: behavioralPattern,
        problemSolving: problemSolvingApproach
      },
      insights: this.generateInsights(caliberClassification, speedProfile, accuracyProfile, behavioralPattern),
      recommendations: this.generateRecommendations(caliberClassification, styleAuthenticity, behavioralPattern),
      metrics: this.calculateComprehensiveMetrics(testResults, sessionData)
    }
  }

  // Learning Speed Index Calculation
  calculateSpeedProfile(testResults) {
    const responseTimes = testResults.analytics.responseTimings
    const avgResponseTime = responseTimes.reduce((sum, r) => sum + r.responseTime, 0) / responseTimes.length

    // Calculate speed index (0-100, higher = faster)
    const speedIndex = Math.max(0, 100 - (avgResponseTime / 1000) * 10)

    // Analyze speed vs accuracy correlation
    const speedAccuracyCorrelation = this.calculateSpeedAccuracyCorrelation(responseTimes)

    // Detect speed patterns across difficulty levels
    const speedByDifficulty = this.analyzeSpeedByDifficulty(testResults)

    return {
      index: Math.round(speedIndex),
      averageTime: Math.round(avgResponseTime / 1000 * 10) / 10,
      classification: this.classifySpeed(speedIndex),
      speedAccuracyBalance: speedAccuracyCorrelation,
      difficultyAdaptation: speedByDifficulty,
      consistency: this.calculateSpeedConsistency(responseTimes)
    }
  }

  calculateSpeedAccuracyCorrelation(responseTimes) {
    if (responseTimes.length < 3) return { correlation: 0, pattern: 'insufficient_data' }

    const fastResponses = responseTimes.filter(r => r.responseTime < 5000) // < 5 seconds
    const slowResponses = responseTimes.filter(r => r.responseTime >= 5000)

    const fastAccuracy = fastResponses.length > 0
      ? fastResponses.filter(r => r.isCorrect).length / fastResponses.length
      : 0
    const slowAccuracy = slowResponses.length > 0
      ? slowResponses.filter(r => r.isCorrect).length / slowResponses.length
      : 0

    let pattern = 'balanced'
    if (fastAccuracy > slowAccuracy + 0.2) pattern = 'speed_advantage'
    else if (slowAccuracy > fastAccuracy + 0.2) pattern = 'accuracy_advantage'

    return {
      correlation: Math.round((fastAccuracy - slowAccuracy) * 100),
      pattern,
      fastAccuracy: Math.round(fastAccuracy * 100),
      slowAccuracy: Math.round(slowAccuracy * 100)
    }
  }

  analyzeSpeedByDifficulty(testResults) {
    const timingsByDifficulty = {}

    testResults.analytics.responseTimings.forEach((timing, index) => {
      const question = testResults.questionSequence[index]
      if (question) {
        if (!timingsByDifficulty[question.difficulty]) {
          timingsByDifficulty[question.difficulty] = []
        }
        timingsByDifficulty[question.difficulty].push(timing.responseTime)
      }
    })

    const adaptation = {}
    Object.entries(timingsByDifficulty).forEach(([difficulty, times]) => {
      const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length
      adaptation[difficulty] = Math.round(avgTime / 1000 * 10) / 10
    })

    return adaptation
  }

  calculateSpeedConsistency(responseTimes) {
    if (responseTimes.length < 2) return 0

    const times = responseTimes.map(r => r.responseTime)
    const avg = times.reduce((sum, t) => sum + t, 0) / times.length
    const variance = times.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / times.length
    const coefficient = Math.sqrt(variance) / avg

    // Convert to consistency score (0-100, higher = more consistent)
    return Math.round(Math.max(0, 100 - coefficient * 100))
  }

  classifySpeed(speedIndex) {
    if (speedIndex >= 80) return 'very_fast'
    if (speedIndex >= 60) return 'fast'
    if (speedIndex >= 40) return 'moderate'
    if (speedIndex >= 20) return 'slow'
    return 'very_slow'
  }

  // Style Authenticity Score
  calculateStyleAuthenticity(testResults, userPreferences) {
    const declaredPreference = userPreferences.primary
    const formatPerformance = testResults.analytics.formatPerformance

    // Calculate actual performance by format
    const performanceByFormat = {}
    Object.entries(formatPerformance).forEach(([format, data]) => {
      performanceByFormat[format] = {
        accuracy: Math.round((data.correct / data.total) * 100),
        count: data.total
      }
    })

    // Find best performing format
    const bestFormat = Object.entries(performanceByFormat).reduce((best, [format, data]) => {
      return data.accuracy > (best.accuracy || 0) ? { format, ...data } : best
    }, {})

    // Calculate authenticity score
    const declaredPerformance = performanceByFormat[declaredPreference]
    const authenticityScore = declaredPerformance
      ? Math.round((declaredPerformance.accuracy / bestFormat.accuracy) * 100)
      : 0

    return {
      score: authenticityScore,
      declaredPreference,
      actualBestFormat: bestFormat.format,
      isAuthentic: authenticityScore >= 85,
      performanceGap: bestFormat.accuracy - (declaredPerformance?.accuracy || 0),
      formatPerformance: performanceByFormat,
      adaptabilityScore: this.calculateFormatAdaptability(performanceByFormat)
    }
  }

  calculateFormatAdaptability(performanceByFormat) {
    const accuracies = Object.values(performanceByFormat).map(p => p.accuracy)
    if (accuracies.length < 2) return 0

    const range = Math.max(...accuracies) - Math.min(...accuracies)
    // Lower range = higher adaptability (consistent across formats)
    return Math.round(Math.max(0, 100 - range))
  }

  // Behavioral Pattern Recognition
  analyzeBehavioralPattern(sessionData) {
    const interactions = sessionData.interactions || []
    const stressIndicators = this.analyzeStressIndicators(sessionData)
    const interactionPattern = this.analyzeInteractionPattern(interactions)
    const engagementLevel = this.calculateEngagementLevel(interactions)
    const learningStrategy = this.detectLearningStrategy(interactions)

    return {
      stressLevel: stressIndicators.level,
      stressIndicators: stressIndicators.indicators,
      interactionStyle: interactionPattern.style,
      engagementScore: engagementLevel,
      learningStrategy,
      confidence: this.analyzeConfidencePattern(sessionData),
      persistence: this.calculatePersistence(interactions)
    }
  }

  analyzeStressIndicators(sessionData) {
    const indicators = sessionData.stressIndicators || []
    const stressTypes = {
      'long_pause': 2,
      'multiple_changes': 3,
      'rapid_clicking': 1
    }

    let stressScore = 0
    const detectedIndicators = []

    indicators.forEach(indicator => {
      const weight = stressTypes[indicator.type] || 1
      stressScore += weight
      detectedIndicators.push({
        type: indicator.type,
        severity: weight,
        context: indicator.data
      })
    })

    let level = 'low'
    if (stressScore >= 8) level = 'high'
    else if (stressScore >= 4) level = 'medium'

    return {
      level,
      score: stressScore,
      indicators: detectedIndicators
    }
  }

  analyzeInteractionPattern(interactions) {
    if (interactions.length === 0) return { style: 'minimal', description: 'Limited interaction data' }

    const interactionTypes = {}
    interactions.forEach(interaction => {
      interactionTypes[interaction.type] = (interactionTypes[interaction.type] || 0) + 1
    })

    // Determine interaction style
    const totalInteractions = interactions.length
    const exploratoryActions = ['visual_element_click', 'step_click', 'format_switch'].reduce(
      (count, type) => count + (interactionTypes[type] || 0), 0
    )

    const explorationRatio = exploratoryActions / totalInteractions

    let style = 'focused'
    if (explorationRatio > 0.6) style = 'exploratory'
    else if (explorationRatio > 0.3) style = 'balanced'

    return {
      style,
      explorationRatio: Math.round(explorationRatio * 100),
      interactionCount: totalInteractions,
      distribution: interactionTypes
    }
  }

  calculateEngagementLevel(interactions) {
    const engagementActions = [
      'visual_element_click', 'step_click', 'audio_play', 'text_highlight',
      'note_taking', 'kinesthetic_step_complete', 'format_switch'
    ]

    const engagementCount = interactions.filter(i =>
      engagementActions.includes(i.type)
    ).length

    // Calculate engagement score (0-100)
    const maxExpectedEngagement = 20 // Expected for highly engaged user
    return Math.min(100, Math.round((engagementCount / maxExpectedEngagement) * 100))
  }

  detectLearningStrategy(interactions) {
    const strategies = {
      sequential: 0,
      exploratory: 0,
      repetitive: 0,
      adaptive: 0
    }

    // Analyze interaction patterns
    const formatSwitches = interactions.filter(i => i.type === 'format_switch').length
    const repetitiveActions = this.countRepetitiveActions(interactions)
    const sequentialActions = this.countSequentialActions(interactions)

    if (formatSwitches >= 2) strategies.adaptive += 3
    if (repetitiveActions >= 3) strategies.repetitive += 2
    if (sequentialActions >= 0.7) strategies.sequential += 2
    else strategies.exploratory += 1

    const dominantStrategy = Object.entries(strategies).reduce((max, [strategy, score]) =>
      score > max.score ? { strategy, score } : max
    , { strategy: 'balanced', score: 0 })

    return dominantStrategy.strategy
  }

  countRepetitiveActions(interactions) {
    const actionCounts = {}
    interactions.forEach(i => {
      const key = `${i.type}_${i.format || 'general'}`
      actionCounts[key] = (actionCounts[key] || 0) + 1
    })

    return Object.values(actionCounts).filter(count => count >= 3).length
  }

  countSequentialActions(interactions) {
    if (interactions.length < 2) return 0

    let sequentialCount = 0
    for (let i = 1; i < interactions.length; i++) {
      const current = interactions[i]
      const previous = interactions[i - 1]

      if (this.isSequentialAction(previous, current)) {
        sequentialCount++
      }
    }

    return sequentialCount / (interactions.length - 1)
  }

  isSequentialAction(previous, current) {
    const sequentialPairs = [
      ['visual_element_click', 'step_click'],
      ['audio_play', 'audio_complete'],
      ['text_highlight', 'note_taking'],
      ['kinesthetic_step_complete', 'kinesthetic_step_complete']
    ]

    return sequentialPairs.some(pair =>
      (previous.type === pair[0] && current.type === pair[1]) ||
      (previous.type === current.type && previous.timestamp < current.timestamp)
    )
  }

  analyzeConfidencePattern(sessionData) {
    const confidenceRatings = sessionData.confidenceRatings || []
    if (confidenceRatings.length === 0) {
      return { average: 0, pattern: 'no_data', progression: 'unknown' }
    }

    const ratings = confidenceRatings.map(r => r.confidence)
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length

    // Analyze confidence progression
    const firstHalf = ratings.slice(0, Math.ceil(ratings.length / 2))
    const secondHalf = ratings.slice(Math.ceil(ratings.length / 2))

    const firstAvg = firstHalf.reduce((sum, r) => sum + r, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, r) => sum + r, 0) / secondHalf.length

    let progression = 'stable'
    if (secondAvg > firstAvg + 0.5) progression = 'increasing'
    else if (firstAvg > secondAvg + 0.5) progression = 'decreasing'

    return {
      average: Math.round(average * 10) / 10,
      pattern: this.classifyConfidenceLevel(average),
      progression,
      consistency: this.calculateConfidenceConsistency(ratings)
    }
  }

  classifyConfidenceLevel(average) {
    if (average >= 3.5) return 'high'
    if (average >= 2.5) return 'medium'
    return 'low'
  }

  calculateConfidenceConsistency(ratings) {
    if (ratings.length < 2) return 100

    const variance = ratings.reduce((sum, rating, index, arr) => {
      const mean = arr.reduce((s, r) => s + r, 0) / arr.length
      return sum + Math.pow(rating - mean, 2)
    }, 0) / ratings.length

    return Math.round(Math.max(0, 100 - variance * 25))
  }

  calculatePersistence(interactions) {
    const completionActions = [
      'visual_completed', 'audio_completed', 'text_completed',
      'kinesthetic_completed', 'checkpoint_submit'
    ]

    const completions = interactions.filter(i => completionActions.includes(i.type)).length
    const maxPossibleCompletions = 5 // Assuming max 5 sections

    return Math.round((completions / maxPossibleCompletions) * 100)
  }

  // Problem-Solving Approach Detection
  detectProblemSolvingApproach(testResults, sessionData) {
    const responsePattern = this.analyzeResponsePattern(testResults)
    const thinkingTime = this.analyzeThinkingTime(testResults)
    const errorPattern = this.analyzeErrorPattern(testResults)

    let approach = 'analytical'

    if (thinkingTime.average < 3 && responsePattern.consistency > 70) {
      approach = 'intuitive'
    } else if (thinkingTime.variation > 50 && errorPattern.recoveryRate > 70) {
      approach = 'experimental'
    } else if (thinkingTime.consistency > 80 && responsePattern.progression === 'improving') {
      approach = 'sequential'
    }

    return {
      type: approach,
      description: this.learningPatterns[approach],
      characteristics: this.getApproachCharacteristics(approach, thinkingTime, responsePattern, errorPattern),
      confidence: this.calculateApproachConfidence(thinkingTime, responsePattern, errorPattern)
    }
  }

  analyzeResponsePattern(testResults) {
    const timings = testResults.analytics.responseTimings
    const accuracies = timings.map(t => t.isCorrect ? 1 : 0)

    // Calculate improvement over time
    const firstHalf = accuracies.slice(0, Math.ceil(accuracies.length / 2))
    const secondHalf = accuracies.slice(Math.ceil(accuracies.length / 2))

    const firstAccuracy = firstHalf.reduce((sum, a) => sum + a, 0) / firstHalf.length
    const secondAccuracy = secondHalf.reduce((sum, a) => sum + a, 0) / secondHalf.length

    let progression = 'stable'
    if (secondAccuracy > firstAccuracy + 0.2) progression = 'improving'
    else if (firstAccuracy > secondAccuracy + 0.2) progression = 'declining'

    return {
      progression,
      consistency: this.calculateAccuracyConsistency(accuracies),
      trend: secondAccuracy - firstAccuracy
    }
  }

  analyzeThinkingTime(testResults) {
    const times = testResults.analytics.responseTimings.map(r => r.responseTime / 1000)
    const average = times.reduce((sum, t) => sum + t, 0) / times.length
    const variance = times.reduce((sum, t) => sum + Math.pow(t - average, 2), 0) / times.length
    const coefficient = Math.sqrt(variance) / average

    return {
      average: Math.round(average * 10) / 10,
      variation: Math.round(coefficient * 100),
      consistency: Math.round(Math.max(0, 100 - coefficient * 100))
    }
  }

  analyzeErrorPattern(testResults) {
    const timings = testResults.analytics.responseTimings
    const errors = timings.filter(t => !t.isCorrect)
    const corrections = 0 // This would need answer change data

    return {
      errorRate: Math.round((errors.length / timings.length) * 100),
      recoveryRate: Math.round((corrections / Math.max(1, errors.length)) * 100),
      errorDistribution: this.analyzeErrorDistribution(testResults)
    }
  }

  analyzeErrorDistribution(testResults) {
    const distribution = { easy: 0, medium: 0, hard: 0 }

    testResults.analytics.responseTimings.forEach((timing, index) => {
      const question = testResults.questionSequence[index]
      if (question && !timing.isCorrect) {
        distribution[question.difficulty]++
      }
    })

    return distribution
  }

  calculateAccuracyConsistency(accuracies) {
    if (accuracies.length < 2) return 100

    let consistencyScore = 0
    for (let i = 1; i < accuracies.length; i++) {
      if (accuracies[i] === accuracies[i-1]) consistencyScore++
    }

    return Math.round((consistencyScore / (accuracies.length - 1)) * 100)
  }

  getApproachCharacteristics(approach, thinkingTime, responsePattern, errorPattern) {
    const characteristics = {
      sequential: [
        `Consistent thinking time (${thinkingTime.consistency}% consistency)`,
        `${responsePattern.progression} accuracy pattern`,
        `${errorPattern.errorRate}% error rate with systematic approach`
      ],
      intuitive: [
        `Quick decision making (${thinkingTime.average}s average)`,
        `High consistency (${responsePattern.consistency}% accuracy consistency)`,
        `Relies on pattern recognition and first impressions`
      ],
      analytical: [
        `Thorough processing (${thinkingTime.average}s thinking time)`,
        `Systematic error analysis (${errorPattern.recoveryRate}% recovery rate)`,
        `Deep processing approach with careful consideration`
      ],
      experimental: [
        `Variable approach (${thinkingTime.variation}% time variation)`,
        `High adaptability (${errorPattern.recoveryRate}% error recovery)`,
        `Learning through trial and refinement`
      ]
    }

    return characteristics[approach] || []
  }

  calculateApproachConfidence(thinkingTime, responsePattern, errorPattern) {
    // Calculate confidence based on data consistency and pattern strength
    let confidence = 50 // Base confidence

    if (thinkingTime.consistency > 70) confidence += 20
    if (responsePattern.consistency > 70) confidence += 20
    if (Math.abs(responsePattern.trend) > 0.3) confidence += 10

    return Math.min(100, confidence)
  }

  // Caliber Classification System
  classifyCaliberType(speedProfile, accuracyProfile, behavioralPattern, styleAuthenticity) {
    let scores = {
      rapid_processor: 0,
      deep_thinker: 0,
      adaptive_learner: 0,
      pattern_specialist: 0,
      versatile_performer: 0,
      growth_mindset: 0
    }

    // Speed-based scoring
    if (speedProfile.index >= 70 && accuracyProfile.overall >= 80) {
      scores.rapid_processor += 30
    }
    if (speedProfile.index <= 40 && accuracyProfile.overall >= 85) {
      scores.deep_thinker += 30
    }

    // Adaptability scoring
    if (styleAuthenticity.adaptabilityScore >= 70) {
      scores.adaptive_learner += 25
      scores.versatile_performer += 20
    }

    // Pattern recognition scoring
    if (accuracyProfile.consistency >= 80 && styleAuthenticity.isAuthentic) {
      scores.pattern_specialist += 25
    }

    // Growth mindset scoring
    if (accuracyProfile.trend > 15 && behavioralPattern.persistence >= 70) {
      scores.growth_mindset += 30
    }

    // Behavioral pattern adjustments
    if (behavioralPattern.engagementScore >= 70) {
      scores.versatile_performer += 15
      scores.adaptive_learner += 10
    }

    if (behavioralPattern.stressLevel === 'low' && speedProfile.consistency >= 70) {
      scores.rapid_processor += 15
    }

    // Find the highest scoring caliber type
    const topCaliber = Object.entries(scores).reduce((max, [type, score]) =>
      score > max.score ? { type, score } : max
    , { type: 'versatile_performer', score: 0 })

    return {
      primaryType: topCaliber.type,
      confidence: Math.round((topCaliber.score / 100) * 100),
      scores,
      profile: this.caliberTypes[topCaliber.type]
    }
  }

  // Generate Insights
  generateInsights(caliberClassification, speedProfile, accuracyProfile, behavioralPattern) {
    const insights = []

    // Speed insights
    if (speedProfile.index >= 80) {
      insights.push(`You process information rapidly with ${speedProfile.averageTime}s average response time`)
    } else if (speedProfile.index <= 30) {
      insights.push(`You take time to think deeply, averaging ${speedProfile.averageTime}s per response`)
    }

    // Accuracy insights
    if (accuracyProfile.overall >= 85) {
      insights.push(`Your accuracy rate of ${accuracyProfile.overall}% indicates strong comprehension`)
    }

    // Behavioral insights
    if (behavioralPattern.engagementScore >= 70) {
      insights.push(`High engagement level (${behavioralPattern.engagementScore}%) shows active learning approach`)
    }

    if (behavioralPattern.stressLevel === 'low') {
      insights.push('You maintain composure well under assessment pressure')
    } else if (behavioralPattern.stressLevel === 'high') {
      insights.push('Consider stress management techniques to optimize performance')
    }

    // Caliber-specific insights
    const caliberType = caliberClassification.primaryType
    if (caliberType === 'rapid_processor') {
      insights.push('Your quick processing ability is a significant cognitive strength')
    } else if (caliberType === 'deep_thinker') {
      insights.push('Your thorough analysis approach leads to high-quality responses')
    } else if (caliberType === 'adaptive_learner') {
      insights.push('You excel at adjusting your approach based on task requirements')
    }

    return insights.slice(0, 5) // Return top 5 insights
  }

  // Generate Recommendations
  generateRecommendations(caliberClassification, styleAuthenticity, behavioralPattern) {
    const recommendations = []
    const caliberType = caliberClassification.primaryType

    // Caliber-specific recommendations
    switch (caliberType) {
      case 'rapid_processor':
        recommendations.push('Leverage your speed advantage in time-pressured situations')
        recommendations.push('Practice detail-oriented tasks to balance speed with precision')
        break
      case 'deep_thinker':
        recommendations.push('Allow yourself adequate time for complex problem-solving')
        recommendations.push('Your thoroughness is valuable - trust your analytical process')
        break
      case 'adaptive_learner':
        recommendations.push('Continue exploring different learning formats to maximize versatility')
        recommendations.push('Use your adaptability to tackle diverse academic challenges')
        break
      case 'pattern_specialist':
        recommendations.push('Focus on subjects that involve pattern recognition and system analysis')
        recommendations.push('Use your consistency to build advanced problem-solving frameworks')
        break
      case 'versatile_performer':
        recommendations.push('Explore leadership roles that benefit from your balanced approach')
        recommendations.push('Consider interdisciplinary studies that match your versatility')
        break
      case 'growth_mindset':
        recommendations.push('Embrace challenging materials that push your current limits')
        recommendations.push('Your improvement trajectory suggests high learning potential')
        break
    }

    // Style authenticity recommendations
    if (!styleAuthenticity.isAuthentic) {
      recommendations.push(`Explore ${styleAuthenticity.actualBestFormat} learning methods more deeply`)
    }

    // Behavioral recommendations
    if (behavioralPattern.stressLevel === 'high') {
      recommendations.push('Practice relaxation techniques before high-stakes assessments')
    }

    if (behavioralPattern.engagementScore < 50) {
      recommendations.push('Try more interactive learning approaches to increase engagement')
    }

    return recommendations.slice(0, 6) // Return top 6 recommendations
  }

  // Calculate Comprehensive Metrics
  calculateComprehensiveMetrics(testResults, sessionData) {
    const accuracy = testResults.performanceMetrics.accuracy
    const speed = testResults.performanceMetrics.averageResponseTime
    const engagement = this.calculateEngagementLevel(sessionData.interactions || [])
    const consistency = this.calculateSpeedConsistency(testResults.analytics.responseTimings)

    return {
      overall: Math.round((accuracy * 100 + (100 - speed) + engagement + consistency) / 4),
      breakdown: {
        accuracy: Math.round(accuracy * 100),
        speed: Math.round(100 - Math.min(speed, 20) * 5), // Convert to 0-100 scale
        engagement,
        consistency
      },
      strengths: this.identifyTopStrengths({ accuracy, speed, engagement, consistency }),
      growthAreas: this.identifyGrowthAreas({ accuracy, speed, engagement, consistency })
    }
  }

  calculateAccuracyProfile(testResults) {
    const timings = testResults.analytics.responseTimings
    const correctCount = timings.filter(t => t.isCorrect).length
    const overall = Math.round((correctCount / timings.length) * 100)

    // Calculate accuracy by difficulty
    const byDifficulty = {}
    timings.forEach((timing, index) => {
      const question = testResults.questionSequence[index]
      if (question) {
        if (!byDifficulty[question.difficulty]) {
          byDifficulty[question.difficulty] = { correct: 0, total: 0 }
        }
        byDifficulty[question.difficulty].total++
        if (timing.isCorrect) byDifficulty[question.difficulty].correct++
      }
    })

    Object.keys(byDifficulty).forEach(difficulty => {
      const data = byDifficulty[difficulty]
      byDifficulty[difficulty].percentage = Math.round((data.correct / data.total) * 100)
    })

    return {
      overall,
      byDifficulty,
      consistency: this.calculateAccuracyConsistency(timings.map(t => t.isCorrect ? 1 : 0)),
      trend: this.calculateAccuracyTrend(timings)
    }
  }

  calculateAccuracyTrend(timings) {
    if (timings.length < 4) return 0

    const firstHalf = timings.slice(0, Math.ceil(timings.length / 2))
    const secondHalf = timings.slice(Math.ceil(timings.length / 2))

    const firstAccuracy = firstHalf.filter(t => t.isCorrect).length / firstHalf.length
    const secondAccuracy = secondHalf.filter(t => t.isCorrect).length / secondHalf.length

    return Math.round((secondAccuracy - firstAccuracy) * 100)
  }

  identifyTopStrengths(metrics) {
    const strengthMap = {
      accuracy: 'Problem-solving accuracy',
      speed: 'Processing speed',
      engagement: 'Learning engagement',
      consistency: 'Performance consistency'
    }

    return Object.entries(metrics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([key]) => strengthMap[key])
  }

  identifyGrowthAreas(metrics) {
    const areaMap = {
      accuracy: 'Accuracy optimization',
      speed: 'Response timing',
      engagement: 'Active participation',
      consistency: 'Performance stability'
    }

    return Object.entries(metrics)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2)
      .map(([key]) => areaMap[key])
  }
}

export default AIAnalysisEngine