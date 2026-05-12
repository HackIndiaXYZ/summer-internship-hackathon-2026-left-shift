const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    email: { type: String, index: true, unique: true, sparse: true },
    role: {
      type: String,
      enum: ["student", "institution", "verifier", "admin"],
      required: true
    },
    fullName: String,
    institutionName: String,
    walletAddress: { type: String, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
