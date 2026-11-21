const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        board: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Board",
            required: true,
        },

        column: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Column",
            required: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        labels: [
            {
                type: String,
                trim: true,
            },
        ],

        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        order: {
            type: Number,
            default: 0,
        },

        dueDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;