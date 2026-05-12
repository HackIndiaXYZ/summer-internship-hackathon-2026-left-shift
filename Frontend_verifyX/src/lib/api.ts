const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const OCR_API_BASE_URL = process.env.NEXT_PUBLIC_OCR_API_URL || "https://ocr-service-mv6q.onrender.com";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("content-type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }
  return payload as T;
}

export type Credential = {
  id?: string;
  credentialId: string;
  studentName: string;
  studentEmail: string;
  studentWallet?: string;
  degree: string;
  graduationDate?: string;
  issuerName: string;
  status: "pending" | "issued" | "verified" | "revoked" | "failed";
  hash: string;
  txHash?: string;
  network?: string;
  vc?: any;
  createdAt?: string;
};

export function issueCredential(payload: {
  studentName: string;
  studentEmail: string;
  studentWallet?: string;
  degree: string;
  graduationDate?: string;
  issuerName?: string;
}) {
  return request<{ credential: Credential; fraud: any }>("/credentials", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function listCredentials(query: Record<string, string> = {}) {
  const search = new URLSearchParams(
    Object.entries(query).filter(([, value]) => Boolean(value))
  ).toString();
  return request<{ credentials: Credential[] }>(`/credentials${search ? `?${search}` : ""}`);
}

export function getCredential(id: string) {
  return request<{ credential: Credential }>(`/credentials/${encodeURIComponent(id)}`);
}

export function verifyCredential(payload: { hash: string }) {
  return request<{
    verification: {
      result: "verified" | "revoked" | "not-found" | "failed";
      credential: Credential | null;
    };
  }>("/verify", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export type OcrDetectionResult = {
  success: boolean;
  filename?: string;
  tamperingScale: number;
  verdict: string;
  detectionRegions: Array<{
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
  elaImageUrl?: string | null;
};

export function detectDocumentTampering(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${OCR_API_BASE_URL.replace(/\/$/, "")}/detect`, {
    method: "POST",
    body: formData
  }).then(async (response) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success === false) {
      throw new Error(payload.error || payload.detail || `OCR request failed with status ${response.status}`);
    }

    const elaPath = payload.ela_image_url as string | undefined;
    const elaImageUrl = elaPath
      ? /^https?:\/\//i.test(elaPath)
        ? elaPath
        : `${OCR_API_BASE_URL.replace(/\/$/, "")}/${elaPath.replace(/^\//, "")}`
      : null;

    return {
      ocr: {
        success: Boolean(payload.success),
        filename: payload.filename,
        tamperingScale: Number(payload.tampering_scale ?? 0),
        verdict: payload.verdict || "Document analysis complete",
        detectionRegions: Array.isArray(payload.suspicious_regions) ? payload.suspicious_regions : [],
        elaImageUrl
      }
    };
  });
}

export type DocumentRequest = {
  id: string;
  studentWallet: string;
  studentProfileId?: string;
  studentName?: string;
  studentEmail?: string;
  institutionName: string;
  documentType: string;
  purpose?: string;
  status: "pending" | "approved" | "rejected" | "issued";
  responseMessage?: string;
  credentialHash?: string;
  txHash?: string;
  metadataCID?: string;
  pdfCID?: string;
  issuedCredentialId?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type Notification = {
  id: string;
  recipientEmail?: string;
  recipientWallet?: string;
  type: string;
  title: string;
  message: string;
  read?: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
};

export type AnalyticsOverview = {
  totalRecords: number;
  issued: number;
  revoked: number;
  protocolScore: number;
  documentRequests: number;
  issuedRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  storageMode: string;
};

export function createDocumentRequest(payload: {
  studentWallet: string;
  studentProfileId?: string;
  studentName?: string;
  studentEmail?: string;
  institutionName: string;
  documentType: string;
  purpose?: string;
}) {
  return request<{ request: DocumentRequest }>("/document-requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function listDocumentRequests(query: Record<string, string> = {}) {
  const search = new URLSearchParams(
    Object.entries(query).filter(([, value]) => Boolean(value))
  ).toString();
  return request<{ requests: DocumentRequest[] }>(`/document-requests${search ? `?${search}` : ""}`);
}

export function updateDocumentRequest(id: string, payload: Partial<DocumentRequest>) {
  return request<{ request: DocumentRequest }>(`/document-requests/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function listNotifications(query: Record<string, string> = {}) {
  const search = new URLSearchParams(
    Object.entries(query).filter(([, value]) => Boolean(value))
  ).toString();
  return request<{ notifications: Notification[] }>(`/notifications${search ? `?${search}` : ""}`);
}

export function getAnalyticsOverview() {
  return request<{ overview: AnalyticsOverview }>("/analytics/overview");
}
