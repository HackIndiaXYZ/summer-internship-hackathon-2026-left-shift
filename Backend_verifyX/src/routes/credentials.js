const express = require("express");
const { z } = require("zod");
const store = require("../db/store");
const { validate } = require("../middleware/validate");
const { buildCredentialPayload } = require("../services/vc");
const { scoreCredential } = require("../services/fraud");

const router = express.Router();

const issueSchema = z.object({
  studentName: z.string().min(2),
  studentEmail: z.string().email(),
  studentWallet: z.string().optional().or(z.literal("")),
  degree: z.string().min(2),
  graduationDate: z.string().optional().or(z.literal("")),
  issuerName: z.string().optional(),
  credentialId: z.string().optional()
});

router.post("/", validate(issueSchema), async (req, res, next) => {
  try {
    const fraud = await scoreCredential(req.body, store);
    const issuer = {
      id: req.body.issuerName || "external-web3",
      fullName: req.body.issuerName || "VerifyX Institution"
    };
    const payload = buildCredentialPayload(req.body, issuer);

    const draft = {
      ...req.body,
      ...payload,
      issuerId: issuer.id,
      status: fraud.score >= 80 ? "pending" : "issued",
      fraudScore: fraud.score,
      network: "Polygon POS",
      storage: { provider: store.state.mode }
    };

    const credential = await store.createCredential({
      ...draft,
      storage: { provider: store.state.mode }
    });

    await store.createNotification({
      recipientEmail: credential.studentEmail,
      recipientWallet: credential.studentWallet,
      type: "credential_issued",
      title: "Credential issued",
      message: `${credential.issuerName} issued ${credential.degree}.`,
      metadata: { credentialId: credential.credentialId, hash: credential.hash }
    });

    return res.status(201).json({ credential, fraud });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { studentEmail, studentWallet, issuerId, status, degree } = req.query;
    const credentials = await store.listCredentials({ studentEmail, studentWallet, issuerId, status, degree });
    return res.json({ credentials });
  } catch (error) {
    return next(error);
  }
});

router.get("/hash/:hash", async (req, res, next) => {
  try {
    const credential = await store.getCredentialByHash(req.params.hash);
    if (!credential) return res.status(404).json({ error: "Credential not found" });
    return res.json({ credential });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const credential = await store.getCredentialById(req.params.id);
    if (!credential) return res.status(404).json({ error: "Credential not found" });
    return res.json({ credential });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/:id/revoke",
  validate(z.object({ reason: z.string().min(3).optional() })),
  async (req, res, next) => {
    try {
      const credential = await store.updateCredentialById(req.params.id, {
        status: "revoked",
        revokedAt: new Date(),
        revokeReason: req.body.reason || "Revoked by issuer"
      });
      if (!credential) return res.status(404).json({ error: "Credential not found" });
      return res.json({ credential });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
