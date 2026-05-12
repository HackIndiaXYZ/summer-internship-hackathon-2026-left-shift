const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema(
  {
    credentialId: { type: String, required: true, unique: true, index: true },
    chainId: { type: Number, index: true },
    holder: { type: String, index: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true, index: true },
    studentWallet: { type: String, index: true },
    degree: { type: String, required: true },
    graduationDate: String,
    issuerName: { type: String, required: true },
    issuerId: String,
    status: {
      type: String,
      enum: ["pending", "issued", "verified", "revoked", "failed"],
      default: "issued",
      index: true
    },
    hash: { type: String, required: true, unique: true, index: true },
    credentialHash: { type: String, index: true },
    metadataCID: { type: String, index: true },
    pdfCID: String,
    pdfUrl: String,
    txHash: String,
    issuedAt: Number,
    expiresAt: { type: Number, default: 0 },
    network: { type: String, default: "Polygon POS" },
    vc: { type: mongoose.Schema.Types.Mixed, required: true },
    storage: { type: mongoose.Schema.Types.Mixed, default: {} },
    fraudScore: { type: Number, default: 0 },
    revokedAt: Date,
    revokeReason: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Credential", credentialSchema);
