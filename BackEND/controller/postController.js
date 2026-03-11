const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { v2: cloudinary } = require("cloudinary");
const User = require("../models/userModel");
const Post = require("../models/postModel");
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//  CREATE POST (with optional image)
async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    let imageUrl = "";
    let publicId = "";

    // If image file is uploaded (via multer)
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "post_images",
      });
      imageUrl = result.secure_url;
      publicId = result.public_id;
    }

    const post = new Post({
      title,
      content,
      user: req.user,
      imageUrl,
      publicId,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).send("Server error!");
  }
}

// UPDATE POST (with image replace support)
async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.user.toString() !== req.user)
      return res.status(403).json({ error: "Not authorized" });

    post.title = title || post.title;
    post.content = content || post.content;

    // If a new image file is uploaded
    if (req.file) {
      // Delete the old image from Cloudinary
      if (post.publicId) await cloudinary.uploader.destroy(post.publicId);

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "post_images",
      });

      post.imageUrl = result.secure_url;
      post.publicId = result.public_id;
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).send("Server error!");
  }
}

//  DELETE POST (and delete image from Cloudinary)
async function deletePost(req, res) {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.user.toString() !== req.user)
      return res.status(403).json({ error: "Not authorized" });

    // Delete image from Cloudinary if exists
    if (post.publicId) await cloudinary.uploader.destroy(post.publicId);

    await Post.findByIdAndDelete(id);
    res.json({ message: "Post and image deleted" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).send("Server error!");
  }
}

// GET ALL POSTS
async function getAllPosts(req, res) {
  try {
    const posts = await Post.find().populate("user", "username email");
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    res.status(500).send("Server error!");
  }
}

//  GET POSTS BY USER
async function getpostbyid(req, res) {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// TOGGLE LIKE
async function toggleLike(req, res) {
  const { postId } = req.params;
  const userId = req.user;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likes: post.likes.length,
    });
  } catch (err) {
    console.error("Error toggling like:", err.message);
    res.status(500).send("Server error!");
  }
}

module.exports = {
  getAllPosts,
  deletePost,
  updatePost,
  createPost,
  getpostbyid,
  toggleLike,
};
