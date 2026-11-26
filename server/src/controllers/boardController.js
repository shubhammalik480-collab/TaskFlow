const mongoose = require("mongoose");
const Board = require("../models/Board");
const Column = require("../models/Column");

// 1. Create Board
const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Board title is required",
      });
    }

    const board = await Board.create({
      title: title.trim(),
      description: description || "",
      owner: req.user._id,
      members: [req.user._id],
    });

    // Create default Kanban columns
    await Column.insertMany([
      { title: "To Do", board: board._id, order: 0 },
      { title: "In Progress", board: board._id, order: 1 },
      { title: "Done", board: board._id, order: 2 },
    ]);

    return res.status(201).json({
      success: true,
      message: "Board created successfully",
      board,
    });
  } catch (error) {
    console.error("Create Board Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating board",
    });
  }
};

// 2. Get All Boards
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      members: req.user._id,
      isArchived: false,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: boards.length,
      boards,
    });
  } catch (error) {
    console.error("Get Boards Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching boards",
    });
  }
};

// 3. Get Single Board
const getBoardById = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!mongoose.isValidObjectId(boardId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid board ID",
      });
    }

    const board = await Board.findById(boardId)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }

    const userId = req.user._id.toString();
    const isOwner = board.owner._id.toString() === userId;
    const isMember = board.members.some(
      (member) => member._id.toString() === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this board",
      });
    }

    return res.status(200).json({
      success: true,
      board,
    });
  } catch (error) {
    console.error("Get Board Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching board",
    });
  }
};

module.exports = {
  createBoard,
  getBoards,
  getBoardById,
};