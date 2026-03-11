const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../models/userModel");
const Post = require("../models/postModel");

async function signup(req, res) {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "user already exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: newUser._id });
  } catch (err) {
    console.error("Error during signup:", err.message);
    res.status(500).send("Server error!");
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login:", err.message);
    res.status(500).send("Server error!");
  }
}

async function updateUserProfile(req, res) {
  const { id } = req.params;
  const { email, password } = req.body;
  try {
    let updateFields = { email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }
    const updatedinfo = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!updatedinfo)
      return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated successfully", user: updatedinfo });
  } catch (err) {
    console.error("Error during updation:", err.message);
    res.status(500).send("Server error!");
  }
}

async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err.message);
    res.status(500).json({ message: "Server error" });
  }
}

async function getUserProfile(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).send("Server error!");
  }
}

async function deleteUserProfile(req, res) {
  const { id } = req.params;
  try {
    await Post.deleteMany({ user: id });
    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User profile deleted" });
  } catch (err) {
    console.error("Error deleting user profile:", err.message);
    res.status(500).send("Server error!");
  }
}

async function addfollowers(req, res) {
  const targetUserId = req.params.id;
  const loggedInUserId = req.user;

  if (targetUserId === loggedInUserId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (targetUser.followers.includes(loggedInUserId)) {
      return res.status(400).json({ message: "Already a follower" });
    }

    targetUser.followers.push(loggedInUserId);
    await targetUser.save();

    res.json({
      message: `You are now following ${targetUser.username}`,
      followers: targetUser.followers.length,
    });
  } catch (err) {
    console.error("Error following user profile:", err.message);
    res.status(500).send("Server error!");
  }
}

async function deletefollowers(req, res) {
  const targetUserId = req.params.id;
  const loggedInUserId = req.user;
  try {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    targetUser.followers = targetUser.followers.filter(
      (uid) => uid.toString() !== loggedInUserId
    );

    await targetUser.save();

    res.json({
      message: `You have unfollowed ${targetUser.username}`,
      followers: targetUser.followers.length,
    });
  } catch (err) {
    console.error("Error removing follower:", err.message);
    res.status(500).send("Server error!");
  }
}

async function seefollowers(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("followers", "username");
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json({
      followersCount: user.followers.length,
      followers: user.followers,
    });
  } catch (err) {
    console.log("error finding followers", err);
    res.status(500).send("Server error");
  }
}

module.exports = {
  signup,
  login,
  updateUserProfile,
  getUserProfile,
  deleteUserProfile,
  addfollowers,
  deletefollowers,
  getUserById,
  seefollowers,
};
