const Achievement = require('../models/Achievement');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const Goal = require('../models/Goal');
const CommunityPost = require('../models/Community');

// Get the user's gamification profile (points, level, achievements)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('achievements');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      data: {
        points: user.points,
        level: user.level,
        achievements: user.achievements,
        streaks: user.streaks
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get available achievements for the user (not yet earned)
const getAvailableAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const achievements = await Achievement.getAvailableForUser(req.user.id, user.achievements || []);

    res.status(200).json({ status: 'success', data: { achievements } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// List all achievements (optionally filter by category)
const listAchievements = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;

    const achievements = await Achievement.find(query).sort({ order: 1, type: 1 });
    res.status(200).json({ status: 'success', data: { achievements } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Evaluate and award achievements for a user based on activity
const evaluateAndAward = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('achievements');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

    const alreadyEarned = new Set((user.achievements || []).map(a => a._id.toString()));

    // Gather stats
    const totalMoodEntries = await MoodEntry.countDocuments({ user: user._id });
    const totalGoalsCompleted = await Goal.countDocuments({ user: user._id, status: 'completed' });
    const totalPosts = await CommunityPost.countDocuments({ author: user._id });
    // Helpful comments count via aggregation
    const helpfulCommentsAgg = await CommunityPost.aggregate([
      { $unwind: '$comments' },
      { $match: { 'comments.author': user._id } },
      { $project: { helpfulCount: { $size: { $ifNull: ['$comments.isHelpful.markedBy', []] } } } },
      { $group: { _id: null, total: { $sum: '$helpfulCount' } } }
    ]);
    const helpfulComments = helpfulCommentsAgg[0]?.total || 0;

    const available = await Achievement.find({ isActive: true });

    const newlyEarned = [];
    for (const ach of available) {
      if (alreadyEarned.has(ach._id.toString())) continue;

      const reqs = ach.requirements || {};
      let ok = true;
      if (reqs.moodEntries && totalMoodEntries < reqs.moodEntries) ok = false;
      if (reqs.goalsCompleted && totalGoalsCompleted < reqs.goalsCompleted) ok = false;
      if (reqs.communityPosts && totalPosts < reqs.communityPosts) ok = false;
      if (reqs.helpfulComments && helpfulComments < reqs.helpfulComments) ok = false;
      if (reqs.totalPoints && user.points < reqs.totalPoints) ok = false;
      // streaks
      if (reqs.consecutiveDays && (user.streaks?.currentMoodLogging || 0) < reqs.consecutiveDays) ok = false;

      if (ok) {
        newlyEarned.push(ach);
      }
    }

    // Award
    for (const ach of newlyEarned) {
      user.achievements.push(ach._id);
      if (ach.rewards?.points) {
        user.addPoints(ach.rewards.points, `Achievement: ${ach.name}`);
      }
      ach.earnedCount = (ach.earnedCount || 0) + 1;
      await ach.save();
    }
    await user.save();

    res.status(200).json({
      status: 'success',
      data: { awarded: newlyEarned.map(a => ({ id: a._id, name: a.name })) }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Leaderboard by points
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 20, universityOnly = 'false' } = req.query;
    const user = await User.findById(req.user.id);

    const query = { isActive: true };
    if (universityOnly === 'true' && user?.university) {
      query.university = user.university;
    }

    const leaders = await User.find(query)
      .sort({ points: -1 })
      .limit(parseInt(limit))
      .select('firstName lastName displayName points level university');

    res.status(200).json({ status: 'success', data: { leaders } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Grant points manually (admin only placeholder - requires role check)
const grantPoints = async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ status: 'error', message: 'User not found' });

    target.addPoints(points, reason || 'manual_adjustment');
    await target.save();

    res.status(200).json({ status: 'success', data: { userId: target._id, points: target.points } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getProfile,
  getAvailableAchievements,
  listAchievements,
  evaluateAndAward,
  getLeaderboard,
  grantPoints
};

