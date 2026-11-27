const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/User");
const Board = require("../models/Board");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // JWT Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(
        socket.handshake.headers.cookie || ""
      );

      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Authenticated user connected: ${socket.user._id}`);

    // Join Board Room with authorization
    socket.on("join-board", async (boardId) => {
      try {
        if (!boardId) return;

        const board = await Board.findById(boardId);

        if (!board) {
          socket.emit("socket:error", {
            message: "Board not found",
          });
          return;
        }

        const isOwner = board.owner.toString() === socket.user._id.toString();

        const isMember = board.members.some(
          (memberId) => memberId.toString() === socket.user._id.toString()
        );

        if (!isOwner && !isMember) {
          socket.emit("socket:error", {
            message: "You are not authorized to access this board",
          });
          return;
        }

        const roomName = `board-${boardId}`;

        await socket.join(roomName);

        console.log(`${socket.user._id} joined ${roomName}`);

        socket.to(roomName).emit("user:joined", {
          userId: socket.user._id,
        });

      } catch (error) {
        console.error("Join Board Error:", error.message);

        socket.emit("socket:error", {
          message: "Unable to join board",
        });
      }
    });

    // Leave Board Room
    socket.on("leave-board", async (boardId) => {
      if (!boardId) return;

      const roomName = `board-${boardId}`;

      await socket.leave(roomName);

      console.log(`${socket.user._id} left ${roomName}`);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};