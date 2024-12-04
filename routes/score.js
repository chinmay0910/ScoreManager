const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ScoreUpdate = require('../models/ScoreUpdate');
const fetchuser = require('../middleware/fetchuser');
const Challenge = require('../models/Challenge');

// Endpoint to save/update a user's score based on a challenge
router.post('/api/score', fetchuser, async (req, res) => {
    const { challengeId } = req.body;

    if (!challengeId) {
        return res.status(400).json({ message: 'ChallengeId is required' });
    }

    try {
        // Find the challenge by ID
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Find the user by userId (from the token)
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has already submitted for this challenge
        const existingScoreUpdate = await ScoreUpdate.findOne({
            userId: user._id,
            challengeId: challenge._id,
        });

        if (existingScoreUpdate) {
            return res.status(400).json({
                message: 'You have already submitted for this challenge',
            });
        }

        // Create a new score update record
        const scoreUpdate = new ScoreUpdate({
            userId: user._id,
            challengeId: challenge._id,
            score: challenge.score, // Automatically assign score from Challenge schema
            reason: challenge.title, // Use challenge title as reason
        });

        // Update the user's total score
        user.totalScore += challenge.score;
        await user.save();

        // Save the score update
        await scoreUpdate.save();

        return res.status(201).json({
            message: 'Score updated successfully',
            highScore: user.totalScore,
        });
    } catch (error) {
        console.error('Error updating score:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Endpoint to get a user's total score using JWT token
router.get('/api/score', fetchuser, async (req, res) => {
    // Decode the token to get the userId
    const userId = req.userId;

    if (!userId) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }

    try {
        // Find the user by userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's total score
        res.json({ email: user.email, totalScore: user.totalScore });
    } catch (error) {
        console.error('Error fetching score:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch all score updates for a specific user by userId
router.get('/api/score/updates/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const scoreUpdates = await ScoreUpdate.find({ userId })
            .populate('userId', 'email') // Populate user email
            .populate('challengeId', 'title') // Populate challenge title
            .sort({ dateUpdated: -1 }); // Sort by dateUpdated descending

        if (scoreUpdates.length === 0) {
            return res.status(404).json({ message: 'No score updates found for this user' });
        }

        res.json(scoreUpdates);
    } catch (error) {
        console.error('Error fetching score updates:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
