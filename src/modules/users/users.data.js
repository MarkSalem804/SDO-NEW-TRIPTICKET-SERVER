const prisma = require("../../utils/prisma");

class UsersData {
  async createUser(data) {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password, 
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || "ADMINISTRATOR",
        status: data.status || "ACTIVE",
        plantillaLocation: data.plantillaLocation,
        officeId: data.officeId ? parseInt(data.officeId) : null,
        positionTitle: data.positionTitle,
      },
    });
  }

  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async getAllUsers() {
    return await prisma.user.findMany({
      include: { office: true },
    });
  }

  async getUserById(id) {
    return await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { office: true },
    });
  }

  async updateUser(id, data) {
    const payload = { ...data };
    if (payload.officeId) payload.officeId = parseInt(payload.officeId);
    if (payload.id) delete payload.id; // Ensure ID is not in data for update

    return await prisma.user.update({
      where: { id: parseInt(id) },
      data: payload,
    });
  }

  async deleteUser(id) {
    return await prisma.user.delete({
      where: { id: parseInt(id) },
    });
  }

  // Token Operations
  async createRefreshToken(userId, token) {
    return await prisma.refreshToken.create({
      data: { userId: parseInt(userId), token, updatedAt: new Date() },
    });
  }

  async findRefreshToken(token) {
    return await prisma.refreshToken.findFirst({
      where: { token },
      include: { user: true }
    });
  }

  async deleteRefreshToken(token) {
    return await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId) {
    return await prisma.refreshToken.deleteMany({
      where: { userId: parseInt(userId) },
    });
  }

  async createSessionToken(userId, token) {
    return await prisma.sessionToken.create({
      data: { userId: parseInt(userId), token, updatedAt: new Date() },
    });
  }

  // OTP Operations
  async createOTP(userId, code, expiresAt) {
    return await prisma.otp.create({
      data: {
        userId: parseInt(userId),
        code,
        expiresAt,
      },
    });
  }

  async findOTP(userId, code) {
    return await prisma.otp.findFirst({
      where: {
        userId: parseInt(userId),
        code,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async deleteUserOTPs(userId) {
    return await prisma.otp.deleteMany({
      where: { userId: parseInt(userId) },
    });
  }
}

module.exports = new UsersData();
