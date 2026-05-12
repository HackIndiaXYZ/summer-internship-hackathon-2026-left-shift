export type WalletRole = "student" | "institution";

export type WalletSession = {
  profileId: string;
  address: string;
  role: WalletRole;
  fullName?: string;
  email?: string;
  institutionName?: string;
  connectedAt: string;
};

const SESSION_KEY = "verifyx_wallet_session";
const PROFILES_KEY = "verifyx_wallet_profiles";

function normalize(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

export function createProfileId(input: {
  address: string;
  role: WalletRole;
  email?: string;
  fullName?: string;
  institutionName?: string;
}) {
  const nameAndInstitution = [normalize(input.fullName), normalize(input.institutionName)]
    .filter(Boolean)
    .join(":");
  const identity = input.role === "student"
    ? normalize(input.email) || nameAndInstitution || normalize(input.address)
    : normalize(input.institutionName) || normalize(input.email) || normalize(input.address);
  return `${input.role}:${normalize(input.address)}:${identity}`;
}

export function shortWallet(address?: string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getWalletSession(): WalletSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as WalletSession;
    const profileId = createProfileId(session);
    if (session.profileId !== profileId) {
      session.profileId = profileId;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveWalletSession(session: Omit<WalletSession, "connectedAt" | "profileId"> & { connectedAt?: string; profileId?: string }) {
  if (typeof window === "undefined") return;
  const next: WalletSession = {
    ...session,
    profileId: session.profileId || createProfileId(session),
    connectedAt: session.connectedAt || new Date().toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  saveWalletProfile(next);
  window.dispatchEvent(new Event("verifyx-wallet-session"));
}

export function clearWalletSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("verifyx-wallet-session"));
}

export async function revokeMetaMaskPermissions() {
  if (typeof window === "undefined" || !(window as any).ethereum) return false;
  try {
    await (window as any).ethereum.request({
      method: "wallet_revokePermissions",
      params: [{ eth_accounts: {} }]
    });
    return true;
  } catch {
    return false;
  }
}

export async function logoutWalletSession({ revokeWallet = false } = {}) {
  clearWalletSession();
  if (revokeWallet) await revokeMetaMaskPermissions();
}

export function saveWalletProfile(profile: WalletSession) {
  if (typeof window === "undefined") return;
  const profileId = profile.profileId || createProfileId(profile);
  const profiles = getWalletProfiles().filter((item) => item.profileId !== profileId);
  localStorage.setItem(PROFILES_KEY, JSON.stringify([profile, ...profiles].slice(0, 200)));
}

export function getWalletProfiles(): WalletSession[] {
  if (typeof window === "undefined") return [];
  try {
    const profiles = JSON.parse(localStorage.getItem(PROFILES_KEY) || "[]") as WalletSession[];
    const normalized = profiles.map((profile) => ({
      ...profile,
      profileId: createProfileId(profile)
    }));
    const uniqueProfiles = normalized.filter((profile, index, all) =>
      all.findIndex((item) => item.profileId === profile.profileId) === index
    );
    if (JSON.stringify(uniqueProfiles) !== JSON.stringify(profiles)) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(uniqueProfiles));
    }
    return uniqueProfiles;
  } catch {
    localStorage.removeItem(PROFILES_KEY);
    return [];
  }
}
