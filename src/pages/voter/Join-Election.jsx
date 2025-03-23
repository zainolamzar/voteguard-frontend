import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BE_URL;

const JoinElection = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [electionCode, setElectionCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/voters/${userId}/request-participation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ election_code: electionCode }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Participation request sent successfully!");
        navigate(`/dashboard/${userId}`); // Redirect to dashboard after success
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error requesting participation:", error);
      alert("An error occurred while requesting participation.");
    }
  };

  const handleCancel = () => {
    // Navigate back to the dashboard
    navigate(`/dashboard/${userId}`);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex flex-col items-center py-10 px-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-poppins font-bold text-[#003366] text-center mb-6">
          Join an Election
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="election-code"
              className="block text-lg font-roboto text-[#003366] mb-2"
            >
              Enter Election Code
            </label>
            <input
              type="text"
              id="election-code"
              value={electionCode}
              onChange={(e) => setElectionCode(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-[#B0BEC5] focus:border-[#00897B] focus:ring-2 focus:ring-[#00897B] font-roboto text-lg"
            />
          </div>

          <div className="flex justify-between gap-4">
            <button
              type="submit"
              className="w-full py-3 bg-[#00897B] text-white font-roboto rounded-lg hover:bg-[#00695C] focus:outline-none transition duration-300"
            >
              Request Participation
            </button>

            <button
              type="button"
              className="w-full py-3 bg-[#D32F2F] text-white font-roboto rounded-lg hover:bg-[#B71C1C] focus:outline-none transition duration-300"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinElection;