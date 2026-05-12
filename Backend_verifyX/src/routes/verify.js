const express = require("express");
const multer = require("multer");
const { z } = require("zod");
const store = require("../db/store");
const { validate } = require("../middleware/validate");
const { sha256Hex } = require("../utils/hash");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

async function verifyCredential({ hash, source = "api", metadata = {} }) {
  const credential = await store.getCredentialByHash(hash);
  if (!credential) {
    await store.createVerificationLog({ hash, result: "not-found", source, metadata });
    return { result: "not-found", credential: null };
  }

  const result = credential.status === "revoked" ? "revoked" : "verified";
  await store.createVerificationLog({
    hash: credential.hash,
    credentialId: credential.credentialId,
    result,
    source,
    metadata
  });

  return { result, credential };
}

router.post(
  "/",
  validate(
    z.object({
      hash: z.string().min(6)
    })
  ),
  async (req, res, next) => {
    try {
      const verification = await verifyCredential(req.body);
      return res.json({ verification });
    } catch (error) {
      return next(error);
    }
  }
);

router.get("/:hash", async (req, res, next) => {
  try {
    const verification = await verifyCredential({ hash: req.params.hash, source: "api:get" });
    return res.json({ verification });
  } catch (error) {
    return next(error);
  }
});

router.post("/file", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file is required" });
    const hash = sha256Hex(req.file.buffer);
    const verification = await verifyCredential({
      hash,
      source: "file",
      metadata: { fileName: req.file.originalname, mimeType: req.file.mimetype }
    });
    return res.json({ fileHash: hash, verification });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
