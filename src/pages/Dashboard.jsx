import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Notification from "@/components/ui/notification";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const apiUrl = import.meta.env.VITE_BE_URL;

const Dashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [username, setUsername] = useState("");
  const [elections, setElections] = useState([]);
  const [joinedElections, setJoinedElections] = useState([]);
  const [tab, setTab] = useState("all"); // Election status tab
  const [activeSection, setActiveSection] = useState("myElections"); // Sidebar navigation

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users/${userId}`);
        const result = await response.json();
        if (response.ok) {
          setUsername(result.data.username);
        } else {
          setNotification({ 
            message: "Failed to fetch user details.", 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        setNotification({ 
          message: "An error occurred while fetching user details.", 
          type: "error" 
        });
      }
    };

    const fetchElections = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/elections/${userId}/election`);
        const result = await response.json();
        if (response.ok) {
          setElections(result);
        } else {
          setNotification({ 
            message: "Failed to fetch elections.", 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        setNotification({ 
          message: "An error occurred while fetching elections.", 
          type: "error" 
        });
      }
    };

    const fetchJoinedElections = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/joined-elections`);
        const result = await response.json();
        if (response.ok) {
          setJoinedElections(result.joinedElections);
        } else {
          setNotification({ 
            message: "Failed to fetch joined elections.", 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error fetching joined elections:", error);
        setNotification({ 
          message: "An error occurred while fetching joined elections.", 
          type: "error" 
        });
      }
    };

    fetchUsername();
    fetchElections();
    fetchJoinedElections();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    setNotification({ 
      message: "You have successfully logged out.", 
      type: "success" 
    });
    navigate("/login");
  };

  const getStatus = (startDatetime, endDatetime) => {
    const now = new Date();
    if (now < new Date(startDatetime)) return "In Process";
    if (now > new Date(endDatetime)) return "Ended";
    return "Ongoing";
  };

  const filterElections = (elections) => {
    if (tab === "all") return elections;
    const now = new Date();
    return elections.filter(({ start_datetime, end_datetime }) => {
      const start = new Date(start_datetime);
      const end = new Date(end_datetime);
      return (tab === "ongoing" && now > start && now < end) ||
             (tab === "in process" && now < start) ||
             (tab === "ended" && now > end);
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-[#003366] text-white flex flex-col items-start p-6">
        <div className="mb-[20%] mt-4 flex w-full justify-center">
          <h1 className="text-2xl font-semibold">Hi, {username}!</h1>
        </div>
        <button
          className={`w-full text-left py-3 px-4 rounded ${activeSection === "myElections" ? "bg-[#0059b3]" : ""}`}
          onClick={() => setActiveSection("myElections")}
        >
          My Elections
        </button>
        <button
          className={`w-full text-left py-3 px-4 rounded ${activeSection === "joinedElections" ? "bg-[#0059b3]" : ""}`}
          onClick={() => setActiveSection("joinedElections")}
        >
          Joined Elections
        </button>
        <button
          onClick={handleLogout}
          className="mt-auto w-full py-3 px-4 bg-[#D32F2F] hover:bg-[#541212] rounded flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>

          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-[#c4dcff] w-full text-white p-6 flex justify-center">
          <img
            src="/src/assets/second-logo.png"
            alt="Voteguard Logo"
            className="h-16 w-auto drop-shadow-[0px_0px_8px_white] drop-shadow-[0px_0px_1px_white]"
          />
        </div>

        <div className="p-8">
          {notification && (
            <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
          )}
          
          {activeSection === "myElections" && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6">My Elections</h2>

              {/* Election Status Tabs */}
              <div className="flex justify-center space-x-4 mb-6">
                {["all", "ongoing", "in process", "ended"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTab(status)}
                    className={`px-4 py-2 rounded transition ${
                      tab === status
                        ? "bg-[#003366] text-white"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400 hover:text-gray-100"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <div onClick={() => navigate(`/election-form/${userId}`)}
                            className="bg-[#003366] hover:bg-[#112a43] text-white p-6 rounded-lg shadow-lg cursor-pointer">
                            <h3 className="text-xl font-semibold">Create New Election</h3>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            Add new election
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {filterElections(elections).map((election) => {
                  const status = getStatus(election.start_datetime, election.end_datetime);
                  const bgColor = status === "Ongoing" ? "bg-[#00897B]" 
                                : status === "In Process" ? "bg-[#FFC107]" 
                                : "bg-[#D32F2F]";

                  return (
                    <div
                      key={election.election_id}
                      onClick={() => navigate(`/election/${userId}/detail/${election.election_id}`)}
                      className={`${bgColor} text-white p-6 rounded-lg shadow-lg cursor-pointer`}
                    >
                      <h3 className="text-xl font-semibold">{election.title}</h3>
                      <p className="text-gray-100">Due: {new Date(election.end_datetime).toLocaleString()}</p>
                      <p className="mt-2 text-sm font-medium">{status}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeSection === "joinedElections" && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6">Joined Elections</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <div onClick={() => navigate(`/voter/join/${userId}`)}
                            className="bg-[#003366] hover:bg-[#112a43] text-white p-6 rounded-lg shadow-lg cursor-pointer">
                            <h3 className="text-xl font-semibold">Join Election</h3>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            Join an election
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {filterElections(joinedElections).map((election) => {
                  const status = getStatus(election.start_datetime, election.end_datetime);
                  const bgColor = status === "Ongoing" ? "bg-[#00897B]" 
                                : status === "In Process" ? "bg-[#FFC107]" 
                                : "bg-[#D32F2F]";

                  return (
                    <div
                      key={election.election_id}
                      onClick={() => navigate(`/election/${userId}/join/${election.voter_id}/${election.election_id}/detail`)}
                      className={`${bgColor} text-white p-6 rounded-lg shadow-lg cursor-pointer`}
                    >
                      <h3 className="text-xl font-semibold">{election.title}</h3>
                      <p className="text-gray-100">Due: {new Date(election.end_datetime).toLocaleString()}</p>
                      <p className="mt-2 text-sm font-medium">{status}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;