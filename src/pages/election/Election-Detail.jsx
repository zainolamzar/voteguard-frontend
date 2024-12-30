import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../election/Election-Detail.css";

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionDetail = () => {
  const { userId, electionId } = useParams();
  const [election, setElection] = useState(null);
  const [acceptedVoters, setAcceptedVoters] = useState([]);
  const [electionEnded, setElectionEnded] = useState(false);
  const [electionResults, setElectionResults] = useState(false);
  const [resultsLaunched, setResultsLaunched] = useState(false);  // Track if results have been launched
  const [winner, setWinnerName] = useState();
  const [totalVotes, setTotalVotes] = useState();
  const [votesPercent, setVotesPercent] = useState();
  const [electionParticipation, setElectionParticipation] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the election details
    const fetchElectionDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/elections/${userId}/${electionId}`);
        const result = await response.json();
        if (response.ok) {
          setElection(result.election); // Only set election data

          // Check if the election has ended
          const electionEndDate = new Date(result.election.end_datetime);
          const currentDate = new Date();
          if (currentDate > electionEndDate) {
            setElectionEnded(true); // Mark election as ended if current time is past the end date
          }
        } else {
          alert("Failed to fetch election details.");
        }
      } catch (error) {
        console.error("Error fetching election details:", error);
        alert("An error occurred while fetching election details.");
      }
    };

    const fetchAcceptedVoters = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/accepted-voters/${electionId}`);
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch accepted voters: ${errorMessage}`);
        }
        const result = await response.json();
        setAcceptedVoters(result.acceptedVoters);
      } catch (error) {
        console.error("Error fetching accepted voters:", error);
        alert("An error occurred while fetching accepted voters. Please check the API and try again.");
      }
    };

    const fetchElectionResults = async () => {
      if (electionEnded) {
        try {
          const response = await fetch(`${apiUrl}/api/results/${electionId}`);
          const result = await response.json();
          if (response.ok) {

            setElectionResults(true); // Update the state to indicate results are fetched
            setResultsLaunched(true); // Mark results as launched
            setWinnerName(result.result.winner.name); // Set winner name
            setTotalVotes(result.result.total_votes); // Set total votes
            setVotesPercent(result.result.winning_percent); // Set winning percentage
            setElectionParticipation(result.result.participation);

            console.log(result); // Log the entire result object
            console.log(winner);
          } else {
            alert("Election results not yet available.");
          }
        } catch (error) {
          console.error("Error fetching election results:", error);
          alert("An error occurred while fetching the election results.");
        }
      }
    };

    fetchElectionDetails();
    fetchAcceptedVoters();
    fetchElectionResults();
  }, [userId, electionId, electionEnded]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this election? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        const response = await fetch(`${apiUrl}/api/elections/${userId}/${electionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert("Election deleted successfully.");
          navigate(`/dashboard/${userId}`); // Redirect to dashboard after deletion
        } else {
          alert("Failed to delete election.");
        }
      } catch (error) {
        console.error("Error deleting election:", error);
        alert("An error occurred while deleting the election.");
      }
    }
  };

  const handleLaunchResults = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/results/${userId}/${electionId}/generate`);
      const result = await response.json();
      if (response.ok) {
        setElectionResults(result);
        setResultsLaunched(true); // Mark results as launched
        alert('Election results have been successfully generated!');
        window.location.reload();
      } else {
        alert("Failed to generate election results.");
      }
    } catch (error) {
      console.error("Error fetching election results:", error);
      alert("An error occurred while fetching the election results.");
    }
  };

  return (
    <div className="election-detail-container">
      {election ? (
        <>
          {/* Election Details */}
          <h1>{election.title}</h1>
          <h3>Election Code - {election.election_code}</h3>
          <p>{election.description}</p>
          <p>
            <strong>Start Date and Time:</strong> {new Date(election.start_datetime).toLocaleString()}
          </p>
          <p>
            <strong>End Date and Time:</strong> {new Date(election.end_datetime).toLocaleString()}
          </p>

          {/* Accepted Voters Section */}
          <div className="accepted-voters-container">
            <h3>Accepted Voters</h3>
            {acceptedVoters.length > 0 ? (
              <ul>
                {acceptedVoters.map((voter) => (
                  <li key={voter.voter_id} className="voter-item">
                    <strong>Name:</strong> {voter.first_name} {voter.last_name} <br />
                    <strong>Email:</strong> {voter.email} <br />
                    <strong>Username:</strong> {voter.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No accepted voters for this election yet.</p>
            )}
          </div>

          {/* Buttons */}
          <button onClick={() => navigate(`/election/${userId}/update/${electionId}`)} className="update-button">
            Update Election Details
          </button>
          <button onClick={() => navigate(`/election/${userId}/manage-requests/${electionId}`)} className="manage-requests-button">
            Manage Requests
          </button>
          <button onClick={handleDelete} className="delete-button">
            Delete Election
          </button>
          <button onClick={() => navigate(`/dashboard/${userId}`)} className="back-button">
            Back to Dashboard
          </button>

          {/* Launch Result Button (only visible if election has ended) */}
          {electionEnded && !resultsLaunched && (
            <button onClick={handleLaunchResults} className="launch-results-button">
              Launch Results
            </button>
          )}

          {/* Display Result or Message */}
          {electionEnded ? (
            resultsLaunched ? (
              <div className="result-container">
                <h3>Election Results</h3>
                {winner ? (
                  <>
                  <p><strong>Participation:</strong> {electionParticipation} Voter(s)</p>
                    <p><strong>Winner:</strong> {winner}</p>
                    <p><strong>Total Votes:</strong> {totalVotes}</p>
                    <p><strong>Winning Percentage:</strong> {votesPercent}%</p>
                  </>
                ) : (
                  <p>No results available yet.</p>
                )}
              </div>
            ) : (
              <p>Please wait, results will be launched soon!</p>
            )
          ) : null}
        </>
      ) : (
        <p>Loading election details...</p>
      )}
    </div>
  );
};

export default ElectionDetail;