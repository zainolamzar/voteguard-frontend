import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinedElectionDetail = () => {
  const { voterId, electionId } = useParams(); // Get voterId and electionId from URL params
  const navigate = useNavigate();
  const [election, setElection] = useState(null); // Store election details
  const [vote, setVote] = useState(""); // Store the selected vote
  const [error, setError] = useState(""); // Store any error messages

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/ballots/${voterId}/${electionId}/options`);
        const result = await response.json();
        if (response.ok) {
          setElection({
            ...result.election, // Spread election details
            options: result.options // Directly assign options from result
          });
        } else {
          setError(result.message || "Failed to fetch election details.");
        }
      } catch (error) {
        console.error("Error fetching election details:", error);
        setError("An error occurred while fetching election details.");
      }
    };
  
    fetchElectionDetails();
  }, [voterId, electionId]);

  const handleVoteSubmit = async () => {
    if (!vote) {
      alert("Please select a vote option.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/ballots/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ electionId, encryptedVote: vote }), // Assuming `vote` is encrypted
      });

      const result = await response.json();
      if (response.ok) {
        alert("Your vote has been successfully submitted.");
        navigate(`/election/join/${voterId}/${electionId}/detail`);
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

          <div className="vote-options">
            <h3>Select your vote:</h3>
            {election && election.options ? (
              election.options.length > 0 ? (
                <form>
                  {election.options.map((option, index) => (
                    <div key={index}>
                      <input
                        type="radio"
                        id={`option-${index}`}
                        name="vote"
                        value={option.name}
                        checked={vote === option.name} // Ensure the selected option is checked
                        onChange={() => setVote(option.name)} // Update selected vote on change
                      />
                      <label htmlFor={`option-${index}`}>
                        <strong>{option.name}</strong> - {option.description}
                      </label>
                    </div>
                  ))}
                </form>
              ) : (
                <p>No voting options available.</p>
              )
            ) : (
              <p>Loading options...</p> // This handles the case where the options are still loading
            )}
          </div>

          <button onClick={handleVoteSubmit} className="vote-button">
            Submit Vote
          </button>
        </div>
      ) : (
        <p>Loading election details...</p>
      )}
    </div>
  );
};

export default JoinedElectionDetail;