import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinedElectionDetail = () => {
  const { userId, voterId, electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptedVoters, setAcceptedVoters] = useState([]);
  const [vote, setVote] = useState("");
  const [error, setError] = useState("");
  const [isEligible, setIsEligible] = useState(false);
  const [resultsLaunched, setResultsLaunched] = useState(false);
  const [winner, setWinnerName] = useState("");
  const [totalVotes, setTotalVotes] = useState("");
  const [votesPercent, setVotesPercent] = useState("");
  const [electionParticipation, setElectionParticipation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVotingLimitation = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${voterId}/limitation`);
        const result = await response.json();

        if (response.ok) {
          const { isEligibleToVote, ...limitation } = result.data;
          setIsEligible(isEligibleToVote);
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

    const fetchVoters = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/list-voters/${electionId}`);
        if (!response.ok) throw new Error("Failed to fetch accepted voters.");
        const result = await response.json();
        setAcceptedVoters(result.acceptedVoters);
      } catch (error) {
        console.error("Error fetching accepted voters:", error);
        alert("An error occurred while fetching accepted voters.");
      }
    };

    const fetchElectionResults = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/results/${electionId}`);
        const result = await response.json();

        if (response.ok) {
          setResultsLaunched(true);
          setWinnerName(result.result.winner.name);
          setTotalVotes(result.result.total_votes);
          setVotesPercent(result.result.winning_percent);
          setElectionParticipation(result.result.participation);
        } else {
          setResultsLaunched(false);
        }
      } catch (error) {
        console.error("Error fetching election results:", error);
        setResultsLaunched(false);
      }
    };

    fetchVotingLimitation();
    fetchElectionDetails();
    fetchVoters();
    fetchElectionResults();
  }, [voterId, electionId]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    };
    return new Date(dateString).toLocaleString('en-GB', options);
  };

  const handleVoteSubmit = async () => {
    if (!vote) {
      alert("Please select a vote option.");
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-12 px-6 flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl">
        <Link to={`/dashboard/${userId}`} className="flex items-center text-gray-700">
              <ChevronLeft className="mr-2" />
              Back to Dashboard
        </Link>
        {/* <h1 className="text-3xl font-poppins font-bold text-[#003366] text-center mb-6">
          Election Details
        </h1> */}

        {error && <p className="text-red-600 font-roboto text-center">{error}</p>}


        {election ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-poppins font-bold text-[#003366] text-center mb-6">{election.title}'s Dashboard</h1>
            <p className="font-roboto text-gray-700">{election.description}</p>
            <p className="font-roboto text-lg text-[#003366]">
              <strong>Start Time:</strong> {formatDate(election.start_datetime)}
            </p>
            <p className="font-roboto text-lg text-[#003366]">
              <strong>End Time:</strong> {formatDate(election.end_datetime)}
            </p>

            <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
            <h2
              className="text-xl font-semibold text-[#003366] cursor-pointer hover:underline flex items-center"
              onClick={openModal}
            >
              List of Voters {'>'}
            </h2>
            </div>
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white w-[90%] md:w-1/3 rounded-lg shadow-lg p-6 relative">
                  {/* Close Button (X) */}
                  <button
                    onClick={closeModal}
                    className="absolute top-3 right-3 text-[#003366] hover:text-[#002244] text-lg font-semibold"
                  >
                    &times;
                  </button>

                  {/* Modal Content */}
                  <h2 className="text-xl font-semibold mb-4 text-[#003366]">List of Voters</h2>
                  <div className="max-h-60 overflow-y-auto">
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
                </div>
              </div>
            )}
          </div>

            {new Date() > new Date(election.end_datetime) ? (
              resultsLaunched ? (
                <div className="result-container space-y-4 bg-[#003366] text-white p-6 rounded-lg">
                  <h3 className="text-xl font-poppins">Election Results</h3>
                  <p><strong>Participation:</strong> {electionParticipation} Voter(s)</p>
                  <p><strong>Winner:</strong> {winner}</p>
                  <p><strong>Total Votes:</strong> {totalVotes}</p>
                  <p><strong>Winning Percentage:</strong> {Math.floor(votesPercent)}%</p>
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
                  disabled={loading}
                  className={`w-full py-3 text-white font-roboto rounded-lg transition duration-300 ${
                    loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#00897B] hover:bg-[#00695C]"
                  }`}
                >
                  {loading ? "Loading..." : "Submit Vote"}
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