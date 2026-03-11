const express = require("express");
const postsController = require("../controller/postController");
const commentsController = require("../controller/commentController");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");

const postsRouter = express.Router();

// 🧩 Multer setup — stores temp files before Cloudinary upload
const upload = multer({ dest: "uploads/" });

// ----------------- Posts Routes -----------------

// Create a post (with optional image)
postsRouter.post(
  "/createpost",
  authMiddleware,
  upload.single("image"),  // <--- added for image upload
  postsController.createPost
);

// Get all posts
postsRouter.get("/getallpost", postsController.getAllPosts);

// Like/Unlike a post
postsRouter.post("/:postId/like", authMiddleware, postsController.toggleLike);

// Update a post (with optional new image)
postsRouter.put(
  "/updatepost/:id",
  authMiddleware,
  upload.single("image"),  // <--- added for replacing image
  postsController.updatePost
);

// Get posts by user
postsRouter.get("/getpostbyid/:userId", postsController.getpostbyid);

// Delete a post (and its image)
postsRouter.delete("/deletepost/:id", authMiddleware, postsController.deletePost);

// ----------------- Comments Routes -----------------

// Add a comment to a post
postsRouter.post(
  "/:postId/addcomments",
  authMiddleware,
  commentsController.createComment
);

// Get all comments for a post
postsRouter.get("/:postId/allcomments", commentsController.getComments);

module.exports = postsRouter;
