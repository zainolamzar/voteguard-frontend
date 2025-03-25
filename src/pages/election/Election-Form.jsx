import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Notification from "@/components/ui/notification";

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionForm = () => {
  const { userId } = useParams(); // Get user ID from URL
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_datetime: "",
    end_datetime: "",
  });

  const generateUniqueElectionCode = async () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    let code = "";
    let isUnique = false;

    while (!isUnique) {
      code = "";
      for (let i = 0; i < 7; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // Check uniqueness with the backend
      const response = await fetch(`${apiUrl}/api/elections/check-code/${code}`);
      const result = await response.json();
      isUnique = !result.exists;
    }

    return code;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const election_code = await generateUniqueElectionCode();

    try {
      const response = await fetch(`${apiUrl}/api/elections/${userId}/election`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, election_code }),
      });

      const result = await response.json();
      if (response.ok) {
        setNotification({ 
          message: "Election created successfully!", 
          type: "success" 
        });
        navigate(`/option-form/${userId}/${result.electionId}`);
      } else {
        setNotification({ 
          message: `Error: ${result.message}`, 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error creating election:", error);
      setNotification({ 
        message: "An error occurred. Please try again.", 
        type: "error" 
      });
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/${userId}`); // Redirect to the dashboard
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5]">
      {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-[#003366] mb-6 font-poppins">
          Create a New Election
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-[#003366] font-roboto"
            >
              Election Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter election title"
              required
              className="mt-2 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00897B]"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#003366] font-roboto"
            >
              Election Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a brief description of the election"
              rows={4}
              className="mt-2 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00897B]"
            ></textarea>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="flex-1">
              <label
                htmlFor="start_datetime"
                className="block text-sm font-medium text-[#003366] font-roboto"
              >
                Start Date and Time
              </label>
              <input
                type="datetime-local"
                id="start_datetime"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleChange}
                required
                className="mt-2 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00897B]"
              />
            </div>
            <div className="flex-1 mt-4 md:mt-0">
              <label
                htmlFor="end_datetime"
                className="block text-sm font-medium text-[#003366] font-roboto"
              >
                End Date and Time
              </label>
              <input
                type="datetime-local"
                id="end_datetime"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleChange}
                required
                className="mt-2 p-3 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#00897B]"
              />
            </div>
          </div>
          <div className="flex justify-start space-x-4">
            <button
              type="submit"
              className="px-6 py-3 bg-[#003366] text-white rounded font-medium hover:bg-[#001F3D] transition"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-[#D32F2F] text-white rounded font-medium hover:bg-[#A42424] transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ElectionForm;