# VCRegistry API

A decentralized **Verifiable Credential (VC) Registry** backend built with **Node.js + Express**, powered by **IPFS (Pinata)** for decentralized storage and a **smart contract** (VeriifyX) for on-chain credential management.

Institutions can issue tamper-proof academic credentials (or any VC), store them on IPFS, anchor their hash on-chain, and allow anyone to verify or revoke them — without a central authority.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Environment Setup](#environment-setup)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [IPFS — Test Authentication](#ipfs--test-authentication)
  - [IPFS — Upload PDF](#ipfs--upload-pdf)
  - [IPFS — Upload Metadata JSON](#ipfs--upload-metadata-json)
  - [IPFS — Fetch Metadata by CID](#ipfs--fetch-metadata-by-cid)
  - [IPFS — Get PDF URL from Metadata CID](#ipfs--get-pdf-url-from-metadata-cid)
  - [Issuer — Add Issuer](#issuer--add-issuer)
  - [Credential — Issue (from existing CID)](#credential--issue-from-existing-cid)
  - [Credential — Full Issue (PDF + Metadata + Chain)](#credential--full-issue-pdf--metadata--chain)
  - [Credential — Verify by Hash](#credential--verify-by-hash)
  - [Credential — Verify by ID](#credential--verify-by-id)
  - [Credential — Get by ID](#credential--get-by-id)
  - [Credential — Revoke](#credential--revoke)
  - [User — Get Credential IDs](#user--get-credential-ids)
  - [User — Get Full Credentials](#user--get-full-credentials)
  - [Utility — Compute Hash](#utility--compute-hash)
- [Error Responses](#error-responses)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| Decentralized Storage | IPFS via Pinata SDK |
| Smart Contract | VeriifyX (custom Solidity contract) |
| File Uploads | Multer |

---

## Environment Setup

Create a `.env` file in the root directory:

```env
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
RPC_URL=https://your-rpc-endpoint
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

Install dependencies:

```bash
npm install
```

---

## Running the Server

```bash
node server.js
```

Server starts at `http://localhost:3000`

---

## API Reference

---

### Health Check

**`GET /`**

Confirms the API server is running.

**Response**
```
VCRegistry API running
```

---

### IPFS — Test Authentication

**`GET /ipfs/test`**

Verifies that your Pinata API credentials are valid.

**Response — Success**
```json
{
  "success": true,
  "result": {
    "message": "Congratulations! You are communicating with the Pinata API!"
  }
}
```

**Response — Failure**
```json
{
  "success": false,
  "error": "Invalid API keys"
}
```

---

### IPFS — Upload PDF

**`POST /ipfs/upload/pdf`**

Uploads a PDF file to IPFS via Pinata and returns its CID.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | File | The PDF file to upload |

**Example (curl)**
```bash
curl -X POST http://localhost:3000/ipfs/upload/pdf \
  -F "file=@/path/to/certificate.pdf"
```

**Response — Success**
```json
{
  "success": true,
  "pdfCID": "QmXyz123abc...",
  "url": "https://gateway.pinata.cloud/ipfs/QmXyz123abc..."
}
```

---

### IPFS — Upload Metadata JSON

**`POST /ipfs/upload/metadata`**

Pins a JSON object (VC metadata) to IPFS and returns its CID.

**Request Body**
```json
{
  "vcJSON": {
    "student": "Akshat Sharma",
    "degree": "B.Tech Computer Science",
    "issuer": "SOA University",
    "pdfCID": "QmXyz123abc...",
    "issuedAt": 1714000000000
  }
}
```

**Response — Success**
```json
{
  "success": true,
  "metadataCID": "QmMeta456def..."
}
```

---

### IPFS — Fetch Metadata by CID

**`GET /ipfs/metadata/:cid`**

Retrieves the JSON metadata stored at a given IPFS CID.

**Path Parameter**

| Parameter | Description |
|---|---|
| `cid` | The IPFS CID of the metadata JSON |

**Example**
```
GET /ipfs/metadata/QmMeta456def...
```

**Response — Success**
```json
{
  "success": true,
  "data": {
    "student": "Akshat Sharma",
    "degree": "B.Tech Computer Science",
    "issuer": "SOA University",
    "pdfCID": "QmXyz123abc...",
    "issuedAt": 1714000000000
  }
}
```

---

### IPFS — Get PDF URL from Metadata CID

**`GET /ipfs/pdf/:metadataCID`**

Resolves the PDF CID and URL from a metadata CID. Useful when you only have the metadata CID and need to display the original certificate PDF.

**Path Parameter**

| Parameter | Description |
|---|---|
| `metadataCID` | The IPFS CID of the metadata JSON |

**Example**
```
GET /ipfs/pdf/QmMeta456def...
```

**Response — Success**
```json
{
  "success": true,
  "pdfCID": "QmXyz123abc...",
  "pdfUrl": "https://gateway.pinata.cloud/ipfs/QmXyz123abc..."
}
```

---

### Issuer — Add Issuer

**`POST /issuer/add`**

Registers a wallet address as an authorized credential issuer on-chain. Must be called by the contract owner/admin.

**Request Body**
```json
{
  "address": "0xAbCdEf1234567890abcdef1234567890AbCdEf12"
}
```

**Response — Success**
```json
{
  "success": true,
  "txHash": "0xabc123txhash..."
}
```

---

### Credential — Issue (from existing CID)

**`POST /credential/issue`**

Issues a credential on-chain using an already-uploaded metadata CID. The metadata is fetched from IPFS, hashed, and anchored to the smart contract.

**Request Body**

| Field | Type | Required | Description |
|---|---|---|---|
| `holder` | `string` | ✅ | Wallet address of the credential holder |
| `metadataCID` | `string` | ✅ | IPFS CID of the uploaded VC metadata |
| `expiresAt` | `number` | ❌ | Unix timestamp for expiry (0 = no expiry) |

**Example**
```json
{
  "holder": "0xHolderAddress123...",
  "metadataCID": "QmMeta456def...",
  "expiresAt": 0
}
```

**Response — Success**
```json
{
  "success": true,
  "credentialId": 7,
  "txHash": "0xdef456txhash...",
  "credentialHash": "0x9a3f..."
}
```

---

### Credential — Full Issue (PDF + Metadata + Chain)

**`POST /credential/full-issue`**

The all-in-one endpoint. Accepts a PDF file and credential details, uploads the PDF to IPFS, creates and pins the metadata JSON, and issues the credential on-chain — all in a single request.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | ✅ | The certificate PDF |
| `studentName` | `string` | ✅ | Full name of the student |
| `degree` | `string` | ✅ | Degree or credential title |
| `issuer` | `string` | ✅ | Name of the issuing institution |
| `holder` | `string` | ✅ | Holder's wallet address |
| `expiresAt` | `number` | ❌ | Unix timestamp for expiry (0 = no expiry) |

**Example (curl)**
```bash
curl -X POST http://localhost:3000/credential/full-issue \
  -F "file=@/path/to/certificate.pdf" \
  -F "studentName=Akshat Sharma" \
  -F "degree=B.Tech Computer Science" \
  -F "issuer=SOA University" \
  -F "holder=0xHolderAddress123..." \
  -F "expiresAt=0"
```

**Response — Success**
```json
{
  "success": true,
  "pdfCID": "QmXyz123abc...",
  "metadataCID": "QmMeta456def...",
  "credentialId": 8,
  "txHash": "0xghi789txhash...",
  "credentialHash": "0xb7c2..."
}
```

---

### Credential — Verify by Hash

**`POST /credential/verify/hash`**

Checks whether a credential hash exists and is valid on-chain.

**Request Body**
```json
{
  "hash": "0x9a3f..."
}
```

**Response — Success (valid)**
```json
{
  "success": true,
  "valid": true
}
```

**Response — Success (invalid/revoked)**
```json
{
  "success": true,
  "valid": false
}
```

---

### Credential — Verify by ID

**`GET /credential/verify/id/:id`**

Verifies a credential by its on-chain numeric ID.

**Path Parameter**

| Parameter | Description |
|---|---|
| `id` | On-chain credential ID (integer) |

**Example**
```
GET /credential/verify/id/7
```

**Response — Success**
```json
{
  "success": true,
  "valid": true
}
```

---

### Credential — Get by ID

**`GET /credential/:id`**

Fetches the full on-chain data for a credential by its ID.

**Path Parameter**

| Parameter | Description |
|---|---|
| `id` | On-chain credential ID (integer) |

**Example**
```
GET /credential/7
```

**Response — Success**
```json
{
  "success": true,
  "data": {
    "id": 7,
    "holder": "0xHolderAddress123...",
    "issuer": "0xIssuerAddress456...",
    "ipfsCID": "QmMeta456def...",
    "credentialHash": "0x9a3f...",
    "issuedAt": 1714000000,
    "expiresAt": 0,
    "revoked": false
  }
}
```

---

### Credential — Revoke

**`POST /credential/revoke`**

Revokes an existing credential on-chain. Only callable by the original issuer.

**Request Body**
```json
{
  "id": 7
}
```

**Response — Success**
```json
{
  "success": true,
  "txHash": "0xrevoke789txhash..."
}
```

---

### User — Get Credential IDs

**`GET /user/:address/credentials`**

Returns a list of on-chain credential IDs held by the given wallet address.

**Path Parameter**

| Parameter | Description |
|---|---|
| `address` | Wallet address of the credential holder |

**Example**
```
GET /user/0xHolderAddress123.../credentials
```

**Response — Success**
```json
{
  "success": true,
  "ids": [1, 4, 7, 8]
}
```

---

### User — Get Full Credentials

**`GET /user/:address/full`**

Returns the complete on-chain data for all credentials held by a wallet address.

**Path Parameter**

| Parameter | Description |
|---|---|
| `address` | Wallet address of the credential holder |

**Example**
```
GET /user/0xHolderAddress123.../full
```

**Response — Success**
```json
{
  "success": true,
  "credentials": [
    {
      "id": 7,
      "holder": "0xHolderAddress123...",
      "issuer": "0xIssuerAddress456...",
      "ipfsCID": "QmMeta456def...",
      "credentialHash": "0x9a3f...",
      "issuedAt": 1714000000,
      "expiresAt": 0,
      "revoked": false
    },
    {
      "id": 8,
      "holder": "0xHolderAddress123...",
      "issuer": "0xIssuerAddress456...",
      "ipfsCID": "QmMeta789ghi...",
      "credentialHash": "0xb7c2...",
      "issuedAt": 1714500000,
      "expiresAt": 1800000000,
      "revoked": false
    }
  ]
}
```

---

### Utility — Compute Hash

**`POST /hash`**

Locally computes the deterministic hash of a VC JSON object. Useful for verifying what the on-chain hash will be before issuing, or for manual hash lookups.

**Request Body**
```json
{
  "vcJSON": {
    "student": "Akshat Sharma",
    "degree": "B.Tech Computer Science",
    "issuer": "SOA University",
    "pdfCID": "QmXyz123abc...",
    "issuedAt": 1714000000000
  }
}
```

**Response — Success**
```json
{
  "success": true,
  "hash": "0x9a3fbc127d32f8..."
}
```

---

## Error Responses

All endpoints return a consistent error structure when something goes wrong:

```json
{
  "success": false,
  "error": "Descriptive error message here"
}
```

Common causes:

| Cause | Description |
|---|---|
| Invalid Pinata credentials | IPFS upload/fetch fails |
| Unauthorized issuer | Wallet not registered as issuer on-chain |
| Invalid CID | IPFS gateway returned non-JSON or 404 |
| Revoked credential | `valid: false` on verify endpoints |
| Contract revert | Smart contract rejected the transaction |

---

## Credential Lifecycle

```
Institution           IPFS (Pinata)          Smart Contract
    │                      │                      │
    │── Upload PDF ────────▶│                      │
    │◀─ pdfCID ────────────│                      │
    │── Upload Metadata ───▶│                      │
    │◀─ metadataCID ───────│                      │
    │── issueCredential ────────────────────────▶  │
    │◀─ credentialId + txHash ──────────────────   │
    │                      │                      │
Verifier                   │                      │
    │── verifyById/Hash ────────────────────────▶  │
    │◀─ valid: true/false ──────────────────────   │
```

---

## License

MIT