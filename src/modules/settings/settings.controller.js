const settingsService = require("./settings.service");

class SettingsController {
  async getPaths(req, res) {
    try {
      const paths = settingsService.getPaths();
      res.status(200).json(paths);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updatePaths(req, res) {
    try {
      const updated = settingsService.updatePaths(req.body);
      res.status(200).json({ message: "Paths updated successfully", paths: updated });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new SettingsController();
