import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinedElectionDetail = () => {
  const { voterId, electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [vote, setVote] = useState("");
  const [error, setError] = useState("");
  const [isEligible, setIsEligible] = useState(false); // Store voter's eligibility

  useEffect(() => {
    const fetchVotingLimitation = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${voterId}/limitation`);
        const result = await response.json();

        if (response.ok) {
          const { isEligibleToVote, ...limitation } = result.data;
          setIsEligible(isEligibleToVote); // Store eligibility
          setElection((prevElection) => ({
            ...prevElection,
            ...limitation,
          }));
        } else {
          setError(result.message || "Failed to fetch voting limitation.");
        }
      } catch (error) {
        console.error("Error fetching voting limitation:", error);
        setError("An error occurred while fetching voting limitation.");
      }
    };

    const fetchElectionDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ballots/${voterId}/${electionId}/options`);
        const result = await response.json();
        if (response.ok) {
          setElection((prevElection) => ({
            ...prevElection,
            ...result.election,
            options: result.options,
          }));
        } else {
          setError(result.message || "Failed to fetch election details.");
        }
      } catch (error) {
        console.error("Error fetching election details:", error);
        setError("An error occurred while fetching election details.");
      }
    };

    fetchVotingLimitation();
    fetchElectionDetails();
  }, [voterId, electionId]);

  const handleVoteSubmit = async () => {
    if (!vote) {
      alert("Please select a vote option.");
      return;
    }
  
    try {
      // Submit the vote directly to the backend (without encryption)
      const response = await fetch(`${apiUrl}/api/ballots/submit/${voterId}/${electionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vote, // Directly submit the vote
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        if (window.confirm("Your vote has been successfully submitted. Click OK to proceed.")) {
          window.location.reload(); 
        }
      } else {
        alert(result.message || "Failed to submit vote.");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("An error occurred while submitting your vote.");
    }
  };

  return (
    <div className="joined-election-detail-container">
      <h1>Election Details</h1>
      {error && <p className="error">{error}</p>}

      {election ? (
        <div className="election-details">
          <h2>{election.title}</h2>
          <p>{election.description}</p>
          <p>
            <strong>Start Time:</strong> {new Date(election.start_datetime).toLocaleString()}
          </p>
          <p>
            <strong>End Time:</strong> {new Date(election.end_datetime).toLocaleString()}
          </p>

          {isEligible ? (
            <div className="vote-options">
              <h3>Select your vote:</h3>
              {election.options && election.options.length > 0 ? (
                <form>
                  {election.options.map((option, index) => (
                    <div key={index}>
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="vote"
                        value={option.name}
                        checked={vote === option.name}
                        onChange={() => setVote(option.name)}
                      />
                      <label htmlFor={`option-${index}`}>
                        <strong>{option.name}</strong> - {option.description}
                      </label>
                    </div>
                  ))}
                </form>
              ) : (
                <p>No voting options available.</p>
              )}
              <div>
                <button onClick={handleVoteSubmit} className="vote-button">
                  Submit Vote
                </button>
              </div>
            </div>
          ) : (
            <p>
              {election.has_voted === 1
                ? "You have already voted in this election."
                : new Date() < new Date(election.start_datetime)
                ? "The election has not started yet."
                : "The election has ended."}
            </p>
          )}
        </div>
      ) : (
        <p>Loading election details...</p>
      )}
    </div>
  );
};

export default JoinedElectionDetail;