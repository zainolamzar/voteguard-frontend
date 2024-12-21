import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinElection = () => {
  const { userId } = useParams();
  const navigate = useNavigate(); // Hook for navigation
  const [electionCode, setElectionCode] = useState(""); // State to hold the election code

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/voters/${userId}/request-participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ election_code: electionCode }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Participation request sent successfully!");
        navigate(`/dashboard/${userId}`); // Redirect to dashboard after success
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error requesting participation:", error);
      alert("An error occurred while requesting participation.");
    }
  };

  const handleCancel = () => {
    // Navigate back to the dashboard
    navigate(`/dashboard/${userId}`);
  };

  return (
    <div className="join-election-container">
      <h1>Join an Election</h1>
      <form onSubmit={handleSubmit} className="join-election-form">
        <label htmlFor="election-code">Enter Election Code:</label>
        <input
          type="text"
          id="election-code"
          value={electionCode}
          onChange={(e) => setElectionCode(e.target.value)}
          required
        />
        <div className="form-buttons">
          <button type="submit" className="join-button">Request</button>
          <button type="button" className="cancel-button" onClick={handleCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default JoinElection;