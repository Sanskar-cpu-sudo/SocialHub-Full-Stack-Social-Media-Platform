import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Followers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/users/seefollowers/${id}`
        );
        setFollowers(res.data.followers);
      } catch (err) {
        console.error("Error fetching followers:", err.response?.data || err);
        alert("Failed to fetch followers");
        navigate("/posts/getallpost");
      }
    };
    fetchFollowers();
  }, [id, navigate]);

  return (
    <div className="container mt-4">
      <h3>Followers</h3>
      {followers.length === 0 ? (
        <p>No Followers yet</p>
      ) : (
        <ul className="list-group">
          {followers.map((f) => (
            <li key={f._id} className="list-group-item">
              {f.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Followers;
