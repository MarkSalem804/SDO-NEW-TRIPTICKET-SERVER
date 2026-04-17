const userRoutes = require("../modules/users/users.routes");
const vehicleRoutes = require("../modules/vehicles/vehicles.routes");
const driverRoutes = require("../modules/drivers/drivers.routes");
const vehicleTypesRoutes = require("../modules/vehicleTypes/vehicletypes.routes");
const requestFormsRoutes = require("../modules/requestForms/requestForms.routes");
const travelsRoutes = require("../modules/travels/travels.routes");
const officesRoutes = require("../modules/offices/offices.routes");
const vehicleLogsRoutes = require("../modules/vehicleLogs/vehicleLogs.routes");
const settingsRoutes = require("../modules/settings/settings.routes");
const travelAuthoritiesRoutes = require("../modules/travelAuthorities/travelAuthorities.routes");

const routesConfig = (app) => {
  app.use("/api/users", userRoutes);
  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/drivers", driverRoutes);
  app.use("/api/vehicle-types", vehicleTypesRoutes);
  app.use("/api/request-forms", requestFormsRoutes);
  app.use("/api/travels", travelsRoutes);
  app.use("/api/offices", officesRoutes);
  app.use("/api/vehicle-logs", vehicleLogsRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/travel-authorities", travelAuthoritiesRoutes);
};

module.exports = routesConfig;

