import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/addcomment.css"; // new CSS file

const CreateComment = () => {
  const { postId } = useParams();        
  const [text, setText] = useState("");  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      alert("Comment cannot be empty!");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/posts/${postId}/addcomments`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Comment added successfully");
      navigate(`/posts/${postId}/allcomments`);
    } catch (err) {
      console.error("Error creating comment:", err.response?.data || err);
      alert("Failed to create comment. Make sure you're logged in.");
    }
  };

  return (
    <div className="createcomment-container">
      <div className="createcomment-card">
        <h2 className="createcomment-head">Add a Comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Comment</label>
            <textarea
              className="form-input textarea-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write your comment here..."
              rows="4"
              required
            />
          </div>
          <button type="submit" className="createcomment-btn">
            Submit Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateComment;
