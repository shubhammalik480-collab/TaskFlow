const mongoose = require("mongoose");

const Task = require("../models/Task");
const Column = require("../models/Column");
const { getIO } = require("../sockets/socket");

// Helper: Emit event only to the specific board room
const emitBoardEvent = (boardId, eventName, data) => {
  try {
    const io = getIO();

    io.to(`board-${boardId}`).emit(eventName, data);

    console.log(`Socket Event Emitted: ${eventName} | Board: ${boardId}`);
  } catch (error) {
    console.error("Socket Emit Error:", error.message);
  }
};

// Helper: Populate task details
const populateTask = async (taskId) => {
  return await Task.findById(taskId)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("column", "title order");
};

// 1. CREATE TASK
const createTask = async (req, res) => {
  try {
    const { boardId } = req.params;

    const {
      title,
      description,
      column,
      priority,
      assignedTo,
      labels,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (!column || !mongoose.isValidObjectId(column)) {
      return res.status(400).json({
        success: false,
        message: "Valid column ID is required",
      });
    }

    const columnExists = await Column.findOne({
      _id: column,
      board: boardId,
    });

    if (!columnExists) {
      return res.status(404).json({
        success: false,
        message: "Column not found in this board",
      });
    }

    const lastTask = await Task.findOne({
      board: boardId,
      column,
    }).sort({ order: -1 });

    const task = await Task.create({
      title: title.trim(),
      description,
      board: boardId,
      column,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
      priority: priority || "medium",
      labels: labels || [],
      dueDate: dueDate || null,
      order: lastTask ? lastTask.order + 1 : 0,
    });

    const populatedTask = await populateTask(task._id);

    // Real-time event
    emitBoardEvent(boardId, "task:created", populatedTask);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// 2. GET ALL TASKS
const getTasks = async (req, res) => {
  try {
    const { boardId } = req.params;

    const tasks = await Task.find({
      board: boardId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("column", "title order")
      .sort({ column: 1, order: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// 3. UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      board: req.board._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Store previous values to detect movement
    const previousColumn = task.column.toString();
    const previousOrder = task.order;

    const allowedFields = [
      "title",
      "description",
      "priority",
      "assignedTo",
      "labels",
      "dueDate",
      "order",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // Change task column
    if (req.body.column !== undefined) {
      if (!mongoose.isValidObjectId(req.body.column)) {
        return res.status(400).json({
          success: false,
          message: "Invalid column ID",
        });
      }

      const columnExists = await Column.findOne({
        _id: req.body.column,
        board: req.board._id,
      });

      if (!columnExists) {
        return res.status(404).json({
          success: false,
          message: "Column not found in this board",
        });
      }

      task.column = req.body.column;
    }

    await task.save();

    const populatedTask = await populateTask(task._id);

    const newColumn = task.column.toString();
    const newOrder = task.order;

    // Detect task movement or reordering
    const hasMoved =
      previousColumn !== newColumn ||
      previousOrder !== newOrder;

    if (hasMoved) {
      emitBoardEvent(
        req.board._id,
        "task:moved",
        populatedTask
      );
    } else {
      emitBoardEvent(
        req.board._id,
        "task:updated",
        populatedTask
      );
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Update Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// 4. DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: taskId,
      board: req.board._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Real-time event
    emitBoardEvent(
      req.board._id,
      "task:deleted",
      {
        taskId: task._id,
      }
    );

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};