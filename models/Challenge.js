const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true, // Each challenge must have a unique title
        trim: true,
    },
    score: {
        type: Number,
        required: true,
        min: 0, // Ensure score is not negative
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically add the creation date
    },
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
