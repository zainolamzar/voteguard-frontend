import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const Dashboard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [joinedElections, setJoinedElections] = useState([]);
  const [tab, setTab] = useState("all"); // Tab for filtering elections

  useEffect(() => {
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

    fetchElections();
    fetchJoinedElections();
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    alert("You have successfully logged out.");
    navigate("/login");
  };

  const handleCreateElection = () => {
    navigate(`/election-form/${userId}`);
  };

  const handleViewElectionDetails = (electionId) => {
    navigate(`/election/${userId}/detail/${electionId}`);
  };

  const handleJoinElection = () => {
    navigate(`/voter/join/${userId}`);
  };

  const handleViewJoinedElectionDetails = (voterId, electionId) => {
    if (!voterId || !electionId) {
      console.error("Missing voterId or electionId");
      return;
    }
    navigate(`/election/${userId}/join/${voterId}/${electionId}/detail`);
  };

  const getStatus = (startDatetime, endDatetime) => {
    const now = new Date();

    if (now < new Date(startDatetime)) {
      return "In Process";
    } else if (now > new Date(endDatetime)) {
      return "Ended";
    } else {
      return "Ongoing";
    }
  };

  const filterElections = (elections) => {
    if (tab === "all") {
      return elections;
    }
  
    const now = new Date();
  
    return elections.filter((election) => {
      const startDatetime = new Date(election.start_datetime);
      const endDatetime = new Date(election.end_datetime);
  
      if (tab === "ongoing") {
        // Election is ongoing if now() is between start_datetime and end_datetime
        return now > startDatetime && now < endDatetime;
      } else if (tab === "in process") {
        // Election is in process if now() is before start_datetime
        return now < startDatetime;
      } else if (tab === "ended") {
        // Election is ended if now() is after end_datetime
        return now > endDatetime;
      }
      return false; // If tab does not match any condition, return false (fallback)
    });
  };

  const formatDateTime = (dateString) => {
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-MY", options).format(new Date(dateString));
  };
  
  return (
    <div className="dashboard-container">
      <div className="bg-[#003366] w-full text-white p-6 flex justify-between items-center">
        <div className="flex justify-center items-center w-full">
          <img src="logo.png" alt="Logo" className="h-12 w-auto" />
        </div>
        <button
          onClick={handleLogout}
          className="absolute right-6 px-4 py-2 text-white bg-[#D32F2F] hover:text-white hover:bg-[#541212]"
        >
          Logout
        </button>
      </div>
  
      <div className="text-center mt-10">
        <h1 className="text-3xl font-semibold">Welcome to Voteguard</h1>
      </div>
  
      <div className="my-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button onClick={() => setTab("all")} className="bg-[#003366] text-white hover:text-white hover:bg-[#001F3D] px-4 py-2 rounded">
            All
          </button>
          <button onClick={() => setTab("ongoing")} className="bg-[#00897B] text-white hover:text-white hover:bg-[#005249] px-4 py-2 rounded">
            Ongoing
          </button>
          <button onClick={() => setTab("in process")} className="bg-[#FFC107] text-white hover:text-white hover:bg-[#523D00] px-4 py-2 rounded">
            In Process
          </button>
          <button onClick={() => setTab("ended")} className="bg-[#D32F2F] text-white hover:text-white hover:bg-[#541212] px-4 py-2 rounded">
            Ended
          </button>
        </div>
  
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">My Elections</h2>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Election Card */}
            <div
              onClick={handleCreateElection}
              className="bg-[#003366] text-white p-6 rounded-lg shadow-lg cursor-pointer"
            >
              <h3 className="text-xl font-semibold">Create New Election</h3>
            </div>
  
            {filterElections(elections).map((election) => (
              <div
                key={election.election_id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleViewElectionDetails(election.election_id)}
              >
                <h3 className="text-xl font-semibold">{election.title}</h3>
                <p className="text-gray-600">Due: {formatDateTime(election.end_datetime)}</p>
                <p className={`mt-2 text-sm font-medium ${getStatus(election.start_datetime, election.end_datetime) === "Ongoing" ? 'text-green-500' : getStatus(election.start_datetime, election.end_datetime) === "In Process" ? 'text-yellow-500' : 'text-red-500'}`}>
                  {getStatus(election.start_datetime, election.end_datetime)}
                </p>
              </div>
            ))}
          </div>
        </div>
  
        <div className="mt-10">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Joined Elections</h2>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Join Election Card */}
            <div
              onClick={handleJoinElection}
              className="bg-[#003366] text-white p-6 rounded-lg shadow-lg cursor-pointer"
            >
              <h3 className="text-xl font-semibold">Join Election</h3>
            </div>
  
            {filterElections(joinedElections).map((election) => (
              <div
                key={election.election_id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl cursor-pointer"
                onClick={() => handleViewJoinedElectionDetails(election.voter_id, election.election_id)}
              >
                <h3 className="text-xl font-semibold">{election.title}</h3>
                <p className="text-gray-600">Due: {formatDateTime(election.end_datetime)}</p>
                <p className={`mt-2 text-sm font-medium ${getStatus(election.start_datetime, election.end_datetime) === "Ongoing" ? 'text-green-500' : getStatus(election.start_datetime, election.end_datetime) === "In Process" ? 'text-yellow-500' : 'text-red-500'}`}>
                  {getStatus(election.start_datetime, election.end_datetime)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;