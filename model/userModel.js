import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  image: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    min: 3,
    max: 20,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 8,
  },
  lastChat: {
    // Add this field
    type: Map,
    of: Date,
    default: {},
  },
});

export default mongoose.model("User", userSchema);
