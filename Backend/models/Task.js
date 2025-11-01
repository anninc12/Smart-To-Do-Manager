import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, default: "Personal" },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    dueDate: { type: Date },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Task", taskSchema);