const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String, // Cloudinary image URL
      default: "",
    },
    publicId: {
      type: String, // Cloudinary public_id for deleting/updating image later
      default: "",
    },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
      },
    ],
    likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" } //each id in user collection refer to id in user collection
  ],
  },
  { timestamps: true } // auto adds createdAt & updatedAt
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
