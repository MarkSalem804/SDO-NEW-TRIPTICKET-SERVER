require("dotenv").config()
const app = require("./app")
const socket = require("./src/middlewares/socket-connection")
const fs = require("fs")
const http = require("http")

const PORT = process.env.PORT || 5011

const httpServer = http.createServer(app);

socket.init(httpServer);

httpServer.listen(PORT, () => {
  console.log(`IMPACT backend running on http://localhost:${PORT}`)
})
