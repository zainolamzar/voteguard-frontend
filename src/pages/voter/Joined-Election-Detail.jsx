import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Users, BarChart2, Home } from "lucide-react";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinedElectionDetail = () => {
  const { userId, voterId, electionId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptedVoters, setAcceptedVoters] = useState([]);
  const [vote, setVote] = useState("");
  const [error, setError] = useState("");
  const [electionStatus, setElectionStatus] = useState("");
  const [electionEnded, setElectionEnded] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [resultsLaunched, setResultsLaunched] = useState(false);
  const [winner, setWinnerName] = useState("");
  const [totalVotes, setTotalVotes] = useState("");
  const [votesPercent, setVotesPercent] = useState("");
  const [electionParticipation, setElectionParticipation] = useState("");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

          setStartDate(new Date(result.election.start_datetime).toLocaleString());
          setEndDate(new Date(result.election.end_datetime).toLocaleString());

          const electionEndDate = new Date(result.election.end_datetime);
          const currentDate = new Date();
          if (currentDate > electionEndDate) {
            setElectionEnded(true);
          }

          // Call status update after setting the state
          updateElectionStatus(result.election.start_datetime, result.election.end_datetime);
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

  const updateElectionStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    if (now < startDate) setElectionStatus("In Process");
    else if (now >= startDate && now <= endDate) setElectionStatus("Ongoing");
    else setElectionStatus("Ended");
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
    <div className="flex h-screen bg-[#F5F5F5]">
    {/* Sidebar Navigation */}
    <aside className="w-64 bg-[#003366] text-white flex flex-col p-6">
      <h2 className="text-xl font-bold mb-6">Election Dashboard</h2>
      <nav className="space-y-4 mb-6">
        <button
          className={`flex items-center w-full p-3 rounded-md ${activeTab === "overview" ? "bg-[#004080]" : "hover:bg-[#004080]"}`}
          onClick={() => setActiveTab("overview")}
        >
          <Home className="mr-2" />
          Overview
        </button>
        <button
          className={`flex items-center w-full p-3 rounded-md ${activeTab === "voters" ? "bg-[#004080]" : "hover:bg-[#004080]"}`}
          onClick={() => setActiveTab("voters")}
        >
          <Users className="mr-2" />
          Voters
        </button>
        {!electionEnded && (
          <button
            className={`flex items-center w-full p-3 rounded-md ${activeTab === "vote" ? "bg-[#004080]" : "hover:bg-[#004080]"}`}
            onClick={() => setActiveTab("vote")}
          >
            <BarChart2 className="mr-2" />
            Vote Now!
          </button>
        )}
        {electionEnded && (
          <button
            className={`flex items-center w-full p-3 rounded-md ${
              activeTab === "results" ? "bg-[#004080]" : "hover:bg-[#004080]"
            }`}
            onClick={() => setActiveTab("results")}
          >
            <BarChart2 className="mr-2" />
            Results
          </button>
        )}
      </nav>

      {/* Start and End Date */}
      {election && (
        <div className="mt-6 text-sm">
          <p><strong>Start:</strong> {startDate}</p>
          <p><strong>End:</strong> {endDate}</p>
        </div>
      )}

      {/* Back to Dashboard Button */}
      <button onClick={() => navigate(`/dashboard/${userId}`)} className="mt-4 bg-gray-200 text-[#003366] px-4 py-2 rounded-md">
        Back to Dashboard
      </button>
    </aside>

    {/* Main Content */}
    <div className="flex-1 p-8">
      {activeTab === "overview" && election && (
        <div>
          <div className="flex items-center gap-4 mb-4">
              {/* Election Title */}
              <h1 className="text-3xl font-bold text-[#003366] whitespace-nowrap">
                {election.title} Overview
              </h1>

              {/* Election Status */}
              <span
                className={`px-3 py-1 rounded text-white font-medium text-sm
                  ${
                    electionStatus === "Ongoing"
                      ? "bg-green-500"
                      : electionStatus === "In Process"
                      ? "bg-yellow-500"
                      : electionStatus === "Ended"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
              >
                {electionStatus}
              </span>
            </div>
          <p className="text-gray-700 font-roboto mb-4">{election.election_code}</p>
          <p className="text-gray-700 font-roboto mb-4">{election.description}</p>

          {/* Display Start and End Date */}
          <p className="text-lg"><strong>Start Date:</strong> {startDate}</p>
          <p className="text-lg"><strong>End Date:</strong> {endDate}</p>
        </div>
      )}

      {activeTab === "voters" && (
        <div>
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
      )}

      {activeTab === "vote" && (
        <>
          {new Date() > new Date(election.end_datetime) ? (
            <p className="font-roboto text-lg text-red-500">
              The election has ended.
            </p>
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
        </>
      )}
      
      {activeTab === "results" && (
        <div>
          <h2 className="text-2xl font-bold text-[#003366] mb-4">Election Results</h2>
      
          {/* Show Results Only If They Have Been Launched */}
          {new Date() > new Date(election.end_datetime) ? (
            resultsLaunched ? (
              <div className="result-container space-y-4 bg-[#003366] text-white p-6 rounded-lg">
                <p><strong>Winner:</strong> {winner}</p>
                <p><strong>Total Votes:</strong> {totalVotes}</p>
                <p><strong>Winning Percentage:</strong> {Math.floor(votesPercent)}%</p>
                <p><strong>Participation:</strong> {electionParticipation} Voter(s)</p>
              </div>
            ) : (
              <p className="font-roboto text-xl text-[#FFC107]">
                Election result will be released soon!
              </p>
            )
          ) : (
            <p className="font-roboto text-lg text-red-500">
              The election is still ongoing. Results will be available after it ends.
            </p>
          )}
        </div>
      )}

    </div>
    </div>
  );
};

export default JoinedElectionDetail;