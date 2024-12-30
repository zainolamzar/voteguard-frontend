import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinedElectionDetail = () => {
  const { userId, voterId, electionId } = useParams();
  const navigate = useNavigate();  // Added navigate hook
  const [election, setElection] = useState(null);
  const [vote, setVote] = useState("");
  const [error, setError] = useState("");
  const [isEligible, setIsEligible] = useState(false); // Store voter's eligibility
  const [resultsLaunched, setResultsLaunched] = useState(false); // Track if results are launched
  const [winner, setWinnerName] = useState("");
  const [totalVotes, setTotalVotes] = useState("");
  const [votesPercent, setVotesPercent] = useState("");
  const [electionParticipation, setElectionParticipation] = useState("");

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

    const fetchElectionResults = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/results/${electionId}`);
        const result = await response.json();

        if (response.ok) {
          setResultsLaunched(true); // Results are launched
          setWinnerName(result.result.winner.name);
          setTotalVotes(result.result.total_votes);
          setVotesPercent(result.result.winning_percent);
          setElectionParticipation(result.result.participation);
        } else {
          setResultsLaunched(false); // Results are not launched yet
        }
      } catch (error) {
        console.error("Error fetching election results:", error);
        setResultsLaunched(false); // Handle API errors gracefully
      }
    };

    fetchVotingLimitation();
    fetchElectionDetails();
    fetchElectionResults();
  }, [voterId, electionId]);

  const handleVoteSubmit = async () => {
    if (!vote) {
      alert("Please select a vote option.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/ballots/submit/${voterId}/${electionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vote,
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

      {/* Go Back Button */}
      <button onClick={() => navigate(`/dashboard/${userId}`)} className="back-button">
        Go Back to Dashboard
      </button>

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

          {new Date() > new Date(election.end_datetime) ? (
            resultsLaunched ? (
              <div className="result-container">
                <h3>Election Results</h3>
                <p><strong>Participation:</strong> {electionParticipation} Voter(s)</p>
                <p><strong>Winner:</strong> {winner}</p>
                <p><strong>Total Votes:</strong> {totalVotes}</p>
                <p><strong>Winning Percentage:</strong> {votesPercent}%</p>
              </div>
            ) : (
              <p>Election result will be released soon!</p>
            )
          ) : isEligible ? (
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
                        value={option.id}
                        checked={vote === option.id}
                        onChange={() => setVote(option.id)}
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