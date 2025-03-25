import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Settings, Users, BarChart2, Home } from "lucide-react";

import Notification from "@/components/ui/notification";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import "../styles/countdown.css";

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionDetail = () => {
  const { userId, electionId } = useParams();
  const [election, setElection] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [acceptedVoters, setAcceptedVoters] = useState([]);
  const [notification, setNotification] = useState(null);
  const [electionEnded, setElectionEnded] = useState(false);
  const [electionStatus, setElectionStatus] = useState("");
  const [electionResults, setElectionResults] = useState(false);
  const [resultsLaunched, setResultsLaunched] = useState(false);
  const [winner, setWinnerName] = useState();
  const [totalVotes, setTotalVotes] = useState();
  const [votesPercent, setVotesPercent] = useState();
  const [electionParticipation, setElectionParticipation] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalAcceptedVoters, setTotalAcceptedVoters] = useState(0);
  const [countdown, setCountdown] = useState("00:00:00:00");
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/elections/${userId}/${electionId}`);
        const result = await response.json();
        if (response.ok) {
          setElection(result.election);
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
          setNotification({ 
            message: "Failed to fetch election details.", 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error fetching election details:", error);
        setNotification({ 
          message: "An error occurred while fetching election details.", 
          type: "error" 
        });
      }
    };

    const fetchPendingRequests = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/requests/${electionId}`);
        const result = await response.json();
    
        if (response.ok) {
          setPendingRequests(result.requests.length);
        } else {
          setNotification({ 
            message: `Error: ${result.message || "Failed to fetch pending requests"}`, 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        setNotification({ 
          message: "An error occurred while fetching pending requests.", 
          type: "error" 
        });
      }
    };    

    const fetchAcceptedVoters = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/accepted-voters/${electionId}`);
        if (!response.ok) throw new Error("Failed to fetch accepted voters.");
        
        const result = await response.json();
        const totalAcceptedVoters = result.acceptedVoters.length; // Calculate total accepted voters
        
        setAcceptedVoters(result.acceptedVoters);
        setTotalAcceptedVoters(totalAcceptedVoters); // Store the total count in state
      } catch (error) {
        console.error("Error fetching accepted voters:", error);
        setNotification({ 
          message: "An error occurred while fetching accepted voters.", 
          type: "error" 
        });
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
            setNotification({ 
              message: "Election results not yet available.", 
              type: "error" 
            });
          }
        } catch (error) {
          console.error("Error fetching election results:", error);
          setNotification({ 
            message: "An error occurred while fetching the election results.", 
            type: "error" 
          });
        }
      }
    };

    fetchElectionDetails();
    fetchPendingRequests();
    fetchAcceptedVoters();
    fetchElectionResults();
  }, [userId, electionId, electionEnded]);

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
        `${days.toString().padStart(2, "0")}:${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };
  
    updateCountdown();
    interval = setInterval(updateCountdown, 1000);
  
    return () => clearInterval(interval);
  }, [election, electionStatus]);

  const updateElectionStatus = (start, end) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    if (now < startDate) setElectionStatus("In Process");
    else if (now >= startDate && now <= endDate) setElectionStatus("Ongoing");
    else setElectionStatus("Ended");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(election.election_code);
    setNotification({ 
      message: "Copied!", 
      type: "success" 
    });
  };

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
          setNotification({ 
            message: "Election deleted successfully.", 
            type: "success" 
          });
          navigate(`/dashboard/${userId}`);
        } else {
          setNotification({ 
            message: "Failed to delete election.", 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error deleting election:", error);
        setNotification({ 
          message: "An error occurred while deleting the election.", 
          type: "error" 
        });
      }
    }
  };

  const handleLaunchResults = async () => {
      setIsLoading(true); // Set loading state to true
      try {
        const response = await fetch(`${apiUrl}/api/results/${userId}/${electionId}/generate`);
        const result = await response.json();
        if (response.ok) {
          setElectionResults(result);
          setResultsLaunched(true);
          setNotification({ 
            message: "Election results have been successfully generated!", 
            type: "success" 
          });
          window.location.reload();
        } else {
          setNotification({ 
            message: "Failed to generate election results.", 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error fetching election results:", error);
        setNotification({ 
          message: "An error occurred while fetching the election results.", 
          type: "error" 
        });
      } finally {
        setIsLoading(false);
      }
  };

  const calculateDuration = (start, end) => {
      if (!start || !end) return "N/A"; // Handle missing dates

      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate - startDate); // Difference in milliseconds

      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
      const hours = Math.floor((diffTime / (1000 * 60 * 60)) % 24); // Convert to hours
      const minutes = Math.floor((diffTime / (1000 * 60)) % 60); // Convert to minutes

      return `${days}d ${hours}h ${minutes}m`;
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
          {electionEnded && (
            <button
              className={`flex items-center w-full p-3 rounded-md ${activeTab === "results" ? "bg-[#004080]" : "hover:bg-[#004080]"}`}
              onClick={() => setActiveTab("results")}
            >
              <BarChart2 className="mr-2" />
              Result
            </button>
          )}
          <button
            className={`flex items-center w-full p-3 rounded-md ${activeTab === "settings" ? "bg-[#004080]" : "hover:bg-[#004080]"}`}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2" />
            Settings
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
        <button onClick={() => navigate(`/dashboard/${userId}`)} className="mt-4 bg-gray-200 hover:bg-gray-400 hover:text-white transition text-[#003366] px-4 py-2 rounded-md">
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
            <div className="flex items-center gap-4 mb-4">
              {/* Election Title */}
              <h1 className="text-4xl font-bold text-[#003366] whitespace-nowrap">
                {election.title} Overview
              </h1>

              {/* Election Status */}
              <span
                className={`px-3 py-1 rounded text-white font-medium text-m
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

            <p className="text-gray-700 font-roboto mb-[2.5rem] text-[1.2rem]"><strong>Description:</strong> {election.description}</p>
            
            
            <div className="grid grid-cols-5 grid-rows-2 gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div 
                                className="col-span-3 row-span-1 col-start-1 row-start-1 cursor-pointer bg-[#003366] text-white rounded-lg p-6 shadow-md flex items-center justify-center hover:bg-[#002855] transition"
                                onClick={handleCopy}
                            >
                                <div className="grid grid-cols-7 gap-2 w-full h-full place-items-center">
                                    {election.election_code.split("").map((char, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center justify-center border border-gray-500 bg-[#0059b3] font-mono text-3xl text-gray-100 rounded-md shadow w-full h-full"
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            Click to copy election code
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="col-span-2 row-span-1 col-start-4 row-start-1 flex flex-col items-center justify-center bg-[#003366] hover:bg-[#002855] transition rounded-lg p-4 shadow-md w-full h-full">
                    <p className="text-lg font-semibold text-gray-100 text-center w-full">
                        {electionStatus === "In Process"
                            ? "Election will start in"
                            : electionStatus === "Ongoing"
                            ? "Election will end in"
                            : "Election has ended"}
                    </p>

                    <div className="grid grid-cols-4 gap-2 w-full mt-2">
                        {countdown.split(":").map((time, index) => (
                            <div key={index} className="relative w-full h-20 bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg flex flex-col items-center justify-center">
                                
                                {/* Top Half */}
                                <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-900 flex items-center justify-center border-b border-gray-700 overflow-hidden">
                                    <span className="text-5xl font-bold translate-y-1/3">{time}</span>
                                </div>

                                {/* Bottom Half */}
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-800 flex items-center justify-center overflow-hidden">
                                    <span className="text-5xl font-bold -translate-y-1/2">{time}</span>
                                </div>

                                {/* Label (Days, Hours, etc.) */}
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-sm text-gray-300">
                                    {["Days", "Hours", "Minutes", "Seconds"][index]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="row-span-1 col-start-1 row-start-2 bg-[#004080] hover:bg-[#002855] transition text-white rounded-lg p-4 text-center shadow-md flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" />
                      <path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z" />
                    </svg>
                    <p className="text-sm font-semibold">Total Voters</p>
                    <p className="text-5xl font-bold">{totalAcceptedVoters}</p>
                </div>

                <div className="row-span-1 col-start-2 row-start-2 bg-[#004080] hover:bg-[#002855] transition text-white rounded-lg p-4 text-center shadow-md flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-semibold">Total Requests</p>
                    <p className="text-5xl font-bold">{pendingRequests}</p>
                </div>

                <div className="row-span-1 col-start-3 row-start-2 bg-[#004080] hover:bg-[#002855] transition text-white rounded-lg p-4 text-center shadow-md flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v.756a49.106 49.106 0 0 1 9.152 1 .75.75 0 0 1-.152 1.485h-1.918l2.474 10.124a.75.75 0 0 1-.375.84A6.723 6.723 0 0 1 18.75 18a6.723 6.723 0 0 1-3.181-.795.75.75 0 0 1-.375-.84l2.474-10.124H12.75v13.28c1.293.076 2.534.343 3.697.776a.75.75 0 0 1-.262 1.453h-8.37a.75.75 0 0 1-.262-1.453c1.162-.433 2.404-.7 3.697-.775V6.24H6.332l2.474 10.124a.75.75 0 0 1-.375.84A6.723 6.723 0 0 1 5.25 18a6.723 6.723 0 0 1-3.181-.795.75.75 0 0 1-.375-.84L4.168 6.241H2.25a.75.75 0 0 1-.152-1.485 49.105 49.105 0 0 1 9.152-1V3a.75.75 0 0 1 .75-.75Zm4.878 13.543 1.872-7.662 1.872 7.662h-3.744Zm-9.756 0L5.25 8.131l-1.872 7.662h3.744Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-semibold">Duration</p>
                    <p className="text-4xl font-bold">{calculateDuration(startDate, endDate)}</p>
                </div>

                <div className="row-span-1 col-start-4 row-start-2 bg-[#004080] hover:bg-[#002855] transition text-white rounded-lg p-4 text-center shadow-md flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-semibold">Start Date</p>
                    <p className="text-xl font-bold">{startDate}</p>
                </div>

                <div className="row-span-1 col-start-5 row-start-2 bg-[#004080] hover:bg-[#002855] transition text-white rounded-lg p-4 text-center shadow-md flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-semibold">End Date</p>
                    <p className="text-xl font-bold">{endDate}</p>
                </div>
            </div>
          </div>
        )}

        {activeTab === "voters" && (
          <div>
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-[#003366]">Accepted Voters</h2>

              {!electionStatus.includes("Ongoing") && !electionStatus.includes("Ended") && (
                <button
                  onClick={() => navigate(`/election/${userId}/manage-requests/${electionId}`)}
                  className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2 font-roboto 
                            hover:bg-[#0a1622] transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                  </svg>

                  Manage Requests
                </button>
              )}
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-[#003366] text-white">
                    <th className="p-2 border border-gray-300">Name</th>
                    <th className="p-2 border border-gray-300">Username</th>
                    <th className="p-2 border border-gray-300">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedVoters.map((voter) => (
                    <tr key={voter.voter_id} className="bg-[#c4dcff] text-center">
                      <td className="p-2 border border-gray-300">{voter.first_name} {voter.last_name}</td>
                      <td className="p-2 border border-gray-300">{voter.username}</td>
                      <td className="p-2 border border-gray-300">{voter.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div>
            <h2 className="text-2xl font-bold text-[#003366] mb-4">Election Results</h2>

            {/* Show Launch Results Button Only if Results Are Not Launched */}
            {electionEnded && !resultsLaunched && (
              <button
                onClick={handleLaunchResults}
                className="w-full bg-[#FFC107] text-white p-2 rounded font-roboto hover:bg-[#FF9800]"
              >
                {isLoading ? "Loading..." : "Launch Results"}
              </button>
            )}

            {/* Show Results Only If They Have Been Launched */}
            {resultsLaunched && (
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
    
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            {/* Title and Buttons in Flexbox */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-[#003366]">Settings</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/election/${userId}/update/${electionId}`)}
                  className="bg-green-600 hover:bg-green-800 transition text-white px-4 py-2 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487l3.651 3.651m-2.122 2.122L14.74 5.61m4.473-2.122a2.121 2.121 0 10-3 3l-9.49 9.49a2 2 0 00-.494.866l-1.028 4.113a1 1 0 001.21 1.211l4.112-1.029a2 2 0 00.866-.494l9.49-9.49z" />
                  </svg>
                  Edit
                </button>
                
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-800 transition text-white px-4 py-2 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>

            {/* Election Information Table */}
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <tbody>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 bg-[#003366] text-white px-4 py-2 font-bold">Title:</td>
                  <td className="border border-gray-300 px-4 py-2">{election.title}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 bg-[#003366] text-white px-4 py-2 font-bold">Description:</td>
                  <td className="border border-gray-300 px-4 py-2">{election.description}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 bg-[#003366] text-white px-4 py-2 font-bold">Start Date:</td>
                  <td className="border border-gray-300 px-4 py-2">{startDate}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 bg-[#003366] text-white px-4 py-2 font-bold">End Date:</td>
                  <td className="border border-gray-300 px-4 py-2">{endDate}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 bg-[#003366] text-white px-4 py-2 font-bold">Options:</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <ul className="list-disc ml-4">
                      {election.options.map((option, index) => (
                        <li key={index}>{option.name} - {option.description}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default ElectionDetail;