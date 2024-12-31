import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";

const apiUrl = import.meta.env.VITE_BE_URL;

const Dashboard = () => {
  const { userId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const [elections, setElections] = useState([]); // State to hold the list of elections created by the user
  const [joinedElections, setJoinedElections] = useState([]); // State to hold the list of joined elections

  useEffect(() => {
    // Fetch all elections created by the user
    const fetchElections = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/elections/${userId}/election`);
        const result = await response.json();
        if (response.ok) {
          setElections(result);
        } else {
          alert("Failed to fetch elections.");
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        alert("An error occurred while fetching elections.");
      }
    };

    // Fetch all elections the user has successfully joined
    const fetchJoinedElections = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/joined-elections`);
        const result = await response.json();
        if (response.ok) {
          setJoinedElections(result.joinedElections);
        } else {
          alert("Failed to fetch joined elections.");
        }
      } catch (error) {
        console.error("Error fetching joined elections:", error);
        alert("An error occurred while fetching joined elections.");
      }
    };

    fetchElections();
    fetchJoinedElections();
  }, [userId]);

  const handleLogout = () => {
    // Clear any stored user session information (e.g., tokens)
    localStorage.removeItem("userToken");
    alert("You have successfully logged out.");
    navigate("/login");
  };

  const handleCreateElection = () => {
    // Redirect to the Election Form page for the logged-in user
    navigate(`/election-form/${userId}`);
  };

  const handleViewElectionDetails = (electionId) => {
    // Redirect to the Election Detail page for the selected election
    navigate(`/election/${userId}/detail/${electionId}`);
  };

  const handleJoinElection = () => {
    // Redirect to the Join Election page
    navigate(`/voter/join/${userId}`);
  };

  const handleViewJoinedElectionDetails = (voterId, electionId) => {
    if (!voterId || !electionId) {
      console.error("Missing voterId or electionId");
      return;
    }
    navigate(`/election/${userId}/join/${voterId}/${electionId}/detail`);
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to your Dashboard!</h1>
      <p>User ID: {userId}</p>
      <div className="dashboard-actions">
        <button onClick={handleCreateElection} className="create-election-button">
          Create New Election
        </button>
        <button onClick={handleJoinElection} className="join-election-button">
          Join Election
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {/* Created Elections Section */}
      <div className="election-list-container">
        <h2>Your Elections</h2>
        {elections.length > 0 ? (
          <ul className="election-list">
            {elections.map((election) => (
              <li
                key={election.election_id}
                className="election-item"
                onClick={() => handleViewElectionDetails(election.election_id)}
              >
                <div className="election-info">
                  <h3>{election.title}</h3>
                  <p>{election.description}</p>
                </div>
                <span className="view-details">View Details →</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not created any elections yet.</p>
        )}
      </div>

      {/* Joined Elections Section */}
      <div className="joined-elections-container">
        <div>
        <h2>Joined Elections</h2>
        <ul>
          {joinedElections.map((election) => (
            <li key={election.election_id}>
              <h3>{election.title}</h3>
              <button
                onClick={() =>
                  handleViewJoinedElectionDetails(
                    election.voter_id, // Ensure voter_id is part of the election object
                    election.election_id
                  )
                }
              >
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;