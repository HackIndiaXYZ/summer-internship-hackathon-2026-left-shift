const express = require("express");
const store = require("../db/store");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const notifications = await store.listNotifications({
      recipientEmail: req.query.email,
      recipientWallet: req.query.walletAddress
    });
    return res.json({ notifications });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
