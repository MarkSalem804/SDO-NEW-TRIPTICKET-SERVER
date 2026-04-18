const usersData = require("./users.data");
const tokenUtils = require("../../utils/token.utils");
const sendEmail = require("../../utils/sendEmail");
const bcrypt = require("bcrypt");

class UsersService {
  generateRandomPassword(length = 12) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const all = uppercase + lowercase + numbers + symbols;
    
    let password = "";
    // Ensure at least one of each for security
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = 0; i < length - 4; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  async register(data) {
    console.log(`[AUTH] Registering new user: ${data.email}`);
    const existingUser = await usersData.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    const generatedPassword = this.generateRandomPassword();
    const payload = { ...data };
    
    // Hash before saving
    payload.password = await bcrypt.hash(generatedPassword, 12);
    
    const user = await usersData.createUser(payload);
    
    // Send email with original generated password
    try {
      console.log(`[MAIL] Sending credentials to: ${user.email}`);
      await sendEmail(
        user.email,
        "SDO - Trip Ticket | Account Created",
        `Your account has been created. Your temporary password is: ${generatedPassword}`,
        `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
          <h2 style="color: #333;">Welcome to SDO Trip Ticket System</h2>
          <p>Your administrative account has been professionally registered.</p>
          <p>Your temporary login credentials are:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>Email:</strong> ${user.email}<br>
            <strong>Password:</strong> <span style="font-family: monospace; font-size: 18px; color: #d946ef; font-weight: bold;">${generatedPassword}</span>
          </div>
          <p style="color: #666; font-size: 14px;">For security, please change your password after logging in for the first time.</p>
        </div>
        `
      );
    } catch (err) {
      console.error("[MAIL] Failed to send registration email:", err);
    }
    
    return user;
  }

  async login(email, password) {
    const user = await usersData.findUserByEmail(email);
    if (!user) {
      throw { message: "Account not found", status: 401 };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { message: "Invalid credentials", status: 401 };
    }

    if (user.mfaEnabled) {
      await this.sendOTP(user.id);
      return { mfaRequired: true, userId: user.id };
    }

    if (user.pincodeEnabled) {
      console.log(`[AUTH] PIN code required for user: ${user.email}`);
      return { pincodeRequired: true, userId: user.id, email: user.email };
    }

    return await this.generateUserTokens(user);
  }

  async loginWithPin(email, pinCode) {
    const user = await usersData.findUserByEmail(email);
    if (!user || !user.pincodeEnabled || user.pincode !== pinCode) {
      throw new Error("Invalid PIN credentials");
    }

    if (user.mfaEnabled) {
      await this.sendOTP(user.id);
      return { mfaRequired: true, userId: user.id };
    }

    return await this.generateUserTokens(user);
  }

  async sendOTP(userId) {
    const user = await usersData.getUserById(userId);
    if (!user) throw new Error("User not found");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await usersData.deleteUserOTPs(userId);
    await usersData.createOTP(userId, code, expiresAt);

    await sendEmail(
      user.email,
      "SDO - Trip Ticket | Verification Code",
      `Your verification code is: ${code}`,
      `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Your 6-digit verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1a1a1a; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
      </div>
      `
    );
  }

  async verifyOTP(userId, code) {
    const storedOTP = await usersData.findOTP(userId, code);
    if (!storedOTP) throw new Error("Invalid or expired verification code");

    const user = await usersData.getUserById(userId);
    await usersData.deleteUserOTPs(userId);

    return await this.generateUserTokens(user);
  }

  async generateUserTokens(user) {
    console.log(`[AUTH] Generating tokens for user: ${user.email} (ID: ${user.id})`);
    const { password: userPassword, ...userData } = user;
    
    const accesstoken = tokenUtils.generateAccessToken(userData);
    const refreshtoken = tokenUtils.generateRefreshToken(userData);

    // Persist session (access token) and refresh token in DB
    await Promise.all([
      usersData.deleteUserRefreshTokens(user.id),
      // Optional: if you want to allow only one active session at a time, uncomment below
      // prisma.sessionToken.deleteMany({ where: { userId: user.id } }) 
    ]);

    console.log(`[AUTH] Saving session token to database...`);
    const session = await usersData.createSessionToken(user.id, accesstoken);
    console.log(`[AUTH] Session created with ID: ${session.id}`);

    await usersData.createRefreshToken(user.id, refreshtoken);

    return { user: userData, accesstoken, refreshtoken };
  }

  async refreshToken(token) {
    if (!token) throw new Error("No refresh token provided");

    // Check if token exists in DB
    const storedToken = await usersData.findRefreshToken(token);
    if (!storedToken) {
      console.warn("[AUTH] Invalid refresh token attempt detected.");
      throw new Error("Invalid refresh token");
    }

    try {
      // Verify token authenticity
      const decoded = tokenUtils.verifyRefreshToken(token);
      
      const user = await usersData.getUserById(decoded.id);
      if (!user) throw new Error("User associated with token no longer exists");

      const { password, ...userData } = user;
      
      // ROTATION: Generate NEW access and refresh tokens
      const newAccessToken = tokenUtils.generateAccessToken(userData);
      const newRefreshToken = tokenUtils.generateRefreshToken(userData);
      
      // Clean up OLD token and handle persistence
      await Promise.all([
        usersData.deleteRefreshToken(token),
        usersData.createRefreshToken(user.id, newRefreshToken),
        usersData.createSessionToken(user.id, newAccessToken)
      ]);
      
      return { 
        accesstoken: newAccessToken, 
        refreshtoken: newRefreshToken, 
        user: userData 
      };
    } catch (err) {
      // Token is expired or invalid
      await usersData.deleteRefreshToken(token);
      console.error(`[AUTH] Silent refresh failed: ${err.message}`);
      throw new Error("Session expired, please login again");
    }
  }

  async logout(token) {
    if (token) {
      await usersData.deleteRefreshToken(token);
    }
    return { message: "Logout successful" };
  }

  async getAllUsers() {
    return await usersData.getAllUsers();
  }

  async getUserById(id) {
    return await usersData.getUserById(id);
  }

  async updateUser(id, data) {
    return await usersData.updateUser(id, data);
  }

  async deleteUser(id) {
    return await usersData.deleteUser(id);
  }

  async deactivateUser(id) {
    return await usersData.updateUser(id, { status: "DEACTIVATED" });
  }

  async activateUser(id) {
    return await usersData.updateUser(id, { status: "ACTIVE" });
  }

  async resetPassword(id, newPassword) {
    const user = await usersData.getUserById(id);
    if (!user) throw new Error("User not found");

    const finalPassword = newPassword || this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(finalPassword, 12);
    
    await usersData.updateUser(id, { password: hashedPassword });

    // Send email with new password
    try {
      console.log(`[MAIL] Sending reset credentials to: ${user.email}`);
      await sendEmail(
        user.email,
        "SDO - Trip Ticket | Password Reset",
        `Your password has been reset. Your new temporary password is: ${generatedPassword}`,
        `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
          <h2 style="color: #333;">Password Reset Successful</h2>
          <p>Your password for the SDO Trip Ticket System has been reset by an administrator.</p>
          <p>Your new temporary login credentials are:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong>Email:</strong> ${user.email}<br>
            <strong>New Password:</strong> <span style="font-family: monospace; font-size: 18px; color: #d946ef; font-weight: bold;">${generatedPassword}</span>
          </div>
          <p style="color: #666; font-size: 14px;">Please change your password after logging in.</p>
        </div>
        `
      );
    } catch (err) {
      console.error("[MAIL] Failed to send reset email:", err);
    }

    return { success: true, newPassword: finalPassword };
  }

  async changeUserPassword(id, currentPassword, newPassword) {
    const user = await usersData.getUserById(id);
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Incorrect current password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    return await usersData.updateUser(id, { password: hashedPassword });
  }

  async updateMFASettings(userId, enabled) {
    return await usersData.updateUser(userId, { mfaEnabled: !!enabled });
  }

  async setUserPinCode(userId, pinCode) {
    // Optionally hash the PIN, but if the user wants quick login we might store as is
    // Let's store as is for now as per schema db.Text
    return await usersData.updateUser(userId, { 
      pincode: pinCode,
      pincodeEnabled: true 
    });
  }

  async togglePinCode(userId, enabled) {
    const user = await usersData.getUserById(userId);
    if (enabled && !user.pincode) {
      throw new Error("No PIN configured. Please set a PIN first.");
    }
    return await usersData.updateUser(userId, { pincodeEnabled: !!enabled });
  }
}

module.exports = new UsersService();
