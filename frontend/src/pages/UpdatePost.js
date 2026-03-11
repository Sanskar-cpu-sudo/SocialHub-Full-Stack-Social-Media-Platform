import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdatePost = () => {
  const { id } = useParams(); // post ID
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // new image file
  const [preview, setPreview] = useState(""); // preview of new image
  const [existingImage, setExistingImage] = useState(""); // current image
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch post data on mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/posts/getallpost`);
        const post = res.data.find((p) => p._id === id);
        if (post) {
          setTitle(post.title);
          setContent(post.content);
          setExistingImage(post.imageUrl || ""); // current Cloudinary image
        } else {
          alert("Post not found");
          navigate("/posts/getallpost");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      }
    };
    fetchPost();
  }, [id, navigate]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content cannot be empty");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image); // ✅ add only if new image chosen

      await axios.put(`http://localhost:5000/posts/updatepost/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Post updated successfully!");
      navigate("/posts/getallpost");
    } catch (err) {
      console.error("Error updating post:", err.response?.data || err);
      alert("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2>Update Post</h2>
      <form onSubmit={handleUpdate}>
        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter new title"
            required
          />
        </div>

        {/* Content */}
        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter new content"
            rows="5"
            required
          />
        </div>

        {/* Existing Image Preview */}
        {existingImage && !preview && (
          <div className="mb-3">
            <label className="form-label">Current Image:</label>
            <img
              src={existingImage}
              alt="Existing Post"
              style={{
                width: "100%",
                borderRadius: "8px",
                marginTop: "10px",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        {/* Upload New Image */}
        <div className="mb-3">
          <label className="form-label">Change Image (optional):</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleImageChange}
          />
        </div>

        {/* New Image Preview */}
        {preview && (
          <div className="mb-3">
            <label className="form-label">New Image Preview:</label>
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "100%",
                borderRadius: "8px",
                marginTop: "10px",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Updating..." : "Update Post"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePost;
