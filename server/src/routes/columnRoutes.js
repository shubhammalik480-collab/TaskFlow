const express = require("express");
const router = express.Router();

const {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn,
} = require("../controllers/columnController");

const passportAuth = require("../middleware/passportAuth");
const boardAccess = require("../middleware/boardAccess");

// Create Column
router.post("/:boardId", passportAuth, boardAccess, createColumn);

// Get All Columns
router.get("/:boardId", passportAuth, boardAccess, getColumns);

// Update Column
router.put("/:boardId/:columnId", passportAuth, boardAccess, updateColumn);

// Delete Column
router.delete("/:boardId/:columnId", passportAuth, boardAccess, deleteColumn);

module.exports = router;