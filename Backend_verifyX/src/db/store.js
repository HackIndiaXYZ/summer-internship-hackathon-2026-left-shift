const mongoose = require("mongoose");
const crypto = require("crypto");
const { env } = require("../config/env");
const Credential = require("../models/Credential");
const UserProfile = require("../models/UserProfile");
const VerificationLog = require("../models/VerificationLog");
const Notification = require("../models/Notification");
const DocumentRequest = require("../models/DocumentRequest");

const memory = {
  credentials: [],
  profiles: [],
  verificationLogs: [],
  notifications: [],
  documentRequests: []
};

const state = {
  mode: "memory",
  connected: false
};

function serialize(doc) {
  if (!doc) return null;
  if (typeof doc.toObject === "function") {
    const object = doc.toObject({ versionKey: false });
    object.id = String(object._id);
    delete object._id;
    return object;
  }
  const object = { ...doc };
  if (object._id) {
    object.id = String(object._id);
    delete object._id;
  }
  return object;
}

function matchesFilter(item, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (value === undefined || value === null || value === "") return true;
    return String(item[key] || "").toLowerCase() === String(value).toLowerCase();
  });
}

async function connectDatabase() {
  if (!env.mongodbUri || env.mongodbUri === "memory") {
    state.mode = "memory";
    state.connected = true;
    return state;
  }

  await mongoose.connect(env.mongodbUri, {
    dbName: undefined,
    serverSelectionTimeoutMS: 10000
  });
  state.mode = "mongo";
  state.connected = true;
  return state;
}

async function countCredentials() {
  if (state.mode === "mongo") return Credential.countDocuments();
  return memory.credentials.length;
}

async function createProfile(profile) {
  if (state.mode === "mongo") return serialize(await UserProfile.create(profile));
  const now = new Date().toISOString();
  const item = { ...profile, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  memory.profiles.push(item);
  return item;
}

async function getUserByEmail(email) {
  if (!email) return null;
  if (state.mode === "mongo") return serialize(await UserProfile.findOne({ email: String(email).toLowerCase() }).lean());
  return memory.profiles.find((item) => item.email?.toLowerCase() === String(email).toLowerCase()) || null;
}

async function getUserById(id) {
  if (!id) return null;
  if (state.mode === "mongo") {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    if (!isObjectId) return null;
    return serialize(await UserProfile.findById(id).lean());
  }
  return memory.profiles.find((item) => item.id === id) || null;
}

async function upsertProfile(profile) {
  if (state.mode === "mongo") {
    const query = profile.walletAddress
        ? { walletAddress: profile.walletAddress }
        : { email: profile.email };
    return serialize(
      await UserProfile.findOneAndUpdate(query, { $set: profile }, { new: true, upsert: true, setDefaultsOnInsert: true })
    );
  }

  const index = memory.profiles.findIndex((item) =>
    (profile.walletAddress && item.walletAddress?.toLowerCase() === profile.walletAddress.toLowerCase()) ||
    (profile.email && item.email?.toLowerCase() === profile.email.toLowerCase())
  );
  const now = new Date().toISOString();
  if (index >= 0) {
    memory.profiles[index] = { ...memory.profiles[index], ...profile, updatedAt: now };
    return memory.profiles[index];
  }
  return createProfile(profile);
}

async function getProfile(filter) {
  if (state.mode === "mongo") return serialize(await UserProfile.findOne(filter).lean({ virtuals: true }));
  return memory.profiles.find((item) => matchesFilter(item, filter)) || null;
}

async function createCredential(credential) {
  if (state.mode === "mongo") return serialize(await Credential.create(credential));
  const now = new Date().toISOString();
  const item = { ...credential, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  memory.credentials.push(item);
  return item;
}

async function getCredentialByChainId(chainId) {
  const numericId = Number(chainId);
  if (!Number.isFinite(numericId)) return null;
  if (state.mode === "mongo") return serialize(await Credential.findOne({ chainId: numericId }).lean());
  return memory.credentials.find((item) => Number(item.chainId) === numericId) || null;
}

async function updateCredentialById(id, patch) {
  if (state.mode === "mongo") {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { credentialId: id }] } : { credentialId: id };
    return serialize(await Credential.findOneAndUpdate(query, { $set: patch }, { new: true }));
  }
  const index = memory.credentials.findIndex((item) => item.id === id || item.credentialId === id);
  if (index < 0) return null;
  memory.credentials[index] = { ...memory.credentials[index], ...patch, updatedAt: new Date().toISOString() };
  return memory.credentials[index];
}

async function listCredentials(filter = {}) {
  if (state.mode === "mongo") {
    const query = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== "") query[key] = value;
    }
    const docs = await Credential.find(query).sort({ createdAt: -1 }).limit(100).lean();
    return docs.map((doc) => serialize(doc));
  }
  return memory.credentials.filter((item) => matchesFilter(item, filter)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function getCredentialById(id) {
  if (state.mode === "mongo") {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { credentialId: id }] } : { credentialId: id };
    return serialize(await Credential.findOne(query).lean());
  }
  return memory.credentials.find((item) => item.id === id || item.credentialId === id) || null;
}

async function getCredentialByHash(hash) {
  if (state.mode === "mongo") return serialize(await Credential.findOne({ $or: [{ hash }, { credentialHash: hash }] }).lean());
  return memory.credentials.find((item) =>
    item.hash?.toLowerCase() === String(hash).toLowerCase() ||
    item.credentialHash?.toLowerCase() === String(hash).toLowerCase()
  ) || null;
}

async function listCredentialsByHolder(holder) {
  if (!holder) return [];
  if (state.mode === "mongo") {
    const docs = await Credential.find({
      $or: [
        { holder: new RegExp(`^${holder}$`, "i") },
        { studentWallet: new RegExp(`^${holder}$`, "i") }
      ]
    }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => serialize(doc));
  }
  return memory.credentials.filter((item) =>
    item.holder?.toLowerCase() === String(holder).toLowerCase() ||
    item.studentWallet?.toLowerCase() === String(holder).toLowerCase()
  );
}

async function createVerificationLog(log) {
  if (state.mode === "mongo") return serialize(await VerificationLog.create(log));
  const item = { ...log, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  memory.verificationLogs.push(item);
  return item;
}

async function listNotifications(filter = {}) {
  if (state.mode === "mongo") {
    const docs = await Notification.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return docs.map((doc) => serialize(doc));
  }
  return memory.notifications.filter((item) => matchesFilter(item, filter));
}

async function createNotification(notification) {
  if (state.mode === "mongo") return serialize(await Notification.create(notification));
  const item = { ...notification, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  memory.notifications.push(item);
  return item;
}

async function createDocumentRequest(request) {
  if (state.mode === "mongo") return serialize(await DocumentRequest.create(request));
  const now = new Date().toISOString();
  const item = { ...request, status: request.status || "pending", id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  memory.documentRequests.push(item);
  return item;
}

async function listDocumentRequests(filter = {}) {
  if (state.mode === "mongo") {
    const query = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== "") {
        query[key] = key === "institutionName" || key === "studentWallet"
          ? new RegExp(`^${String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
          : value;
      }
    }
    const docs = await DocumentRequest.find(query).sort({ createdAt: -1 }).limit(200).lean();
    return docs.map((doc) => serialize(doc));
  }
  return memory.documentRequests
    .filter((item) => matchesFilter(item, filter))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function updateDocumentRequestById(id, patch) {
  if (state.mode === "mongo") {
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    if (!isObjectId) return null;
    return serialize(await DocumentRequest.findByIdAndUpdate(id, { $set: patch }, { new: true }));
  }
  const index = memory.documentRequests.findIndex((item) => item.id === id);
  if (index < 0) return null;
  memory.documentRequests[index] = { ...memory.documentRequests[index], ...patch, updatedAt: new Date().toISOString() };
  return memory.documentRequests[index];
}

async function analytics() {
  const credentials = await listCredentials();
  const documentRequests = await listDocumentRequests();
  const total = credentials.length;
  const revoked = credentials.filter((item) => item.status === "revoked").length;
  const issued = credentials.filter((item) => item.status !== "revoked").length;
  const issuedRequests = documentRequests.filter((item) => item.status === "issued").length;
  const pendingRequests = documentRequests.filter((item) => item.status === "pending").length;
  const approvedRequests = documentRequests.filter((item) => item.status === "approved").length;
  const rejectedRequests = documentRequests.filter((item) => item.status === "rejected").length;

  return {
    totalRecords: total,
    issued,
    revoked,
    protocolScore: total ? Number((((issued - revoked) / total) * 100).toFixed(2)) : 100,
    documentRequests: documentRequests.length,
    issuedRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    storageMode: state.mode
  };
}

module.exports = {
  state,
  connectDatabase,
  createProfile,
  getUserByEmail,
  getUserById,
  upsertProfile,
  getProfile,
  createCredential,
  updateCredentialById,
  listCredentials,
  getCredentialById,
  getCredentialByChainId,
  getCredentialByHash,
  listCredentialsByHolder,
  createVerificationLog,
  listNotifications,
  createNotification,
  createDocumentRequest,
  listDocumentRequests,
  updateDocumentRequestById,
  analytics
};
