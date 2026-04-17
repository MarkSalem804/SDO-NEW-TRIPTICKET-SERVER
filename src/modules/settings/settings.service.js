const fs = require("fs");
const path = require("path");

const ENV_PATH = path.resolve(__dirname, "../../../.env");

// The specific keys we allow users to modify
const ALLOWED_KEYS = [
  "ATTACHMENTS_PATH",
  "APPROVED_TICKETS_PATH",
  "REJECTED_TICKETS_PATH",
  "SIGNATURE_LOCATION",
];

class SettingsService {
  /**
   * Parse the .env file into a Map preserving order and comments
   */
  _parseEnvFile() {
    const content = fs.readFileSync(ENV_PATH, "utf-8");
    return content;
  }

  /**
   * Get current values for the allowed path keys
   */
  getPaths() {
    const content = this._parseEnvFile();
    const lines = content.split(/\r?\n/);
    const result = {};

    for (const line of lines) {
      // Skip comments and blank lines
      if (line.startsWith("#") || !line.includes("=")) continue;

      const eqIndex = line.indexOf("=");
      const key = line.substring(0, eqIndex).trim();
      const value = line.substring(eqIndex + 1).trim();

      if (ALLOWED_KEYS.includes(key)) {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Update specific path keys in the .env file
   * Preserves all other lines, comments, and ordering
   */
  updatePaths(updates) {
    // Validate only allowed keys
    for (const key of Object.keys(updates)) {
      if (!ALLOWED_KEYS.includes(key)) {
        throw new Error(`Key "${key}" is not an allowed setting.`);
      }
    }

    const content = fs.readFileSync(ENV_PATH, "utf-8");
    const lines = content.split(/\r?\n/);
    const updatedLines = [];

    for (const line of lines) {
      if (line.startsWith("#") || !line.includes("=")) {
        updatedLines.push(line);
        continue;
      }

      const eqIndex = line.indexOf("=");
      const key = line.substring(0, eqIndex).trim();

      if (ALLOWED_KEYS.includes(key) && updates[key] !== undefined) {
        updatedLines.push(`${key}=${updates[key]}`);
        // Also update the live process.env so changes take effect immediately
        process.env[key] = updates[key];
      } else {
        updatedLines.push(line);
      }
    }

    fs.writeFileSync(ENV_PATH, updatedLines.join("\n"), "utf-8");

    return this.getPaths();
  }
}

module.exports = new SettingsService();
