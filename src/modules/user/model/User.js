import mongoose from "mongoose";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    avatar:      { type: String },
    description: { type: String, default: null },
    address:     { type: String, default: null },
    phone:       { type: String, default: null },
    website:     { type: String, default: null },
    telegramChatId: { type: String, default: null },
  },
  { timestamps: true }
);

export default model("User", UserSchema);
