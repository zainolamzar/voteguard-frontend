import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";

const Dashboard = () => {
  const { userId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored user session information (e.g., tokens)
    localStorage.removeItem("userToken"); // Assuming user token is stored here
    alert("You have successfully logged out.");
    navigate("/"); // Redirect to login page
  };

  const handleCreateElection = () => {
    // Redirect to the Election Form page for the logged-in user
    navigate(`/election-form/${userId}`);
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to your Dashboard!</h1>
      <p>User ID: {userId}</p>
      <div className="dashboard-actions">
        <button onClick={handleCreateElection} className="create-election-button">
          Create New Election
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;