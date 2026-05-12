import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";

import {
  addIssuer,
  issueCredential,
  verifyByHash,
  verifyById,
  revokeCredential,
  getCredential,
  getHolderCredentials,
  getAllCredentials,
  computeCredentialHash
} from "./contract_verifyx.js";

import { fetchMetadata } from "./IPFSpinata.js";

dotenv.config();

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

const PORT = 3000;

app.get("/", (req, res) => {
  res.send("VCRegistry API running");
});

app.get("/ipfs/test", async (req, res) => {
  try {
    const result = await pinata.testAuthentication();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/ipfs/upload/pdf", upload.single("file"), async (req, res) => {
  try {
    const stream = fs.createReadStream(req.file.path);

    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: req.file.originalname || "certificate.pdf" }
    });

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      pdfCID: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/ipfs/upload/metadata", async (req, res) => {
  try {
    const { vcJSON } = req.body;

    const result = await pinata.pinJSONToIPFS(vcJSON);

    res.json({
      success: true,
      metadataCID: result.IpfsHash
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/credential/full-issue", upload.single("file"), async (req, res) => {
  try {
    const { studentName, degree, issuer, holder, expiresAt = 0 } = req.body;

    const stream = fs.createReadStream(req.file.path);

    const pdfResult = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: req.file.originalname || "credential.pdf" }
    });

    fs.unlinkSync(req.file.path);

    const pdfCID = pdfResult.IpfsHash;

    const vcJSON = {
      student: studentName,
      degree,
      issuer,
      pdfCID,
      issuedAt: Date.now()
    };

    const metaResult = await pinata.pinJSONToIPFS(vcJSON);
    const metadataCID = metaResult.IpfsHash;

    const metadata = await fetchMetadata(metadataCID);

    const result = await issueCredential({
      holder,
      ipfsCID: metadataCID,
      vcJSON: metadata,
      expiresAt: Number(expiresAt) || 0
    });

    res.json({
      success: true,
      pdfCID,
      metadataCID,
      ...result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get("/ipfs/metadata/:cid", async (req, res) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${req.params.cid}`;
    const response = await fetch(url);
    const data = await response.json();

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.get("/ipfs/pdf/:metadataCID", async (req, res) => {
  try {
    const metaUrl = `https://gateway.pinata.cloud/ipfs/${req.params.metadataCID}`;
    const response = await fetch(metaUrl);
    const metadata = await response.json();

    const pdfCID = metadata.pdfCID;

    res.json({
      success: true,
      pdfCID,
      pdfUrl: `https://gateway.pinata.cloud/ipfs/${pdfCID}`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.post("/issuer/add", async (req, res) => {
  try {
    const { address } = req.body;
    const txHash = await addIssuer(address);

    res.json({ success: true, txHash });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/credential/issue", async (req, res) => {
  try {
    const { holder, metadataCID, expiresAt = 0 } = req.body;

    const metadata = await fetchMetadata(metadataCID);

    const result = await issueCredential({
      holder,
      ipfsCID: metadataCID,
      vcJSON: metadata,
      expiresAt: Number(expiresAt) || 0
    });

    res.json({
      success: true,
      ...result
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/credential/verify/hash", async (req, res) => {
  try {
    const isValid = await verifyByHash(req.body.hash);
    res.json({ success: true, valid: isValid });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/credential/verify/id/:id", async (req, res) => {
  try {
    const isValid = await verifyById(Number(req.params.id));
    res.json({ success: true, valid: isValid });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/credential/:id", async (req, res) => {
  try {
    const data = await getCredential(Number(req.params.id));
    res.json({ success: true, data });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/user/:address/credentials", async (req, res) => {
  try {
    const ids = await getHolderCredentials(req.params.address);
    res.json({ success: true, ids });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/user/:address/full", async (req, res) => {
  try {
    const creds = await getAllCredentials(req.params.address);
    res.json({ success: true, credentials: creds });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/credential/revoke", async (req, res) => {
  try {
    const txHash = await revokeCredential(req.body.id);
    res.json({ success: true, txHash });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/hash", (req, res) => {
  try {
    const hash = computeCredentialHash(req.body.vcJSON);
    res.json({ success: true, hash });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});