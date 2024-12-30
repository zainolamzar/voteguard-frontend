import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../election/Generate-Key.css"; // Add styles for your component if needed

const apiUrl = import.meta.env.VITE_BE_URL;

const GenerateKey = () => {
  const { userId, electionId } = useParams(); // Get user ID from URL
  const navigate = useNavigate();

  const handleGenerateKeys = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/keys/${electionId}/generate`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        alert("Keys generated successfully!");
        navigate(`/dashboard/${userId}`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error generating keys:", error);
      alert("An error occurred while generating the keys. Please try again.");
    }
  };

  return (
    <div className="generate-key-container">
      <h2>Generate Keys for Election</h2>
      <button onClick={handleGenerateKeys}>Generate Keys</button>
    </div>
  );
};

export default GenerateKey;