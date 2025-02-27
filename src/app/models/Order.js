import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// Compound index for faster user-course lookups
OrderSchema.index({ userId: 1, courseId: 1 });
// Index createdAt for sorting by latest orders
OrderSchema.index({ createdAt: -1 });

export default models.Order || model("Order", OrderSchema);
