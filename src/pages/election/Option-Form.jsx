import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Notification from "@/components/ui/notification";

const apiUrl = import.meta.env.VITE_BE_URL;

const OptionForm = () => {
  const { userId, electionId } = useParams(); // Get user ID and election ID from URL
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [options, setOptions] = useState([{ id: "1", name: "", description: "" }]);

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index][field] = value;
    setOptions(updatedOptions);
  };

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { id: (prev.length + 1).toString(), name: "", description: "" },
    ]);
  };

  const handleRemoveOption = (index) => {
    setOptions((prev) => {
      const updatedOptions = prev.filter((_, i) => i !== index);
      return updatedOptions.map((option, i) => ({
        ...option,
        id: (i + 1).toString(),
      }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/api/elections/${userId}/${electionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options }),
      });

      const result = await response.json();
      if (response.ok) {
        setNotification({ 
          message: "Options added successfully!", 
          type: "success" 
        });
        navigate(`/generate-key/${userId}/${electionId}`);
      } else {
        setNotification({ 
          message: `Error: ${result.message}`, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error updating options:", error);
      setNotification({ 
        message: "An error occurred. Please try again.", 
        type: "error" 
      });
    }
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen flex items-center justify-center p-6">
      {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-[#003366] text-center mb-6 font-poppins">
          Add Options
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {options.map((option, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg bg-[#F5F5F5] mb-4"
            >
              <div className="mb-4">
                <label
                  htmlFor={`name-${index}`}
                  className="block text-sm font-medium text-[#003366] font-roboto"
                >
                  Option Name
                </label>
                <input
                  type="text"
                  id={`name-${index}`}
                  value={option.name}
                  onChange={(e) =>
                    handleOptionChange(index, "name", e.target.value)
                  }
                  placeholder="Enter option name"
                  required
                  className="mt-2 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00897B]"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor={`description-${index}`}
                  className="block text-sm font-medium text-[#003366] font-roboto"
                >
                  Option Description
                </label>
                <input
                  type="text"
                  id={`description-${index}`}
                  value={option.description}
                  onChange={(e) =>
                    handleOptionChange(index, "description", e.target.value)
                  }
                  placeholder="Enter a brief description (optional)"
                  className="mt-2 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00897B]"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="px-4 py-2 bg-[#D32F2F] text-white rounded font-medium hover:bg-[#A42424] transition"
              >
                Remove Option
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="w-full py-3 bg-[#FFC107] text-[#003366] font-medium rounded hover:bg-[#FFB300] transition"
          >
            Add Another Option
          </button>
          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-[#003366] text-white rounded font-medium hover:bg-[#001F3D] transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OptionForm;