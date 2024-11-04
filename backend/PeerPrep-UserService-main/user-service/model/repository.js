import UserModel from "./user-model.js";
import "dotenv/config";
import { connect, mongo } from "mongoose";

export async function connectToDB() {
  let mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;
      
  await connect(mongoDBUri);
}

// Create a new user with an empty questions array
export async function createUser(username, email, password) {
  return new UserModel({ username, email, password, questions: [] }).save();
}

// Retrieve user by email
export async function findUserByEmail(email) {
  return UserModel.findOne({ email });
}

// Retrieve user by ID
export async function findUserById(userId) {
  return UserModel.findById(userId);
}

// Retrieve user by username
export async function findUserByUsername(username) {
  return UserModel.findOne({ username });
}

// Find user by either username or email
export async function findUserByUsernameOrEmail(username, email) {
  return UserModel.findOne({
    $or: [
      { username },
      { email },
    ],
  });
}

// Find all users
export async function findAllUsers() {
  return UserModel.find();
}

// Update user details, including optional password update
export async function updateUserById(userId, username, email, password) {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true },  // return the updated user
  );
}

// Update user privilege
export async function updateUserPrivilegeById(userId, isAdmin) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $set: { isAdmin } },
    { new: true }
  );
}

// Delete a user by ID
export async function deleteUserById(userId) {
  return UserModel.findByIdAndDelete(userId);
}

export async function addQuestionToUser(userId, question) {
  return UserModel.findByIdAndUpdate(
    userId,
    { $push: { questions: question } },
    { new: true }
  );
}