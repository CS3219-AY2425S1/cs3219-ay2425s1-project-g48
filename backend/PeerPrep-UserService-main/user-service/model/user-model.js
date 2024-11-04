import mongoose from "mongoose";

const Schema = mongoose.Schema;

// Define the Question schema with a attempt field
const QuestionSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
  complexity: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  completionDate: {
    type: Date,
    default: Date.now,
  },
  attempt: {
    type: String, // Adjust the type as needed (String, Object, etc.)
    required: false,
  },
});

// Define the User schema and add the questions array
const UserModelSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  questions: {
    type: [QuestionSchema],
    default: [], // Initialize with an empty array
  },
});

export default mongoose.model("UserModel", UserModelSchema);
