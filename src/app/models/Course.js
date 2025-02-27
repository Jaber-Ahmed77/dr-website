import mongoose, { Schema, model, models } from "mongoose";

const CourseSchema = new Schema({
  playlistId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  count: { type: Number, default: 0 }, // Default to 0 to avoid undefined
  thumbnail: { type: String },
});

// Index for fast lookup by playlistId
CourseSchema.index({ playlistId: 1 });
// Optional: Index count if you frequently aggregate total videos
CourseSchema.index({ count: 1 });

export default models.Course || model("Course", CourseSchema);
