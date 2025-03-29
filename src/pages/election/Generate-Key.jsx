import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@/components/ui/notification";

const apiUrl = import.meta.env.VITE_BE_URL;

const GenerateKey = () => {
  const { userId, electionId } = useParams(); // Get user ID and election ID from URL
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleGenerateKeys = async () => {
    setIsLoading(true); // Set loading state
    try {
      const response = await fetch(`${apiUrl}/api/keys/${electionId}/generate`, {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({ 
          message: "Keys generated successfully!", 
          type: "success" 
        });
        
        setTimeout(() => {
          navigate(`/dashboard/${userId}`);
        }, 2000);
      } else {
        setNotification({ 
          message: `Error: ${result.message}`, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error generating keys:", error);
      setNotification({ 
        message: "An error occurred while generating the keys. Please try again.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center px-4">
      {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-[#003366] font-poppins mb-6">
          Generate Keys for Election
        </h2>
        <p className="text-[#003366] font-roboto mb-8">
          Click the button below to generate the public and private keys for this election. 
          These keys are essential for ensuring secure and encrypted voting.
        </p>
        <button
          onClick={handleGenerateKeys}
          disabled={isLoading}
          className={`w-full py-3 rounded font-medium text-white transition ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#00897B] hover:bg-[#00695C]"
          }`}
        >
          {isLoading ? "Loading..." : "Generate Keys"}
        </button>
      </div>
    </div>
  );
};

export default GenerateKey;