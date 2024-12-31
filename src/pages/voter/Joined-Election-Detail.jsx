import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinedElectionDetail = () => {
  const { userId, voterId, electionId } = useParams();
  const navigate = useNavigate(); // Added navigate hook
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
    <div className="bg-[#F5F5F5] min-h-screen py-12 px-6 flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-poppins font-bold text-[#003366] text-center mb-6">
          Election Details
        </h1>

        {error && <p className="text-red-600 font-roboto text-center">{error}</p>}

        <button
          onClick={() => navigate(`/dashboard/${userId}`)}
          className="mt-4 mb-8 bg-[#003366] text-white font-roboto rounded-full py-2 px-6 text-lg hover:bg-[#001F44] transition duration-300"
        >
          Go Back to Dashboard
        </button>

        {election ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-poppins text-[#003366]">{election.title}</h2>
            <p className="font-roboto text-gray-700">{election.description}</p>
            <p className="font-roboto text-lg text-[#003366]">
              <strong>Start Time:</strong> {new Date(election.start_datetime).toLocaleString()}
            </p>
            <p className="font-roboto text-lg text-[#003366]">
              <strong>End Time:</strong> {new Date(election.end_datetime).toLocaleString()}
            </p>

            {new Date() > new Date(election.end_datetime) ? (
              resultsLaunched ? (
                <div className="result-container space-y-4 bg-[#003366] text-white p-6 rounded-lg">
                  <h3 className="text-xl font-poppins">Election Results</h3>
                  <p><strong>Participation:</strong> {electionParticipation} Voter(s)</p>
                  <p><strong>Winner:</strong> {winner}</p>
                  <p><strong>Total Votes:</strong> {totalVotes}</p>
                  <p><strong>Winning Percentage:</strong> {votesPercent}%</p>
                </div>
              ) : (
                <p className="font-roboto text-xl text-[#FFC107]">Election result will be released soon!</p>
              )
            ) : isEligible ? (
              <div className="vote-options space-y-6">
                <h3 className="text-lg font-roboto text-[#003366]">Select your vote:</h3>
                {election.options && election.options.length > 0 ? (
                  <form>
                    {election.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`option-${index}`}
                          name="vote"
                          value={option.id}
                          checked={vote === option.id}
                          onChange={() => setVote(option.id)}
                          className="h-5 w-5"
                        />
                        <label htmlFor={`option-${index}`} className="font-roboto">
                          <strong>{option.name}</strong> - {option.description}
                        </label>
                      </div>
                    ))}
                  </form>
                ) : (
                  <p>No voting options available.</p>
                )}
                <button
                  onClick={handleVoteSubmit}
                  className="w-full py-3 bg-[#00897B] text-white font-roboto rounded-lg hover:bg-[#00695C] transition duration-300"
                >
                  Submit Vote
                </button>
              </div>
            ) : (
              <p className="font-roboto text-lg text-red-500">
                {election.has_voted === 1
                  ? "You have already voted in this election."
                  : new Date() < new Date(election.start_datetime)
                  ? "The election has not started yet."
                  : "The election has ended."}
              </p>
            )}
          </div>
        ) : (
          <p className="text-center font-roboto text-gray-600">Loading election details...</p>
        )}
      </div>
    </div>
  );
};

export default JoinedElectionDetail;