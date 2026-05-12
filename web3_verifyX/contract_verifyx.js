import { ethers } from "ethers";
import dotenv from "dotenv";
import stringify from "json-stable-stringify";

dotenv.config();

export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
export const AMOY_CHAIN_ID = 80002;
export const AMOY_RPC = process.env.RPC_URL;

export const ABI = [
  "function owner() view returns (address)",
  "function credentialCounter() view returns (uint256)",
  "function authorizedIssuers(address) view returns (bool)",
  "function addAuthorizedIssuer(address)",
  "function removeAuthorizedIssuer(address)",
  "function issueCredential(address,string,bytes32,uint256) returns (uint256)",
  "function revokeCredential(uint256)",
  "function verifyCredential(bytes32) view returns (bool)",
  "function isValid(uint256) view returns (bool)",
  "function getCredential(uint256) view returns (tuple(address issuer,address holder,string ipfsCID,bytes32 credentialHash,uint256 issuedAt,uint256 expiresAt,bool revoked))",
  "function getHolderCredentials(address) view returns (uint256[])",
  "function issuedHashes(bytes32) view returns (bool)",
  "event CredentialIssued(uint256 indexed id,address indexed issuer,address indexed holder,bytes32 credentialHash,string ipfsCID,uint256 issuedAt,uint256 expiresAt)"
];

export function getProvider() {
  return new ethers.JsonRpcProvider(AMOY_RPC);
}

export async function getSigner() {
  const ethereum = window.phantom?.ethereum ?? window.ethereum;
  if (!ethereum) throw new Error("No wallet found");

  await ethereum.request({ method: "eth_requestAccounts" });

  const provider = new ethers.BrowserProvider(ethereum);
  const network = await provider.getNetwork();

  if (Number(network.chainId) !== AMOY_CHAIN_ID) {
    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: "0x13882",
        chainName: "Polygon Amoy",
        rpcUrls: [AMOY_RPC],
        nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
        blockExplorerUrls: ["https://amoy.polygonscan.com"]
      }]
    });
  }

  return provider.getSigner();
}

export function getBackendSigner() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

export function getReadContract() {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, getProvider());
}

export async function getWriteContract() {
  if (typeof window === "undefined") {
    const signer = getBackendSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function addIssuer(address) {
  const contract = await getWriteContract();
  const tx = await contract.addAuthorizedIssuer(address);
  await tx.wait();
  return tx.hash;
}

export function computeCredentialHash(vcJSON) {
  const stable = stringify(vcJSON);
  return ethers.keccak256(ethers.toUtf8Bytes(stable));
}

export async function issueCredential({ holder, ipfsCID, vcJSON, expiresAt = 0 }) {
  const hash = computeCredentialHash(vcJSON);
  const read = getReadContract();
  const used = await read.issuedHashes(hash);

  if (used) throw new Error("Already issued");

  const contract = await getWriteContract();

  const tx = await contract.issueCredential(
    holder,
    ipfsCID,
    hash,
    expiresAt
  );

  const receipt = await tx.wait();
  const iface = new ethers.Interface(ABI);

  let id = null;

  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed.name === "CredentialIssued") {
        id = Number(parsed.args.id);
        break;
      }
    } catch {}
  }

  return {
    credentialId: id,
    txHash: tx.hash,
    credentialHash: hash
  };
}

export async function verifyByHash(hash) {
  const contract = getReadContract();
  return await contract.verifyCredential(hash);
}

export async function verifyById(id) {
  const contract = getReadContract();
  return await contract.isValid(id);
}

export async function revokeCredential(id) {
  const contract = await getWriteContract();
  const tx = await contract.revokeCredential(id);
  await tx.wait();
  return tx.hash;
}

export async function getCredential(id) {
  const contract = getReadContract();
  const raw = await contract.getCredential(id);

  return {
    id,
    issuer: raw.issuer,
    holder: raw.holder,
    ipfsCID: raw.ipfsCID,
    credentialHash: raw.credentialHash,
    issuedAt: Number(raw.issuedAt),
    expiresAt: Number(raw.expiresAt),
    revoked: raw.revoked
  };
}

export async function getHolderCredentials(address) {
  const contract = getReadContract();
  const ids = await contract.getHolderCredentials(address);
  return ids.map(Number);
}

export async function getAllCredentials(address) {
  const ids = await getHolderCredentials(address);
  return Promise.all(ids.map(getCredential));
}