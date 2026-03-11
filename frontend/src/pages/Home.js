import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/posts/getallpost");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Delete post
  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/posts/deletepost/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    }
  };

  // Read more toggle
  const toggleReadMore = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Like post
  const handleLike = async (postId) => {
    try {
      await axios.post(
        `http://localhost:5000/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  // Share post
  const handleShare = async (postId) => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post",
          text: "I found something interesting!",
          url: postUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(postUrl);
      alert("Post link copied to clipboard!");
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const postsToDisplay = searchTerm ? filteredPosts : posts;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center fw-bold fs-2 head">All Posts</h2>

      {/* Search bar */}
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        type="text"
        className="form-control mb-4 search-box"
        placeholder="Search post by title..."
      />

      {postsToDisplay.length === 0 && <p>No posts available.</p>}

      {postsToDisplay.map((post) => {
        const {
          _id,
          title,
          content,
          user,
          createdAt,
          updatedAt,
          likes = [],
          imageUrl, //Cloudinary image URL
        } = post;
        const isLiked = likes.includes(userId);
        const likeCount = likes.length;

        return (
          <div key={_id} className="insta-card">
            {/* Username & Time */}
            <div className="insta-header">
              <button
                className="btn user-btn"
                onClick={() => navigate(`/users/getuser/${user?._id}`)}
              >
                <i className="fa-solid fa-user"></i>{" "}
                {user?.username || "Unknown"}
              </button>
              <small className="time-text">
                {updatedAt !== createdAt
                  ? `Updated: ${new Date(updatedAt).toLocaleString()}`
                  : `Created: ${new Date(createdAt).toLocaleString()}`}
              </small>
            </div>

            {/* Post Title */}
            <h3 className="insta-title">{title}</h3>

            {/* Post Content */}
            <p className="insta-content">
              {expandedPosts[_id]
                ? content
                : content.length > 200
                ? `${content.substring(0, 200)}...`
                : content}
            </p>
            {content.length > 200 && (
              <button
                className="btn btn-link p-0 read-more-btn"
                onClick={() => toggleReadMore(_id)}
              >
                {expandedPosts[_id] ? "Read Less" : "Read More"}
              </button>
            )}

            {/* Post Image */}
            {imageUrl && (
              <div className="insta-image mb-3">
                <img
                  src={imageUrl}
                  alt="Post"
                  className="post-image"
                />
              </div>
            )}

            {/* Like - Comment - Share */}
            <div className="insta-actions">
              <button
                className={`btn ${isLiked ? "liked-btn" : "like-btn"}`}
                onClick={() => handleLike(_id)}
              >
                {likeCount}{" "}
                {isLiked ? (
                  <i className="fas fa-heart red-heart"></i>
                ) : (
                  <i className="fa-regular fa-heart"></i>
                )}
              </button>
              <button
                className="btn comment-btn"
                onClick={() => navigate(`/posts/${_id}/allcomments`)}
              >
                💬 Comments
              </button>
              <button
                className="btn share-btn"
                onClick={() => handleShare(_id)}
              >
                📤 Share
              </button>
            </div>

            {/* Update & Delete for Owner */}
            {user?._id === userId && (
              <div className="owner-actions">
                <button
                  className="btn btn-warning me-2"
                  onClick={() => navigate(`/posts/updatepost/${_id}`)}
                >
                  Update
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(_id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Home;
