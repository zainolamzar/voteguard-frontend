import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const Dashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
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
          alert("Failed to fetch user details.");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
        alert("An error occurred while fetching user details.");
      }
    };

    const fetchElections = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/elections/${userId}/election`);
        const result = await response.json();
        if (response.ok) {
          setElections(result);
        } else {
          alert("Failed to fetch elections.");
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        alert("An error occurred while fetching elections.");
      }
    };

    const fetchJoinedElections = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/joined-elections`);
        const result = await response.json();
        if (response.ok) {
          setJoinedElections(result.joinedElections);
        } else {
          alert("Failed to fetch joined elections.");
        }
      } catch (error) {
        console.error("Error fetching joined elections:", error);
        alert("An error occurred while fetching joined elections.");
      }
    };

    fetchUsername();
    fetchElections();
    fetchJoinedElections();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    alert("You have successfully logged out.");
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
        <img src="/src/assets/main-logo.png" alt="Logo" className="h-16 w-auto mb-6" />
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
          className="mt-auto w-full py-3 px-4 bg-[#D32F2F] hover:bg-[#541212] rounded"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-[#003366] w-full text-white p-6 flex justify-center">
          <h1 className="text-2xl font-semibold">Welcome, {username}!</h1>
        </div>

        <div className="p-8">
          {activeSection === "myElections" && (
            <>
              <h2 className="text-2xl font-semibold text-center mb-6">My Elections</h2>

              {/* Election Status Tabs */}
              <div className="flex justify-center space-x-4 mb-6">
                {["all", "ongoing", "in process", "ended"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setTab(status)}
                    className={`px-4 py-2 rounded ${tab === status ? "bg-[#003366] text-white" : "bg-gray-300"}`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div onClick={() => navigate(`/election-form/${userId}`)}
                  className="bg-[#003366] text-white p-6 rounded-lg shadow-lg cursor-pointer">
                  <h3 className="text-xl font-semibold">Create New Election</h3>
                </div>

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
                <div onClick={() => navigate(`/voter/join/${userId}`)}
                  className="bg-[#003366] text-white p-6 rounded-lg shadow-lg cursor-pointer">
                  <h3 className="text-xl font-semibold">Join Election</h3>
                </div>

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