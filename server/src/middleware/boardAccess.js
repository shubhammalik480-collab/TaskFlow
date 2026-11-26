const mongoose = require("mongoose");
const Board = require("../models/Board");

const boardAccess = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    // Validate Board ID
    if (!mongoose.isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    // Find Board
    const board = await Board.findById(boardId);

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const userId = req.user._id.toString();

    // Check Owner
    const isOwner = board.owner.toString() === userId;

    // Check Member
    const isMember = board.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this board",
      });
    }

    // Attach Board to Request
    req.board = board;

    next();

  } catch (error) {
    console.error("Board Access Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while checking board access",
    });
  }
};

module.exports = boardAccess;