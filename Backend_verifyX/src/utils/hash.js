const crypto = require("crypto");

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortValue(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(sortValue(value));
}

function sha256Hex(value) {
  const input = typeof value === "string" || Buffer.isBuffer(value) ? value : canonicalJson(value);
  return `0x${crypto.createHash("sha256").update(input).digest("hex")}`;
}

function shortId(prefix = "CERT") {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${date}-${random}`;
}

module.exports = { canonicalJson, sha256Hex, shortId };
