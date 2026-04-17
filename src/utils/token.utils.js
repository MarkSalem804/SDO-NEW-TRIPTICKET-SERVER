const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

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

  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/"
  }
};

module.exports = tokenUtils;
