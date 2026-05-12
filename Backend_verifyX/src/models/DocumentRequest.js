const mongoose = require("mongoose");

const documentRequestSchema = new mongoose.Schema(
  {
    studentWallet: { type: String, required: true, index: true },
    studentProfileId: { type: String, index: true },
    studentName: String,
    studentEmail: String,
    institutionName: { type: String, required: true, index: true },
    documentType: { type: String, required: true },
    purpose: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "issued"],
      default: "pending",
      index: true
    },
    responseMessage: String,
    credentialHash: String,
    txHash: String,
    metadataCID: String,
    pdfCID: String,
    issuedCredentialId: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("DocumentRequest", documentRequestSchema);
