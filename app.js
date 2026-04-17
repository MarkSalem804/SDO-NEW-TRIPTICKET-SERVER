const express = require("express")
const path = require("path")
const corsConfig = require("./src/middlewares/cors-config")
const morgan = require("morgan")
const routesConf = require("./src/middlewares/routes-config")
const { errorHandler } = require("./src/middlewares/errors")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")


const app = express()

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(corsConfig())
app.use(morgan("combined"))
app.use(cookieParser())

const profilesPath = process.env.PROFILE_PICTURES_UPLOADS || path.join(__dirname, "tmp/profiles");
app.use("/uploads/profiles", express.static(profilesPath));

const attachmentsPath = process.env.ATTACHMENTS_PATH || "C:/Attachments";
app.use("/uploads/attachments", express.static(attachmentsPath));



routesConf(app)


app.use(errorHandler)

module.exports = app