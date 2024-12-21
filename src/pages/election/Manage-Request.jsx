import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Manage-Request.css";

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
          console.log(result);
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
    <div className="manage-requests-container">
      <h1>Manage Requests</h1>
      {isLoading ? (
        <p>Loading requests...</p>
      ) : requests.length > 0 ? (
        <ul className="requests-list">
          {requests.map((request) => (
            <li key={request.voter_id} className="request-item">
              <div>
                <p><strong>Voter Name:</strong> {request.first_name} {request.last_name}</p>
                <p><strong>Email:</strong> {request.email}</p>
              </div>
              <div className="request-actions">
                <button
                  className="approve-button"
                  onClick={() => handleApprove(request.voter_id)}
                >
                  Approve
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleReject(request.voter_id)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending participation requests found for this election.</p>
      )}

      <button className="back-button" onClick={handleBack}>
        Back to Election Details
      </button>
    </div>
  );
};

export default ManageRequest;