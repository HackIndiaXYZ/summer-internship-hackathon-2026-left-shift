const { app } = require("./app");
const { env } = require("./config/env");
const store = require("./db/store");

async function start() {
  const dbState = await store.connectDatabase();

  app.listen(env.port, () => {
    console.log(`VerifyX backend running on http://localhost:${env.port}`);
    console.log(`Storage mode: ${dbState.mode}`);
  });
}

start().catch((error) => {
  console.error("Failed to start VerifyX backend", error);
  process.exit(1);
});
