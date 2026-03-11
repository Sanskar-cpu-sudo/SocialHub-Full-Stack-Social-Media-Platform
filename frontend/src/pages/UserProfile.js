import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/userProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState({ username: "", email: "", followers: [] });
  const [posts, setPosts] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/users/getprofile/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [userId, token]);

  // Fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/posts/getallpost");
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  const userPosts = posts.filter((p) => p.user?._id === userId);

  // Delete profile
  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    try {
      await axios.delete(`http://localhost:5000/users/deleteprofile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/users/signup");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:5000/posts/deletepost/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  // Like post
  const handleLike = async (postId) => {
    try {
      await axios.post(
        `http://localhost:5000/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedPosts = await axios.get("http://localhost:5000/posts/getallpost");
      setPosts(updatedPosts.data);
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
          title: "Check out my post!",
          text: "Here's something I shared:",
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

  // Read more toggle
  const toggleReadMore = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  return (
    <div className="userprofile-container">
      {/* Profile Section */}
      <div className="userprofile-card text-center">
        <img
          src={user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          alt="Profile"
          className="profile-image"
        />
        <h2 className="userprofile-head">{user.username}</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Followers:</strong> {user.followers?.length || 0}</p>

        <div className="profile-btns">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/users/updateprofile/${userId}`)}
          >
            Update Profile
          </button>
          <button className="btn btn-danger" onClick={handleDeleteProfile}>
            Delete Profile
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/users/seefollowers/${userId}`)}
          >
            See Followers
          </button>
        </div>
      </div>

      {/* User Posts Section */}
      <div className="user-posts mt-5">
        <h3 className="user-posts-head">Your Posts</h3>

        {userPosts.length === 0 ? (
          <p className="text-center">No posts created yet.</p>
        ) : (
          userPosts.map((post) => {
            const { _id, title, content, createdAt, updatedAt, likes = [], imageUrl } = post;
            const isLiked = likes.includes(userId);
            const likeCount = likes.length;

            return (
              <div key={_id} className="insta-card">
                <div className="insta-header">
                  <strong>{user.username}</strong>
                  <small className="time-text">
                    {updatedAt !== createdAt
                      ? `Updated: ${new Date(updatedAt).toLocaleString()}`
                      : `Created: ${new Date(createdAt).toLocaleString()}`}
                  </small>
                </div>

                <h3 className="insta-title">{title}</h3>

                <p className="insta-content">
                  {expandedPosts[_id]
                    ? content
                    : content.length > 200
                    ? `${content.substring(0, 200)}...`
                    : content}
                </p>

                {content.length > 450 && (
                  <button
                    className="btn btn-link p-0 read-more-btn"
                    onClick={() => toggleReadMore(_id)}
                  >
                    {expandedPosts[_id] ? "Read Less" : "Read More"}
                  </button>
                )}

                {/* ✅ Post Image */}
                {imageUrl && (
                  <div className="post-image-container">
                    <img src={imageUrl} alt="Post" className="post-image" />
                  </div>
                )}

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
                  <button className="btn share-btn" onClick={() => handleShare(_id)}>
                    📤 Share
                  </button>
                </div>

                <div className="owner-actions">
                  <button
                    className="btn btn-warning me-2"
                    onClick={() => navigate(`/posts/updatepost/${_id}`)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeletePost(_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserProfile;
