const { sha256Hex, shortId } = require("../utils/hash");

function buildCredentialPayload(input, issuer) {
  const credentialId = input.credentialId || shortId("CERT");
  const issuerName = input.issuerName || issuer?.institutionName || issuer?.fullName || "VerifyX Institution";
  const issuedAt = input.issuedAt || new Date().toISOString();

  const vc = {
    "@context": ["https://www.w3.org/2018/credentials/v1", "https://verifyx.local/contexts/academic/v1"],
    id: `urn:verifyx:credential:${credentialId}`,
    type: ["VerifiableCredential", "AcademicCredential"],
    issuer: {
      id: issuer?.id || "did:verifyx:issuer:dev",
      name: issuerName
    },
    issuanceDate: issuedAt,
    credentialSubject: {
      id: input.studentWallet ? `did:pkh:eip155:137:${input.studentWallet}` : `mailto:${input.studentEmail}`,
      name: input.studentName,
      email: input.studentEmail,
      walletAddress: input.studentWallet || null,
      achievement: {
        title: input.degree,
        graduationDate: input.graduationDate || null
      }
    }
  };

  const hash = sha256Hex(vc);

  return {
    credentialId,
    issuerName,
    vc,
    hash
  };
}

module.exports = { buildCredentialPayload };
