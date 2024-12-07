const express = require('express');
const UserChallengeIP = require('../models/UserChallengeIP'); // Assuming your schema is in models/UserChallengeIP.js
const Challenge = require('../models/Challenge'); // Assuming your schema is in models/UserChallengeIP.js
const fetchuser = require('../middleware/fetchuser');

const router = express.Router();

// Route to add challengeName and IP address
router.post('/api/addChallengeIp', async (req, res) => {
    const { userId, challengeName, ipAddress, passpin } = req.body;

    if (passpin !== process.env.PASSPIN) {
        return res.status(400).json({ error: 'Bad Request' });
    }

    if (!userId || !challengeName || !ipAddress) {
        return res.status(400).json({ error: 'challengeName, and ipAddress are required.' });
    }

    try {
        const updatedUserChallenge = await UserChallengeIP.findOneAndUpdate(
            { userId }, // Find document by userId
            {
                $push: {
                    challengesIP: {
                        challengeName,
                        ipAddress,
                    },
                },
            },
            { upsert: true, new: true } // Create document if it doesn't exist, and return the updated document
        );

        return res.status(200).json({ message: 'Challenge IP added successfully.', data: updatedUserChallenge });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// Route to retrieve IP address and visibility for a specific challenge and user
router.get('/api/getChallengeInfo/:challengeName', fetchuser, async (req, res) => {
    const { challengeName } = req.params;
    const userId = req.userId;

    try {
        // Find the user's document
        const userChallenges = await UserChallengeIP.findOne({ userId });

        if (!userChallenges) {
            return res.status(404).json({ error: 'User not found or no challenges associated.' });
        }

        // Find the specific challenge IP by name in UserChallengeIP
        const challengeIP = userChallenges.challengesIP.find(
            (c) => c.challengeName === challengeName
        );

        if (!challengeIP) {
            return res.status(404).json({ error: 'Challenge not found for this user.' });
        }
        

        // Find the challenge in the Challenge collection for `isVisible`
        const challenge = await Challenge.findOne({ name: challengeName });

        if (!challenge) {
            return res.status(404).json({ error: 'Challenge details not found in the system.' });
        }

        // If challenge is visible, return the IP address
        if (challenge.isVisible) {
            return res.status(200).json({
                ipAddress: challengeIP.ipAddress,
            });
        } else {
            return res.status(200).json({ message: 'Challenge is not available' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
