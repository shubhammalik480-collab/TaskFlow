const express = require("express");
const router = express.Router();

const {
  createBoard,
  getBoards,
  getBoardById,
} = require("../controllers/boardController");

const passportAuth = require("../middleware/passportAuth");

// Create Board
router.post("/", passportAuth, createBoard);

// Get All Boards
router.get("/", passportAuth, getBoards);

// Get Single Board
router.get("/:boardId", passportAuth, getBoardById);

module.exports = router;