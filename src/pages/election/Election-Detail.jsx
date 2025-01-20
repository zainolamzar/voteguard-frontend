import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionDetail = () => {
  const { userId, electionId } = useParams();
  const [election, setElection] = useState(null);
  const [acceptedVoters, setAcceptedVoters] = useState([]);
  const [electionEnded, setElectionEnded] = useState(false);
  const [electionResults, setElectionResults] = useState(false);
  const [resultsLaunched, setResultsLaunched] = useState(false);
  const [winner, setWinnerName] = useState();
  const [totalVotes, setTotalVotes] = useState();
  const [votesPercent, setVotesPercent] = useState();
  const [electionParticipation, setElectionParticipation] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/elections/${userId}/${electionId}`);
        const result = await response.json();
        if (response.ok) {
          setElection(result.election);
          const electionEndDate = new Date(result.election.end_datetime);
          const currentDate = new Date();
          if (currentDate > electionEndDate) {
            setElectionEnded(true);
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
        if (!response.ok) throw new Error("Failed to fetch accepted voters.");
        const result = await response.json();
        setAcceptedVoters(result.acceptedVoters);
      } catch (error) {
        console.error("Error fetching accepted voters:", error);
        alert("An error occurred while fetching accepted voters.");
      }
    };

    const fetchElectionResults = async () => {
      if (electionEnded) {
        try {
          const response = await fetch(`${apiUrl}/api/results/${electionId}`);
          const result = await response.json();
          if (response.ok) {
            setElectionResults(true);
            setResultsLaunched(true);
            setWinnerName(result.result.winner.name);
            setTotalVotes(result.result.total_votes);
            setVotesPercent(result.result.winning_percent);
            setElectionParticipation(result.result.participation);
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
          method: "DELETE",
        });
        if (response.ok) {
          alert("Election deleted successfully.");
          navigate(`/dashboard/${userId}`);
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
        setResultsLaunched(true);
        alert("Election results have been successfully generated!");
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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center py-8 px-4">
      {election ? (
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-3xl w-full">
          <h1 className="text-3xl font-poppins font-bold text-[#003366] mb-6">
            {election.title}'s Dashboard
          </h1>
          <p className="text-sm text-gray-600 font-roboto mb-4">
            <strong>Election Code:</strong> {election.election_code}
          </p>
          <p className="text-gray-700 font-roboto mb-4">{election.description}</p>
          <p className="text-gray-700 font-roboto mb-2">
            <strong>Start Date and Time:</strong>{" "}
            {new Date(election.end_datetime).toLocaleString('en-MY', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            })}
          </p>
          <p className="text-gray-700 font-roboto mb-6">
            <strong>End Date and Time:</strong>{" "}
            {new Date(election.end_datetime).toLocaleString('en-MY', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            })}
          </p>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#003366] mb-4">Accepted Voters</h2>
            {acceptedVoters.length > 0 ? (
              <ul className="space-y-2">
                {acceptedVoters.map((voter) => (
                  <li
                    key={voter.voter_id}
                    className="p-4 bg-[#F5F5F5] rounded-md shadow-sm"
                  >
                    <p className="font-roboto">
                      <strong>Name:</strong> {voter.first_name} {voter.last_name}
                    </p>
                    <p className="font-roboto">
                      <strong>Email:</strong> {voter.email}
                    </p>
                    <p className="font-roboto">
                      <strong>Username:</strong> {voter.username}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 font-roboto">No accepted voters yet.</p>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate(`/election/${userId}/update/${electionId}`)}
              className="w-full bg-[#00897B] text-white font-roboto py-3 rounded hover:bg-[#00695C]"
            >
              Update Election Details
            </button>
            <button
              onClick={() => navigate(`/election/${userId}/manage-requests/${electionId}`)}
              className="w-full bg-[#00897B] text-white font-roboto py-3 rounded hover:bg-[#00695C]"
            >
              Manage Request
            </button>
            <button
              onClick={handleDelete}
              className="w-full bg-[#D32F2F] text-white font-roboto py-3 rounded hover:bg-[#B71C1C]"
            >
              Delete Election
            </button>
            {electionEnded && !resultsLaunched && (
              <button
                onClick={handleLaunchResults}
                className="w-full bg-[#FFC107] text-[#003366] font-roboto py-3 rounded hover:bg-[#FFA000]"
              >
                Launch Results
              </button>
            )}
            <button
              onClick={() => navigate(`/dashboard/${userId}`)}
              className="w-full bg-gray-300 text-gray-700 font-roboto py-3 rounded hover:bg-gray-400"
            >
              Back to Dashboard
            </button>
          </div>

          {electionEnded && resultsLaunched && (
            <div className="mt-8">
              <h2 className="text-2xl font-poppins font-bold text-[#003366] mb-4">
                Election Results
              </h2>
              <p className="font-roboto">
                <strong>Winner:</strong> {winner}
              </p>
              <p className="font-roboto">
                <strong>Total Votes:</strong> {totalVotes}
              </p>
              <p className="font-roboto">
                <strong>Winning Percentage:</strong> {votesPercent}%
              </p>
              <p className="font-roboto">
                <strong>Voter Participation:</strong> {electionParticipation}%
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 font-roboto">Loading election details...</p>
      )}
    </div>
  );
};

export default ElectionDetail;