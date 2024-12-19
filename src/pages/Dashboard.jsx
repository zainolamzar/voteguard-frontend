import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { userId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user session information (e.g., tokens)
    localStorage.removeItem("userToken"); // Assuming user token is stored here
    alert("You have successfully logged out.");
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to your Dashboard!</h1>
      <p>User ID: {userId}</p>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
};

export default Dashboard;