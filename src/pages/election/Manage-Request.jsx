import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const ManageRequest = () => {
  const { userId, electionId } = useParams(); // Get userId and electionId from URL
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]); // State to hold the list of voter requests
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch voter requests for the specific election
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/requests/${electionId}`);
        const result = await response.json();

        if (response.ok) {
          setRequests(result.requests);
        } else {
          alert(`Error: ${result.message}`);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert("An error occurred while fetching requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [userId, electionId]);

  const handleApprove = async (voterId) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/voters/${userId}/requests/${electionId}/approve/${voterId}`,
        { method: "PUT" }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Request approved successfully.");
        setRequests(requests.filter((req) => req.voter_id !== voterId)); // Remove the approved request from the list
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("An error occurred while approving the request.");
    }
  };

  const handleReject = async (voterId) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/voters/${userId}/requests/${electionId}/reject/${voterId}`,
        { method: "PUT" }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Request rejected successfully.");
        setRequests(requests.filter((req) => req.voter_id !== voterId)); // Remove the rejected request from the list
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("An error occurred while rejecting the request.");
    }
  };

  const handleBack = () => {
    navigate(`/election/${userId}/detail/${electionId}`); // Navigate back to Election-Detail page
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8 px-6 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-poppins font-bold text-[#003366] text-center mb-8">
          Manage Participation Requests
        </h1>

        {isLoading ? (
          <p className="text-gray-600 font-roboto text-center">Loading requests...</p>
        ) : requests.length > 0 ? (
          <ul className="space-y-4">
            {requests.map((request) => (
              <li key={request.voter_id} className="bg-[#FFFFFF] p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <p className="text-lg font-roboto font-semibold text-[#003366]">
                    {request.first_name} {request.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{request.email}</p>
                </div>
                <div className="space-x-4">
                  <button
                    className="px-6 py-2 bg-[#00897B] text-white font-roboto rounded-lg hover:bg-[#00695C] focus:outline-none"
                    onClick={() => handleApprove(request.voter_id)}
                  >
                    Approve
                  </button>
                  <button
                    className="px-6 py-2 bg-[#D32F2F] text-white font-roboto rounded-lg hover:bg-[#B71C1C] focus:outline-none"
                    onClick={() => handleReject(request.voter_id)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 font-roboto text-center">
            No pending participation requests found for this election.
          </p>
        )}

        <div className="mt-6 text-center">
          <button
            className="px-6 py-3 bg-[#003366] text-white font-roboto rounded-lg hover:bg-[#002147] focus:outline-none"
            onClick={handleBack}
          >
            Back to Election Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageRequest;