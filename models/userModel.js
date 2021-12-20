const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    score: {
      type: Number,
    },
    level: {
      type: Array,
    },
    certificateName: {
      type: String,
      default: "",
    },
    last_write: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
