import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Users, BarChart2, Home } from "lucide-react";
import Notification from "@/components/ui/notification";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinedElectionDetail = () => {
  const { userId, voterId, electionId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [notification, setNotification] = useState(null);
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
  const [countdown, setCountdown] = useState("00:00:00:00");
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
        setNotification({ 
          message: "An error occurred while fetching accepted voters.", 
          type: "error" 
        });
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
      setNotification({ 
        message: "Please select a vote option.", 
        type: "error" 
      });
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
        setNotification({ 
          message: result.message || "Failed to submit vote.", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      setNotification({ 
        message: "An error occurred while submitting your vote.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;

    const updateCountdown = () => {
      if (!election) return;

      let targetDate;
      if (electionStatus === "In Process") {
        targetDate = new Date(election.start_datetime);
      } else if (electionStatus === "Ongoing") {
        targetDate = new Date(election.end_datetime);
      } else {
        setCountdown("00:00:00:00");
        return;
      }

      const now = new Date();
      const timeDiff = targetDate - now;

      if (timeDiff <= 0) {
        setCountdown("00:00:00:00");
        return;
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
      const seconds = Math.floor((timeDiff / 1000) % 60);

      setCountdown(
        `${days.toString().padStart(2, "0")}:${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      );
    };

    updateCountdown();
    interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [election, electionStatus]);

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
      </nav>

      {/* Start and End Date */}
      {election && (
        <div className="mt-6 text-sm">
          <p><strong>Start:</strong> {startDate}</p>
          <p><strong>End:</strong> {endDate}</p>
        </div>
      )}

      {/* Back to Dashboard Button */}
      <button onClick={() => navigate(`/dashboard/${userId}`)} className="mt-4 bg-gray-200 text-[#003366] hover:bg-gray-400 hover:text-white transition px-4 py-2 rounded-md">
        Back to Dashboard
      </button>
    </aside>

    {/* Main Content */}
    <div className="flex-1 p-8">
      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
      
      {activeTab === "overview" && election && (
        <div>
          <div className="grid grid-cols-5 grid-rows-1 gap-4">
            {/* Left Side - Election Overview */}
            <div className="col-span-3">
              <div className="flex items-center gap-4 mb-4 w-full">
                <div className="flex-1 min-w-0">
                  <h1 className="text-4xl font-bold text-[#003366]">
                    {election.title} Overview
                  </h1>
                </div>

                <span
                  className={`px-3 py-1 rounded text-white font-medium text-m ${
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

              <p className="text-gray-700 font-roboto mb-[0.5rem] text-[1.2rem]">
                <strong>Description:</strong> {election.description}
              </p>
              
              {/* Display Start and End Date */}
              <p className="text-lg"><strong>Start Date:</strong> {startDate}</p>
              <p className="text-lg"><strong>End Date:</strong> {endDate}</p>
            </div>

            {/* Right Side - Countdown Timer */}
            <div className="col-span-2 col-start-4 flex flex-col justify-center items-end w-full h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-center w-fit">
                  <p className="text-lg font-semibold text-gray-800 text-center">
                    {electionStatus === "In Process"
                      ? "Election will start in"
                      : electionStatus === "Ongoing"
                      ? "Election will end in"
                      : "Election has ended"}
                  </p>

                  <div className="grid grid-cols-4 gap-2 w-full mt-2">
                    {countdown.split(":").map((time, index) => (
                      <div
                        key={index}
                        className="relative w-16 h-20 bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg flex flex-col items-center justify-center"
                      >
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-900 flex items-center justify-center border-b border-gray-700">
                          <span className="text-5xl font-bold translate-y-1/3">{time}</span>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-800 flex items-center justify-center">
                          <span className="text-5xl font-bold -translate-y-1/2">{time}</span>
                        </div>

                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-sm text-gray-300">
                          {["Days", "Hours", "Minutes", "Seconds"][index]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* "Vote Now!" Section (Visible only before election ends) */}
          {new Date() < new Date(election.end_datetime) && (
            <div className="mt-8 pt-6">
              <h2 className="text-3xl font-bold text-[#003366] mb-2">Vote Now!</h2>
              
              {isEligible ? (
                <div className="vote-options border-2 border-[#003366] border-double space-y-6">
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
          )}

          {/* "Result" Section (Visible only after election ends) */}
          {new Date() > new Date(election.end_datetime) && (
            <div className="mt-8 pt-6">
              <h2 className="text-3xl font-bold text-[#003366] mb-2">Election Results</h2>
              
              {resultsLaunched ? (
                <div className="grid grid-cols-4 grid-rows-3 gap-3">
                    <div className="col-span-2 bg-[#004080] hover:bg-[#002855] transition text-white 
                                    rounded-lg p-2 text-center shadow-md flex flex-col 
                                    items-center justify-center w-full h-full">
                      <p className="text-xl font-bold w-full">
                        <strong>Winner:</strong> {winner}
                      </p>
                    </div>

                    <div className="col-span-2 col-start-3 bg-[#004080] hover:bg-[#002855] transition text-white 
                                    rounded-lg p-2 text-center shadow-md flex flex-col 
                                    items-center justify-center w-full h-full">
                      <p className="text-xl font-bold w-full">
                        <strong>Total Votes:</strong> {totalVotes}
                      </p>
                    </div>
                    <div className="col-span-2 row-span-2 row-start-2 bg-[#004080] hover:bg-[#002855] transition text-white rounded-lg p-4 shadow-md flex items-center justify-center space-x-4">
                      {/* SVG Half-Circle Progress Bar */}
                      <svg width="100" height="60" viewBox="0 0 120 60">
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#FFA500" />
                          </linearGradient>
                        </defs>
                        
                        {/* Background Arc */}
                        <path d="M10,50 A50,50 0 0,1 110,50" stroke="#333" strokeWidth="8" fill="none" />
                        
                        {/* Progress Arc */}
                        <path 
                          d="M10,50 A50,50 0 0,1 110,50"
                          stroke="url(#progressGradient)" 
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="157"
                          strokeDashoffset={157 - (157 * votesPercent) / 100} 
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>

                      {/* Winning Percentage Text */}
                      <p className="text-lg font-semibold"><strong>Winning Percentage:</strong> {Math.floor(votesPercent)}%</p>
                    </div>
                    <div className="col-span-2 row-span-2 col-start-3 row-start-2 
                                    bg-[#004080] hover:bg-[#002855] transition text-white 
                                    rounded-lg p-2 text-center shadow-md flex flex-col 
                                    items-center justify-center w-full h-full">
                      <p className="text-lg font-semibold w-full">
                        <strong>Participation:</strong> {electionParticipation} Voter(s)
                      </p>
                    </div>
                </div>
              ) : (
                <p className="font-roboto text-xl text-[#FFC107]">
                  Election result will be released soon!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "voters" && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[#003366]">List of Voters</h2>
          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md shadow-md">
            {acceptedVoters.length > 0 ? (
              <table className="w-full border-collapse">
                <thead className="bg-[#003366] text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedVoters.map((voter, index) => (
                    <tr key={voter.voter_id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                      <td className="border px-4 py-2">{voter.first_name} {voter.last_name}</td>
                      <td className="border px-4 py-2">{voter.username}</td>
                      <td className="border px-4 py-2">{voter.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-600 font-roboto p-4">No accepted voters yet.</p>
            )}
          </div>
        </div>
      )}

    </div>
    </div>
  );
};

export default JoinedElectionDetail;