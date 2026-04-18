const { Server } = require("socket.io");

let io;

const socket = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          "https://sdoictripticket.depedimuscity.com",
          "https://sdotripticket.depedimuscity.com"
        ],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      console.log(`🔌 New client connected: ${socket.id}`);

      // Handle user identification for session management
      socket.on("identify", (userId) => {
        if (userId) {
          console.log(`🆔 User ${userId} identified on socket ${socket.id}`);
          
          // Notify other sessions of this user that they have been logged in elsewhere
          socket.to(`user_${userId}`).emit("session-conflict", {
            message: "Your account has been logged in from another device or browser. You will be logged out."
          });

          // Join the user-specific room
          socket.join(`user_${userId}`);
        }
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
