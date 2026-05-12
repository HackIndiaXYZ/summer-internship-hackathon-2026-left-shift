import fs from "fs";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";

dotenv.config();

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

export async function testPinata() {
  try {
    const res = await pinata.testAuthentication();
    console.log("Pinata connected:", res);
    return true;
  } catch (err) {
    console.error("Pinata error:", err.message);
    return false;
  }
}

export async function uploadPDF(filePath) {
  const stream = fs.createReadStream(filePath);

  const result = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name: "credential.pdf" }
  });

  console.log("PDF CID:", result.IpfsHash);
  return result.IpfsHash;
}

export async function uploadMetadata(vcJSON) {
  const result = await pinata.pinJSONToIPFS(vcJSON, {
    pinataMetadata: { name: "credential-metadata" }
  });

  console.log("Metadata CID:", result.IpfsHash);
  return result.IpfsHash;
}

export async function uploadCredential({
  filePath,
  studentName,
  degree,
  issuer
}) {
  try {
    const pdfCID = await uploadPDF(filePath);

    const vcJSON = {
      student: studentName,
      degree,
      issuer,
      pdfCID,
      issuedAt: Date.now()
    };

    console.log("VC JSON:", vcJSON);

    const metadataCID = await uploadMetadata(vcJSON);

    return {
      pdfCID,
      metadataCID,
      vcJSON
    };

  } catch (err) {
    throw new Error("Upload flow failed: " + err.message);
  }
}

export function getIPFSUrl(cid) {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}

export async function fetchMetadata(metadataCID) {
  try {
    const url = getIPFSUrl(metadataCID);
    const res = await fetch(url);

    if (!res.ok) throw new Error("Failed to fetch metadata");

    return await res.json();

  } catch (err) {
    throw new Error("Metadata fetch error: " + err.message);
  }
}

export async function fetchPDFfromMetadata(metadataCID) {
  try {
    const metadata = await fetchMetadata(metadataCID);
    const pdfCID = metadata.pdfCID;

    return {
      pdfCID,
      pdfUrl: getIPFSUrl(pdfCID),
      metadata
    };

  } catch (err) {
    throw new Error("PDF fetch error: " + err.message);
  }
}