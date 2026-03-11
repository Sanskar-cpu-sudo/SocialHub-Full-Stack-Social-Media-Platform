const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config(); 
const User = require("../models/userModel");
const Post=require("../models/postModel");


async function createComment(req, res) {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // ✅ No need to check if user is post owner
    const comment = {
      user: req.user, // or req.user if that's how you're storing it
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({ message: "Comment added", comment });
  } catch (err) {
    console.error("Error commenting:", err.message);
    res.status(500).send("Server error!");
  }
}

// async function deleteComment(req, res) {
//   const { postId, commentId } = req.params;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ message: "Post not found" });

//     // Find the comment index in the array
//     const commentIndex = post.comments.findIndex(
//       (c) => c._id.toString() === commentId
//     );

//     if (commentIndex === -1)
//       return res.status(404).json({ message: "Comment not found" });

//     // Check ownership
//     if (post.comments[commentIndex].user.toString() !== req.user) {
//       return res.status(403).json({ message: "Not authorized to delete this comment" });
//     }

//     // Remove comment from array
//     post.comments.splice(commentIndex, 1);

//     await post.save();

//     res.json({ message: "Comment deleted" });
//   } catch (err) {
//     console.error("Error deleting comment:", err.message);
//     res.status(500).send("Server error!");
//   }
// }


// Get all comments for a post
async function getComments(req, res) {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate("comments.user", "username email");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post.comments);
  } catch (err) {
    console.error("Error fetching comments:", err.message);
    res.status(500).send("Server error!");
  }
}

module.exports={
    createComment,
    // deleteComment,
    getComments
}