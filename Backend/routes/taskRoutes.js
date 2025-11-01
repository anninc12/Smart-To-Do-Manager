import express from "express";
import Task from "../models/Task.js";
const router = express.Router();

//Get tasks by user email
router.get("/tasks/:userEmail", async (req, res) => {
    try {
        const { userEmail } = req.params;
        const tasks = await Task.find({ userId: userEmail }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Create task
router.post("/tasks", async (req, res) => {
    try {
        const { title, description, category, priority, dueDate, userId } = req.body;

        if (!title || !userId) {
            return res.status(400).json({ message: "Title and user ID are required" });
        }
        const newTask = new Task({
            title,
            description,
            category,
            priority,
            dueDate,
            userId,
            status: "Pending"
        });
        await newTask.save();
        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete task
router.delete("/tasks/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Server error" });
    }
});

//Update task - FIXED VERSION
router.put("/tasks/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;
        const updateData = req.body;

        // Remove any fields that shouldn't be updated
        delete updateData._id;
        delete updateData.userId;
        delete updateData.createdAt;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json({ message: "Task updated successfully", task: updatedTask });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;