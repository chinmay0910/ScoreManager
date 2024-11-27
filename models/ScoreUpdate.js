const mongoose = require('mongoose');

const ScoreUpdateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User schema
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true, // Reason for the score update
  },
  dateUpdated: {
    type: Date,
    default: Date.now, // Automatically set the current date/time
  },
});

const ScoreUpdate = mongoose.model('ScoreUpdate', ScoreUpdateSchema);

module.exports = ScoreUpdate;
