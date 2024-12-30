import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../election/Election-Form.css";

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionForm = () => {
  const { userId } = useParams(); // Get user ID from URL
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
        alert("Election created successfully!");
        navigate(`/option-form/${userId}/${result.electionId}`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error creating election:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="election-form-container">
      <h2>Create Election</h2>
      <form onSubmit={handleSubmit} className="election-form">
        <div className="form-group">
          <label>Election Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Election Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>
        <div className="form-group">
            <label>Start Date and Time:</label>
            <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleChange}
                required
            />
        </div>
        <div className="form-group">
            <label>End Date and Time:</label>
            <input
                type="datetime-local"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleChange}
                required
            />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ElectionForm;