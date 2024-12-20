import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../election/Election-Detail.css";

const ElectionDetail = () => {
  const { userId, electionId } = useParams(); // Get user and election IDs from URL
  const [election, setElection] = useState(null); // State to hold the election details
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the election details
    const fetchElectionDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/elections/${userId}/${electionId}`);
        const result = await response.json();
        if (response.ok) {
          setElection(result.election); // Only set election data
        } else {
          alert("Failed to fetch election details.");
        }
      } catch (error) {
        console.error("Error fetching election details:", error);
        alert("An error occurred while fetching election details.");
      }
    };

    fetchElectionDetails();
  }, [userId, electionId]);

  return (
    <div className="election-detail-container">
      {election ? (
        <>
          <h1>{election.title}</h1>
          <p>{election.description}</p>
          <p>
            <strong>Start Date and Time:</strong> {new Date(election.start_datetime).toLocaleString()}
          </p>
          <p>
            <strong>End Date and Time:</strong> {new Date(election.end_datetime).toLocaleString()}
          </p>
          <div className="election-options">
            <h2>Options</h2>
            {election.options && election.options.length > 0 ? (
              <ul>
                {election.options.map((option, index) => (
                  <li key={index} className="option-item">
                    <strong>Name:</strong> {option.name} <br />
                    <strong>Description:</strong> {option.description}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No options available for this election.</p>
            )}
          </div>

          {/* Button to navigate to the Election Update page */}
          <button
            onClick={() => navigate(`/election/${userId}/update/${electionId}`)}
            className="update-button"
          >
            Update Election Details
          </button>

          <button onClick={() => navigate(`/dashboard/${userId}`)} className="back-button">
            Back to Dashboard
          </button>
        </>
      ) : (
        <p>Loading election details...</p>
      )}
    </div>
  );
};

export default ElectionDetail;