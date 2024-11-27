const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures unique email addresses
  },
  totalScore: {
    type: Number,
    default: 0, // Default score is 0
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
