const mongoose = require('mongoose');

const UserChallengeIPSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Unique identifier for the user
    challengesIP: [
        {
            challengeName: { type: String, required: true }, // Name of the challenge
            ipAddress: { type: String, required: true }, // IP Address for this challenge
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserChallengeIP', UserChallengeIPSchema);
