import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
  });
  
  export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
  