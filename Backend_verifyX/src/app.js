const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { env } = require("./config/env");
const store = require("./db/store");

const credentialRoutes = require("./routes/credentials");
const verifyRoutes = require("./routes/verify");
const notificationRoutes = require("./routes/notifications");
const analyticsRoutes = require("./routes/analytics");
const documentRequestRoutes = require("./routes/documentRequests");

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "verifyx-backend",
    storage: store.state.mode,
    auth: "metamask-frontend-only"
  });
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/credentials", credentialRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/document-requests", documentRequestRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    success: false,
    error: error.message || "Internal server error"
  });
});

module.exports = { app };
