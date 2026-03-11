import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UpProf = ({ userId }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();

  const token = localStorage.getItem("token");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/users/updateprofile/${userId}`,
        { email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoading(false);
      alert("Profile updated successfully!");
      navigate(`/posts/getallpost`);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2>Update Profile</h2>
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label htmlFor="Email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="Password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpProf;
