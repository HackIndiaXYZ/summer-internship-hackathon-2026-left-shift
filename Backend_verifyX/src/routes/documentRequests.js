const express = require("express");
const { z } = require("zod");
const store = require("../db/store");
const { validate } = require("../middleware/validate");

const router = express.Router();

const createSchema = z.object({
  studentWallet: z.string().min(8),
  studentProfileId: z.string().optional().or(z.literal("")),
  studentName: z.string().optional().or(z.literal("")),
  studentEmail: z.string().email().optional().or(z.literal("")),
  institutionName: z.string().min(2),
  documentType: z.string().min(2),
  purpose: z.string().optional().or(z.literal(""))
});

const updateSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "issued"]).optional(),
  responseMessage: z.string().optional().or(z.literal("")),
  credentialHash: z.string().optional().or(z.literal("")),
  txHash: z.string().optional().or(z.literal("")),
  metadataCID: z.string().optional().or(z.literal("")),
  pdfCID: z.string().optional().or(z.literal("")),
  issuedCredentialId: z.coerce.number().optional()
});

router.post("/", validate(createSchema), async (req, res, next) => {
  try {
    const request = await store.createDocumentRequest(req.body);
    await store.createNotification({
      recipientWallet: req.body.studentWallet,
      type: "document_request_created",
      title: "Document request submitted",
      message: `${req.body.documentType} request sent to ${req.body.institutionName}.`,
      metadata: { requestId: request.id }
    });
    return res.status(201).json({ request });
  } catch (error) {
    return next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { studentWallet, studentProfileId, institutionName, status } = req.query;
    const requests = await store.listDocumentRequests({ studentWallet, studentProfileId, institutionName, status });
    return res.json({ requests });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", validate(updateSchema), async (req, res, next) => {
  try {
    const request = await store.updateDocumentRequestById(req.params.id, req.body);
    if (!request) return res.status(404).json({ error: "Document request not found" });
    await store.createNotification({
      recipientWallet: request.studentWallet,
      type: "document_request_updated",
      title: "Document request updated",
      message: `${request.documentType} is now ${request.status}.`,
      metadata: { requestId: request.id, credentialHash: request.credentialHash }
    });
    return res.json({ request });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
