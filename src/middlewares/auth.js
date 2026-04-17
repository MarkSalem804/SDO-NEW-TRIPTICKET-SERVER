const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { getEffectivePermissions } = require("./permissions");
const crypto = require("crypto");

/**
 * Generates the essential user data payload for the access token
 * Ensures roles and permissions are always included
 */
const getUserAuthPayload = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true }
  });

  if (!user) throw new Error("User not found");

  const effectivePermissions = await getEffectivePermissions(userId);
  const userRoles = await prisma.userrole.findMany({
    where: { userId },
    include: { role: true }
  });

  const roles = userRoles.map(ur => ur.role.name);

  return {
    id: user.id,
    email: user.email,
    roles,
    permissions: effectivePermissions.map(p => p.name)
  };
};

const generateTokens = async (user) => {
  // Use the helper to get the full token payload
  const payload = await getUserAuthPayload(user.id);

  // Access token
  const accesstoken = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: "15m" });

  // Refresh token
  const refreshtoken = jwt.sign({ id: user.id, jti: crypto.randomUUID() }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

  // Session token
  const sessiontoken = jwt.sign({ id: user.id, jti: crypto.randomUUID() }, process.env.SESSION_SECRET, { expiresIn: "30d" });

  await prisma.refreshtoken.create({
    data: { userId: user.id, token: refreshtoken, expiresAt: new Date(Date.now() + 7*24*60*60*1000), revoked: false }
  });
  await prisma.sessiontoken.create({
    data: { userId: user.id, token: sessiontoken, expiresAt: new Date(Date.now() + 30*24*60*60*1000), isActive: true }
  });

  return { accesstoken, refreshtoken, sessiontoken };
};

const rotateRefreshToken = async (oldToken) => {
  try {
    const decoded = jwt.verify(oldToken, process.env.REFRESH_SECRET);

    const stored = await prisma.refreshtoken.findUnique({ where: { token: oldToken } });
    if (!stored) throw new Error("Refresh token not found");

    if (stored.revoked) {
      await prisma.refreshtoken.updateMany({
        where: { userId: decoded.id },
        data: { revoked: true }
      });
      throw new Error("Refresh token reuse detected. All sessions revoked.");
    }

    // Normal rotation: revoke old token
    await prisma.refreshtoken.update({
      where: { token: oldToken },
      data: { revoked: true }
    });

    // Fix: Re-fetch FULL payload including roles and email, not just permissions
    const payload = await getUserAuthPayload(decoded.id);

    // Issue new tokens
    const accesstoken = jwt.sign(payload, process.env.ACCESS_SECRET, { expiresIn: "15m" });
    const newRefreshToken = jwt.sign({ id: decoded.id, jti: crypto.randomUUID() }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

    await prisma.refreshtoken.create({
      data: { userId: decoded.id, token: newRefreshToken, expiresAt: new Date(Date.now() + 7*24*60*60*1000), revoked: false }
    });

    return { accesstoken, refreshtoken: newRefreshToken };
  } catch (err) {
    throw new Error(err.message || "Refresh token expired or invalid");
  }
};

module.exports = { generateTokens, rotateRefreshToken, getUserAuthPayload };
