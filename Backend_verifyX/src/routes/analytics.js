const express = require("express");
const store = require("../db/store");

const router = express.Router();

router.get("/overview", async (req, res, next) => {
  try {
    const overview = await store.analytics();
    return res.json({ overview });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
