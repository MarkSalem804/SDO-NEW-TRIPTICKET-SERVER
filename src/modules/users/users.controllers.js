const usersService = require("./users.services");
const tokenUtils = require("../../utils/token.utils");

class UsersController {
  async register(req, res) {
    try {
      const user = await usersService.register(req.body);
      const { password: userPassword, ...userData } = user;
      res.status(201).json({ message: "User registered successfully", user: userData });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      console.log(`[AUTH] Login attempt for: ${email}`);
      
      const result = await usersService.login(email, password);

      if (result.mfaRequired) {
        console.log(`[AUTH] MFA required for user ID: ${result.userId}`);
        return res.status(200).json({ mfaRequired: true, userId: result.userId });
      }

      // Set cookie for silent refresh
      res.cookie("refreshtoken", result.refreshtoken, tokenUtils.cookieOptions);

      console.log(`[AUTH] Login successful for: ${email}`);
      res.status(200).json({ 
        message: "Login successful", 
        user: result.user, 
        accesstoken: result.accesstoken
      });
    } catch (error) {
      console.error(`[AUTH] Login FAILED for: ${req.body.email} - Reason: ${error.message}`);
      res.status(401).json({ message: error.message });
    }
  }

  async loginWithPin(req, res) {
    try {
      const { email, pin } = req.body;
      const result = await usersService.loginWithPin(email, pin);

      if (result.mfaRequired) {
        return res.status(200).json({ mfaRequired: true, userId: result.userId });
      }

      res.cookie("refreshtoken", result.refreshtoken, tokenUtils.cookieOptions);
      res.status(200).json({ message: "Login successful", user: result.user, accesstoken: result.accesstoken });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { userId, code } = req.body;
      const result = await usersService.verifyOTP(userId, code);

      res.cookie("refreshtoken", result.refreshtoken, tokenUtils.cookieOptions);
      res.status(200).json({ user: result.user, accesstoken: result.accesstoken });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async resendOTP(req, res) {
    try {
      const { userId } = req.body;
      await usersService.sendOTP(userId);
      res.status(200).json({ message: "OTP resent successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async refresh(req, res) {
    try {
      const token = req.cookies.refreshtoken;
      const { accesstoken, refreshtoken, user } = await usersService.refreshToken(token);
      
      // Update the secure cookie with the new rotated refresh token
      res.cookie("refreshtoken", refreshtoken, tokenUtils.cookieOptions);
      
      res.status(200).json({ accesstoken, user });
    } catch (error) {
      res.clearCookie("refreshtoken", tokenUtils.cookieOptions);
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req, res) {
    try {
      const token = req.cookies.refreshtoken;
      await usersService.logout(token);
      res.clearCookie("refreshtoken", tokenUtils.cookieOptions);
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMe(req, res) {
    try {
      const user = await usersService.getUserById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password, ...userData } = user;
      res.status(200).json(userData);
    } catch (error) {
      res.status(401).json({ message: "Not authenticated" });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await usersService.getAllUsers();
      const sanitizedUsers = users.map(user => {
        const { password, ...userData } = user;
        return userData;
      });
      res.status(200).json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await usersService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password, ...userData } = user;
      res.status(200).json(userData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const user = await usersService.updateUser(req.params.id, req.body);
      const { password, ...userData } = user;
      res.status(200).json({ message: "User updated successfully", user: userData });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      await usersService.deleteUser(req.params.id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deactivateUser(req, res) {
    try {
      await usersService.deactivateUser(req.params.id);
      res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async activateUser(req, res) {
    try {
      await usersService.activateUser(req.params.id);
      res.status(200).json({ message: "User reactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { id: userId } = req.user;
      const user = await usersService.updateUser(userId, req.body);
      const { password, ...userData } = user;
      res.status(200).json({ message: "Profile updated successfully", user: userData });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async enableMFA(req, res) {
    try {
      const { id: userId } = req.user;
      await usersService.updateMFASettings(userId, true);
      res.status(200).json({ message: "MFA enabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async disableMFA(req, res) {
    try {
      const { id: userId } = req.user;
      await usersService.updateMFASettings(userId, false);
      res.status(200).json({ message: "MFA disabled successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async enablePinCode(req, res) {
    try {
      const { id: userId } = req.user;
      await usersService.togglePinCode(userId, true);
      res.status(200).json({ message: "PIN code login enabled" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async disablePinCode(req, res) {
    try {
      const { id: userId } = req.user;
      await usersService.togglePinCode(userId, false);
      res.status(200).json({ message: "PIN code login disabled" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async setPinCode(req, res) {
    try {
      const { id: userId } = req.user;
      const { pinCode } = req.body;
      await usersService.setUserPinCode(userId, pinCode);
      res.status(200).json({ message: "PIN code set successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { password } = req.body;
      await usersService.resetPassword(req.params.id, password);
      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      const { id: userId } = req.user; 
      const { currentPassword, newPassword } = req.body;
      await usersService.changeUserPassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new UsersController();
