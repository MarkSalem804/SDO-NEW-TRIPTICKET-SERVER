const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

const tokenUtils = {
  generateAccessToken: (user) => {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      process.env.ACCESS_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id }, 
      process.env.REFRESH_SECRET, 
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  },

  verifyAccessToken: (token) => {
    return jwt.verify(token, process.env.ACCESS_SECRET);
  },

  verifyRefreshToken: (token) => {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  },

  get cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production", // Automatically secures cookies in HTTPS production, allows plain HTTP for local dev
      sameSite: process.env.COOKIE_SAME_SITE || "lax",
      maxAge: process.env.COOKIE_MAX_AGE ? parseInt(process.env.COOKIE_MAX_AGE) : 7 * 24 * 60 * 60 * 1000, // Default to 7 days
      path: "/"
    };
  }
};

module.exports = tokenUtils;
