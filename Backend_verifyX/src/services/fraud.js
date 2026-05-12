async function scoreCredential(input, store) {
  const similar = await store.listCredentials({
    studentEmail: input.studentEmail,
    degree: input.degree
  });

  const duplicateCount = similar.filter((item) => item.status !== "revoked").length;
  const score = Math.min(100, duplicateCount * 35);

  return {
    score,
    flags: duplicateCount > 0 ? ["possible_duplicate"] : [],
    duplicateCount
  };
}

module.exports = { scoreCredential };
