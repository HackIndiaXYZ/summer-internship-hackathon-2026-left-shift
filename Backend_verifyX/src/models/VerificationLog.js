const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
  {
    hash: { type: String, index: true },
    credentialId: { type: String, index: true },
    result: { type: String, enum: ["verified", "revoked", "not-found", "failed"], required: true },
    verifierId: String,
    verifierEmail: String,
    source: { type: String, default: "api" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
