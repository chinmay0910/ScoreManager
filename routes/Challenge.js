const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge'); // Import the Challenge model
const correctPasspin = process.env.PASSPIN; // Replace with your actual passpin

// POST /api/challenges - Add a new challenge
router.post('/api/challenges', async (req, res) => {
    const { title, name, isVisible, score, passpin } = req.body;
    
    // Validate the input
    if (!title || !name || score == null || !passpin) {
        return res.status(400).json({ message: 'Title, name, isVisible, score, and passpin are required' });
    }

    if (score < 0) {
        return res.status(400).json({ message: 'Score must be a non-negative value' });
    }

    // Verify the passpin
    if (passpin !== correctPasspin) {
        return res.status(403).json({ message: 'Invalid passpin' });
    }

    try {
        // Check if a challenge with the same title already exists
        const existingChallenge = await Challenge.findOne({ title });
        if (existingChallenge) {
            return res.status(400).json({ message: 'A challenge with this title already exists' });
        }

        // Create and save the new challenge
        const newChallenge = new Challenge({
            title,
            score,
            name, 
            isVisible,
        });

        await newChallenge.save();

        res.status(201).json({
            message: 'Challenge added successfully',
            challenge: newChallenge,
        });
    } catch (error) {
        console.error('Error adding challenge:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
