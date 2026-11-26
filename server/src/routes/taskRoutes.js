const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const passportAuth = require("../middleware/passportAuth");
const boardAccess = require("../middleware/boardAccess");

// Create Task
router.post(
  "/:boardId",
  passportAuth,
  boardAccess,
  createTask
);

// Get All Tasks
router.get(
  "/:boardId",
  passportAuth,
  boardAccess,
  getTasks
);

// Update Task
router.put(
  "/:boardId/:taskId",
  passportAuth,
  boardAccess,
  updateTask
);

// Delete Task
router.delete(
  "/:boardId/:taskId",
  passportAuth,
  boardAccess,
  deleteTask
);

module.exports = router;