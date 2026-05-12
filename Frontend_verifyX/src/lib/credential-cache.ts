type CachedCredential = {
  credentialHash: string;
  studentProfileId?: string;
  credentialId?: number;
  txHash?: string;
  metadataCID?: string;
  pdfCID?: string;
  studentName?: string;
  studentEmail?: string;
  degree?: string;
  graduationDate?: string;
  issuerName?: string;
  holder?: string;
  issuedAt: string;
};

const CACHE_KEY = "verifyx_issued_credentials";

function readCache(): CachedCredential[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getCachedCredentials() {
  return readCache();
}

export function saveCachedCredential(credential: CachedCredential) {
  if (typeof window === "undefined" || !credential.credentialHash) return;
  const cache = readCache().filter((item) => item.credentialHash.toLowerCase() !== credential.credentialHash.toLowerCase());
  localStorage.setItem(CACHE_KEY, JSON.stringify([credential, ...cache].slice(0, 100)));
}

export function getCachedCredential(hash: string) {
  if (!hash) return null;
  return readCache().find((item) => item.credentialHash.toLowerCase() === hash.toLowerCase()) || null;
}

export function getCachedCredentialForProfile(hash: string, profileId?: string) {
  const credential = getCachedCredential(hash);
  if (!credential) return null;
  if (!profileId) return credential;
  return credential.studentProfileId === profileId ? credential : null;
}
