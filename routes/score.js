const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ScoreUpdate = require('../models/ScoreUpdate');
const fetchuser = require('../middleware/fetchuser');

// Endpoint to save/update a user's score along with the reason
router.post('/api/score', fetchuser, async (req, res) => {
    const { score, reason } = req.body;

    // Validate the request data
    if ( score === undefined || score < 0 || !reason) {
        return res.status(400).json({ message: 'score, and reason are required and should not be negative' });
    }

    try {
        // Find the user by email
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Save the score update to the ScoreUpdate collection
        const scoreUpdate = new ScoreUpdate({
            userId: user._id,
            score,
            reason,
        });

        // Update the user's total score
        user.totalScore += score;
        await user.save();

        // Save the score update
        await scoreUpdate.save();

        return res.json({ message: 'Score updated successfully', highScore: user.totalScore });

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

// Endpoint to get all score updates for a specific user by userId
router.get('/api/score/updates/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Fetch all score updates for the given userId
        const scoreUpdates = await ScoreUpdate.find({ userId })
            .populate('userId', 'email') // Populate email from the User collection
            .sort({ dateUpdated: -1 }); // Sort by dateUpdated in descending order

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
