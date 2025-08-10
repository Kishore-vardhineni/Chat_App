const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    isVerified: {
      type: String,
      default: false,
    },
    resetToken: String,
    resetTokenExpiry: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
