import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/home.css"; // use same style as Home page for consistent design

const GetUser = () => {
  const loggedInUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState({});
  const navigate = useNavigate();

  // Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/users/getuser/${id}`);
        setUser(res.data);
        setFollowersCount(res.data.followers?.length || 0);
        setIsFollowing(res.data.followers?.includes(loggedInUserId));
      } catch (err) {
        console.error("Error fetching user:", err.response?.data || err);
        alert("Failed to fetch user profile");
        navigate("/posts/getallpost");
      }
    };
    fetchUser();
  }, [id, navigate, loggedInUserId]);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/posts/getpostbyid/${id}`);
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching user's posts:", err);
      }
    };
    fetchPosts();
  }, [id]);

  // Follow/Unfollow user
  const handleFollow = async () => {
    if (!token) {
      alert("Please login to follow users");
      return;
    }
    try {
      if (!isFollowing) {
        const res = await axios.post(
          `http://localhost:5000/users/${id}/addfollow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowersCount(res.data.followers);
        setIsFollowing(true);
      } else {
        const res = await axios.delete(
          `http://localhost:5000/users/${id}/deletefollow`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowersCount(res.data.followers);
        setIsFollowing(false);
      }
    } catch (err) {
      console.error("Error updating follow status:", err.response?.data || err);
      alert("Failed to update follow status");
    }
  };

  // Toggle Read More
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
      const updatedPosts = await axios.get(`http://localhost:5000/posts/getpostbyid/${id}`);
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

  if (!user)
    return <p className="loading-text text-center mt-5">Loading user profile...</p>;

  return (
    <div className="container mt-5">
      {/* Profile Card */}
      <div className="getuser-card text-center mb-5 p-4 insta-card">
        <div className="d-flex flex-column align-items-center">
          {/* ✅ User Profile Image */}
          <img
            src={user.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt="User"
            className="rounded-circle mb-3"
            style={{ width: "130px", height: "130px", objectFit: "cover", border: "3px solid #a259ff" }}
          />
          <h2 className="getuser-head">{user.username}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Followers:</strong> {followersCount}</p>

          <button
            className={`btn ${isFollowing ? "btn-unfollow btn-danger" : "btn-follow btn-primary"} mt-2`}
            onClick={handleFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>

          <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      {/* User's Posts Section */}
      <div className="user-posts mt-5">
        <h3 className="user-posts-head text-center mb-4 head">
          {user.username}'s Posts
        </h3>

        {posts.length === 0 ? (
          <p className="text-center">No posts created yet.</p>
        ) : (
          posts.map((post) => {
            const { _id, title, content, createdAt, updatedAt, likes = [], imageUrl } = post;
            const isLiked = likes.includes(loggedInUserId);
            const likeCount = likes.length;

            return (
              <div key={_id} className="insta-card">
                <div className="insta-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-user"></i>
                    <strong>{user.username}</strong>
                  </div>
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
                  <div className="insta-image mb-3 post-image-container">
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GetUser;
