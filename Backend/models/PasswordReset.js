import mongoose from "mongoose";
const passwordResetSchema = new mongoose.Schema({
    email: String,
    oldPassword: String,
    newPassword: String,
    resetAt: { type: Date, default: Date.now }
});
export default mongoose.model("PasswordReset", passwordResetSchema, "Password-Reset");