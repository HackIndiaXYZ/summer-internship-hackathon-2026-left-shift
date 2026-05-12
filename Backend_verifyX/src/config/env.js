const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN 
    ? process.env.FRONTEND_ORIGIN.split(',') 
    : ["http://localhost:3000", "https://verify-x-web-three.vercel.app"],
  mongodbUri: process.env.MONGODB_URI || ""
};

module.exports = { env };
