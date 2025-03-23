import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Settings, Users, BarChart2, Home } from "lucide-react";

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionDetail = () => {
  const { userId, electionId } = useParams();
  const [election, setElection] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [acceptedVoters, setAcceptedVoters] = useState([]);
  const [electionEnded, setElectionEnded] = useState(false);
  const [electionResults, setElectionResults] = useState(false);
  const [resultsLaunched, setResultsLaunched] = useState(false);
  const [winner, setWinnerName] = useState();
  const [totalVotes, setTotalVotes] = useState();
  const [votesPercent, setVotesPercent] = useState();
  const [electionParticipation, setElectionParticipation] = useState();
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true); // Set loading state to true
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
      } finally {
        setIsLoading(false);
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
          {electionEnded && (
            <button
              className={`flex items-center w-full p-3 rounded-md ${activeTab === "results" ? "bg-[#004080]" : "hover:bg-[#004080]"}`}
              onClick={() => setActiveTab("results")}
            >
              <BarChart2 className="mr-2" />
              Results
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
        <button onClick={() => navigate(`/dashboard/${userId}`)} className="mt-4 bg-gray-200 text-[#003366] px-4 py-2 rounded-md">
          Back to Dashboard
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === "overview" && election && (
          <div>
            <h1 className="text-3xl font-bold text-[#003366] mb-4">{election.title} Overview</h1>
            <p className="text-gray-700 font-roboto mb-4">{election.election_code}</p>
            <p className="text-gray-700 font-roboto mb-4">{election.description}</p>

            {/* Display Start and End Date */}
            <p className="text-lg"><strong>Start Date:</strong> {startDate}</p>
            <p className="text-lg"><strong>End Date:</strong> {endDate}</p>
          </div>
        )}

        {activeTab === "voters" && (
          <div>
            <h2 className="text-2xl font-semibold text-[#003366] mb-4">Accepted Voters</h2>
            <button
              onClick={() => navigate(`/election/${userId}/manage-requests/${electionId}`)}
              className="bg-[#003366] text-white p-2 rounded font-roboto hover:bg-[#0a1622]"
            >
              Manage Requests
            </button>
            <ul>
              {acceptedVoters.map((voter) => (
                <li key={voter.voter_id} className="p-2 bg-gray-100 mb-2 rounded">
                  {voter.first_name} {voter.last_name} ({voter.email})
                </li>
              ))}
            </ul>
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
              <div>
                <p><strong>Winner:</strong> {winner}</p>
                <p><strong>Total Votes:</strong> {totalVotes}</p>
                <p><strong>Winning Percentage:</strong> {Math.floor(votesPercent)}%</p>
                <p><strong>Participation:</strong> {electionParticipation} Voter(s)</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-semibold text-[#003366] mb-4">Settings</h2>

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

            {/* Edit & Delete Buttons */}
            <button
              onClick={() => navigate(`/election/${userId}/update/${electionId}`)}
              className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ElectionDetail;