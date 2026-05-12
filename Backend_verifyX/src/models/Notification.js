const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientEmail: { type: String, index: true },
    recipientWallet: { type: String, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
