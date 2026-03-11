import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/createPost.css";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // ✅ image file
  const [preview, setPreview] = useState(""); // ✅ preview URL
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file)); // preview before upload
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to create a post!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Prepare form data
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image); // key matches backend multer field

      await axios.post("http://localhost:5000/posts/createpost", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Post created successfully!");
      setLoading(false);
      navigate("/posts/getallpost");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post!");
      setLoading(false);
    }
  };

  return (
    <div className="createpost-container">
      <div className="createpost-card">
        <h2 className="createpost-head">Create Post</h2>
        <form onSubmit={handleCreatePost}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              className="form-input textarea-input"
              rows="5"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content..."
              required
            />
          </div>

          {/* ✅ Image Upload */}
          <div className="form-group">
            <label htmlFor="image">Upload Image (optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="form-input"
              onChange={handleImageChange}
            />
          </div>

          {/* ✅ Preview */}
          {preview && (
            <div className="image-preview">
              <img
                src={preview}
                alt="Preview"
                className="preview-img"
                style={{
                  width: "100%",
                  maxHeight: "250px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              />
            </div>
          )}

          <button type="submit" className="createpost-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
