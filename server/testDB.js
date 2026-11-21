require("dotenv").config();

const mongoose = require("mongoose");

const User = require("./src/models/User");
const Board = require("./src/models/Board");
const Column = require("./src/models/Column");
const Task = require("./src/models/Task");

const testDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected!");

        // Create User
        const user = await User.create({
            name: "Test User",
            email: `test${Date.now()}@example.com`,
            password: "hashed_test_password"
        });

        // Create Board
        const board = await Board.create({
            title: "TaskFlow Demo Board",
            description: "My first TaskFlow board",
            owner: user._id,
            members: [user._id]
        });

        // Create Column
        const column = await Column.create({
            title: "To Do",
            board: board._id,
            order: 1
        });

        // Create Task
        const task = await Task.create({
            title: "Build Login Page",
            description: "Create the authentication UI",
            board: board._id,
            column: column._id,
            createdBy: user._id,
            assignedTo: user._id,
            priority: "high"
        });

        console.log("All Test Documents Created!");

        console.log({
            userId: user._id,
            boardId: board._id,
            columnId: column._id,
            taskId: task._id
        });

    } catch (error) {
        console.error("Database Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected!");
    }
};

testDatabase();