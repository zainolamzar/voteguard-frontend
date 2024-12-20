import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../election/Option-Form.css";

const OptionForm = () => {
  const { userId, electionId } = useParams(); // Get user ID and election ID from URL
  const navigate = useNavigate();
  const [options, setOptions] = useState([{ name: "", description: "" }]);

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index][field] = value;
    setOptions(updatedOptions);
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { name: "", description: "" }]);
  };

  const handleRemoveOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/api/elections/${userId}/${electionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Options added successfully!");
        navigate(`/dashboard/${userId}`);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating options:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="option-form-container">
      <h2>Add Options</h2>
      <form onSubmit={handleSubmit} className="option-form">
        {options.map((option, index) => (
          <div key={index} className="option-group">
            <div className="form-group">
              <label>Option Name:</label>
              <input
                type="text"
                value={option.name}
                onChange={(e) =>
                  handleOptionChange(index, "name", e.target.value)
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Option Description:</label>
              <input
                type="text"
                value={option.description}
                onChange={(e) =>
                  handleOptionChange(index, "description", e.target.value)
                }
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveOption(index)}
              className="remove-option-button"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddOption} className="add-option-button">
          Add Option
        </button>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default OptionForm;