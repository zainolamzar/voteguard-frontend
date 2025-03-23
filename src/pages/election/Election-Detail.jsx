import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionDetail = () => {
  const { userId, electionId } = useParams();
  const [election, setElection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center py-8 px-4">
      {election ? (
        <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-8">
          <div className="flex justify-between mb-6 items-center">
            <Link to={`/dashboard/${userId}`} className="flex items-center text-gray-700">
              <ChevronLeft className="mr-2" />
              Back to Dashboard
            </Link>
            <div className="space-x-4">
              <button
                onClick={() => navigate(`/election/${userId}/update/${electionId}`)}
                className="bg-[#00897B] text-white p-2 rounded font-roboto hover:bg-[#00695C]"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className="bg-[#D32F2F] text-white p-2 rounded font-roboto hover:bg-[#B71C1C]"
              >
                Delete
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-poppins font-bold text-[#003366] mb-4">
            {election.title}'s Dashboard
          </h1>
          <p className="text-sm text-gray-600 font-roboto mb-4">
            <strong>Code:</strong> {election.election_code}
          </p>
          <p className="text-gray-700 font-roboto mb-4">{election.description}</p>
          <p className="text-gray-700 font-roboto mb-2">
            <strong>Start Date and Time:</strong>{" "}
            {new Date(election.start_datetime).toLocaleString("en-MY", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          <p className="text-gray-700 font-roboto mb-6">
            <strong>End Date and Time:</strong>{" "}
            {new Date(election.end_datetime).toLocaleString("en-MY", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
            <h2
              className="text-xl font-semibold text-[#003366] cursor-pointer hover:underline flex items-center"
              onClick={openModal}
            >
              List of Accepted Voters {'>'}
            </h2>
              <button
                onClick={() => navigate(`/election/${userId}/manage-requests/${electionId}`)}
                className="bg-[#003366] text-white p-2 rounded font-roboto hover:bg-[#0a1622]"
              >
                Manage Requests
              </button>
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
                  <h2 className="text-xl font-semibold mb-4 text-[#003366]">List of Accepted Voters</h2>
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

          <div className="space-y-4">
            {electionEnded && !resultsLaunched && (
              <button
                onClick={handleLaunchResults}
                className="w-full bg-[#FFC107] text-white p-2 rounded font-roboto hover:bg-[#FF9800]"
              >
                {isLoading ? "Loading..." : "Launch Results"}
              </button>
            )}
          </div>

          {electionResults && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-[#003366] mb-4">Election Results</h3>
              <p className="text-sm text-gray-600 font-roboto mb-2">
                <strong>Winner: </strong>{winner}
              </p>
              <p className="text-sm text-gray-600 font-roboto mb-2">
                <strong>Total Votes: </strong>{totalVotes}
              </p>
              <p className="text-sm text-gray-600 font-roboto">
                <strong>Winning Percentage: </strong>{Math.floor(votesPercent)}%
              </p>
              <p className="text-sm text-gray-600 font-roboto mt-4">
                <strong>Election Participation: </strong>{electionParticipation} Voter/s
              </p>
            </div>
          )}
        </div>
      ) : (
        <p>Loading election details...</p>
      )}
    </div>
  );
};

export default ElectionDetail;