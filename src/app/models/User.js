import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

// Index email for faster lookup (important if you authenticate via email)
UserSchema.index({ email: 1 });

export default models.User || model("User", UserSchema);