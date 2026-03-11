import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/comment.css"; // new CSS

const Comments = () => {
  const { postId } = useParams();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/posts/${postId}/allcomments`
        );
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  if (loading)
    return <p className="loading-text">Loading comments...</p>;

  return (
    <div className="comments-container">
      <button
        className="add-comment-btn"
        onClick={() => navigate(`/posts/${postId}/addcomments`)}
      >
        Add Comment
      </button>
      <h5 className="comments-head">Comments</h5>
      {comments.length === 0 ? (
        <p className="no-comments">No comments yet</p>
      ) : (
        comments.map((c) => (
          <div key={c._id} className="comment-card">
            <strong className="comment-user">
              {c.user?.username || "Unknown User"}:
            </strong>
            <p className="comment-text">{c.text}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Comments;
