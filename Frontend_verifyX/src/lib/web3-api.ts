const WEB3_API_BASE_URL = process.env.NEXT_PUBLIC_WEB3_API_URL || "";

function web3Url(path: string) {
  if (!WEB3_API_BASE_URL) {
    throw new Error("Credential registry is not available right now.");
  }
  return `${WEB3_API_BASE_URL.replace(/\/$/, "")}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(web3Url(path), options);
  } catch {
    throw new Error("Credential registry is unreachable right now. Please try again when the registry service is available.");
  }

  const text = await response.text();
  const payload = text ? (() => {
    try {
      return JSON.parse(text);
    } catch {
      return { error: text };
    }
  })() : {};

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Web3 API request failed with status ${response.status}`);
  }

  return payload as T;
}

export type Web3FullIssueResponse = {
  success: true;
  pdfCID: string;
  metadataCID: string;
  credentialId: number;
  txHash: string;
  credentialHash: string;
};

export type Web3VerifyHashResponse = {
  success: true;
  valid: boolean;
};

export type Web3CredentialResponse = {
  success: true;
  data: {
    id: number;
    holder: string;
    issuer: string;
    ipfsCID: string;
    credentialHash: string;
    issuedAt: number;
    expiresAt: number;
    revoked: boolean;
  };
};

export type Web3UserCredentialsResponse = {
  success: true;
  credentials: Web3CredentialResponse["data"][];
};

export type Web3PdfResponse = {
  success: true;
  pdfCID: string;
  pdfUrl: string;
};

export function fullIssueCredential(formData: FormData) {
  return request<Web3FullIssueResponse>("/credential/full-issue", {
    method: "POST",
    body: formData
  });
}

export function verifyCredentialHash(hash: string) {
  return request<Web3VerifyHashResponse>("/credential/verify/hash", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hash })
  });
}

export function getWeb3Credential(id: string | number) {
  return request<Web3CredentialResponse>(`/credential/${encodeURIComponent(String(id))}`);
}

export function getUserFullCredentials(address: string) {
  return request<Web3UserCredentialsResponse>(`/user/${encodeURIComponent(address)}/full`);
}

export function getPdfFromMetadata(metadataCID: string) {
  return request<Web3PdfResponse>(`/ipfs/pdf/${encodeURIComponent(metadataCID)}`);
}
