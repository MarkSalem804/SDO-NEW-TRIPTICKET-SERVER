const { Server } = require("socket.io");

let io;

const socket = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
          "http://localhost:3000", // React frontend dev
          "http://127.0.0.1:3000",
          "https://your-production-domain.com" // production frontend
        ],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);

      // Example: listen for a custom event
      socket.on("message", (data) => {
        console.log("📩 Message received:", data);
        // Broadcast to all connected clients
        io.emit("message", data);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};

module.exports = socket;
