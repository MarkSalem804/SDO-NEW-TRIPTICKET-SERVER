require("dotenv").config()
const app = require("./app")
const socket = require("./src/middlewares/socket-connection")
const fs = require("fs")
// const http = require("http")
const https = require("https")

const PORT = process.env.PORT || 5011

// const httpServer = http.createServer(app);

const httpServer = https.createServer({
    key: fs.readFileSync(process.env.PRIV_KEY_CERT_LOCATION),
    cert: fs.readFileSync(process.env.FULLCHAIN_CERT_LOCATION)
}, app);

socket.init(httpServer);

// httpServer.listen(PORT, () => {
//   console.log(`IMPACT backend running on http://localhost:${PORT}`)
// })

httpServer.listen(PORT, () => {
  console.log(`IMPACT backend running on https://sdotripticket.depedimuscity.com:${PORT}`)
})
