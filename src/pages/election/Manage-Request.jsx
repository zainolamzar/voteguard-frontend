import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Notification from "@/components/ui/notification";

const apiUrl = import.meta.env.VITE_BE_URL;

const ManageRequest = () => {
  const { userId, electionId } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [requests, setRequests] = useState([]); // State to hold the list of voter requests
  const [filteredRequests, setFilteredRequests] = useState([]); // State to hold filtered requests
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch voter requests for the specific election
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/voters/${userId}/requests/${electionId}`);
        const result = await response.json();

        if (response.ok) {
          setRequests(result.requests);
          setFilteredRequests(result.requests); // Initialize filteredRequests
        } else {
          setNotification({ 
            message: `Error: ${result.message}`, 
            type: "error" 
          });
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        setNotification({ 
          message: "An error occurred while fetching requests.", 
          type: "error" 
        });
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
        setNotification({ 
          message: "Request approved successfully.", 
          type: "success" 
        });
        setRequests(requests.filter((req) => req.voter_id !== voterId)); // Remove the approved request from the list
        setFilteredRequests(filteredRequests.filter((req) => req.voter_id !== voterId)); // Update filtered list
      } else {
        setNotification({ 
          message: `Error: ${result.message}`, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      setNotification({ 
        message: "An error occurred while approving the request.", 
        type: "error" 
      });
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
        setNotification({ 
          message: "Request rejected successfully.", 
          type: "success" 
        });
        setRequests(requests.filter((req) => req.voter_id !== voterId)); // Remove the rejected request from the list
        setFilteredRequests(filteredRequests.filter((req) => req.voter_id !== voterId)); // Update filtered list
      } else {
        setNotification({ 
          message: `Error: ${result.message}`, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      setNotification({ 
        message: "An error occurred while rejecting the request.", 
        type: "error" 
      });
    }
  };

  const handleApproveAll = async () => {
    try {
      await Promise.all(
        filteredRequests.map((request) =>
          fetch(
            `${apiUrl}/api/voters/${userId}/requests/${electionId}/approve/${request.voter_id}`,
            { method: "PUT" }
          )
        )
      );
  
      // Update the state after batch operation
      setRequests(requests.filter((req) => !filteredRequests.includes(req)));
      setFilteredRequests([]);
      setNotification({ 
        message: "All requests are successfully accepted.", 
        type: "success" 
      });
    } catch (error) {
      console.error("Error approving all requests:", error);
      setNotification({ 
        message: "An error occurred while approving all requests.", 
        type: "error" 
      });
    }
  };
  
  const handleRejectAll = async () => {
    try {
      await Promise.all(
        filteredRequests.map((request) =>
          fetch(
            `${apiUrl}/api/voters/${userId}/requests/${electionId}/reject/${request.voter_id}`,
            { method: "PUT" }
          )
        )
      );
  
      // Update the state after batch operation
      setRequests(requests.filter((req) => !filteredRequests.includes(req)));
      setFilteredRequests([]);
      setNotification({ 
        message: "All requests are successfully rejected.", 
        type: "success" 
      });
    } catch (error) {
      console.error("Error rejecting all requests:", error);
      setNotification({ 
        message: "An error occurred while rejecting all requests.", 
        type: "error" 
      });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = requests.filter(
      (req) =>
        req.first_name.toLowerCase().includes(query) ||
        req.last_name.toLowerCase().includes(query) ||
        req.email.toLowerCase().includes(query)
    );

    setFilteredRequests(filtered);
  };

  const handleBack = () => {
    navigate(`/election/${userId}/detail/${electionId}`); // Navigate back to Election-Detail page
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen py-8 px-6 flex flex-col items-center">
      {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h1 className="text-3xl font-poppins font-bold text-[#003366] text-center mb-8">
          Participation Requests
        </h1>

        {/* Search Bar with Accept All and Reject All Buttons */}
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={handleSearch}
            className="w-[62%] px-4 py-2 border rounded-lg text-gray-700 font-roboto focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
          <div className="ml-4 flex space-x-4">
            <button
              className="px-6 py-2 bg-[#00897B] text-white font-roboto rounded-lg hover:bg-[#00695C] focus:outline-none"
              onClick={handleApproveAll}
            >
              Accept All
            </button>
            <button
              className="px-6 py-2 bg-[#D32F2F] text-white font-roboto rounded-lg hover:bg-[#B71C1C] focus:outline-none"
              onClick={handleRejectAll}
            >
              Reject All
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-600 font-roboto text-center">Loading requests...</p>
        ) : filteredRequests.length > 0 ? (
          <ul className="space-y-4">
            {filteredRequests.map((request) => (
              <li
                key={request.voter_id}
                className="bg-[#FFFFFF] p-6 rounded-lg shadow-md flex justify-between items-center"
              >
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
            No matching requests found.
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