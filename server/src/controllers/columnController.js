const mongoose = require("mongoose");
const Column = require("../models/Column");
const Task = require("../models/Task");

// 1. Create Column
const createColumn = async (req, res) => {
  try {
    const { title, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Column title is required",
      });
    }

    const lastColumn = await Column.findOne({
      board: req.board._id,
    }).sort({ order: -1 });

    const column = await Column.create({
      title: title.trim(),
      board: req.board._id,
      order: order ?? (lastColumn ? lastColumn.order + 1 : 0),
    });

    return res.status(201).json({
      success: true,
      message: "Column created successfully",
      column,
    });
  } catch (error) {
    console.error("Create Column Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating column",
    });
  }
};

// 2. Get All Columns
const getColumns = async (req, res) => {
  try {
    const columns = await Column.find({
      board: req.board._id,
    }).sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: columns.length,
      columns,
    });
  } catch (error) {
    console.error("Get Columns Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching columns",
    });
  }
};

// 3. Update Column
const updateColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, order } = req.body;

    if (!mongoose.isValidObjectId(columnId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid column ID",
      });
    }

    const column = await Column.findOne({
      _id: columnId,
      board: req.board._id,
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Column title cannot be empty",
        });
      }

      column.title = title.trim();
    }

    if (order !== undefined) {
      if (!Number.isFinite(order) || order < 0) {
        return res.status(400).json({
          success: false,
          message: "Order must be a non-negative number",
        });
      }

      column.order = order;
    }

    await column.save();

    return res.status(200).json({
      success: true,
      message: "Column updated successfully",
      column,
    });
  } catch (error) {
    console.error("Update Column Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating column",
    });
  }
};

// 4. Delete Column
const deleteColumn = async (req, res) => {
  try {
    const { columnId } = req.params;

    if (!mongoose.isValidObjectId(columnId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid column ID",
      });
    }

    const column = await Column.findOne({
      _id: columnId,
      board: req.board._id,
    });

    if (!column) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }

    const taskCount = await Task.countDocuments({
      column: columnId,
      board: req.board._id,
    });

    if (taskCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a column that contains tasks. Move or delete its tasks first.",
      });
    }

    await column.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Column deleted successfully",
    });
  } catch (error) {
    console.error("Delete Column Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting column",
    });
  }
};

module.exports = {
  createColumn,
  getColumns,
  updateColumn,
  deleteColumn,
};