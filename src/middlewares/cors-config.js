const cors = require("cors");

const corsConfig = () => {
  const options = {
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "https://your-production-domain.com"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
    credentials: true
  };

  return cors(options);
};

module.exports = corsConfig;
