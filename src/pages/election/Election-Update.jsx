import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionUpdate = () => {
  const { userId, electionId } = useParams();
  const navigate = useNavigate();

  // State for election data and loading/error states
  const [electionData, setElectionData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to format the date as yyyy-MM-ddThh:mm
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Fetch election data on component mount
  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/elections/${userId}/${electionId}`);
        const election = response.data.election;

        // Format the start_datetime and end_datetime to match the required input format
        setElectionData({
          ...election,
          start_datetime: election.start_datetime
            ? formatDateForInput(election.start_datetime)
            : formatDateForInput(new Date()),
          end_datetime: election.end_datetime
            ? formatDateForInput(election.end_datetime)
            : formatDateForInput(new Date()),
        });
      } catch (err) {
        setError('Failed to fetch election data');
      } finally {
        setLoading(false);
      }
    };
    fetchElectionData();
  }, [userId, electionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setElectionData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/api/elections/${userId}/${electionId}`, electionData);
      alert("Election updated successfully!");
      navigate(`/election/${userId}/detail/${electionId}`);
    } catch (err) {
      setError('Failed to update election');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Update Election</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={electionData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={electionData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Start Date</label>
          <input
            type="datetime-local"
            name="start_datetime"
            value={electionData.start_datetime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>End Date</label>
          <input
            type="datetime-local"
            name="end_datetime"
            value={electionData.end_datetime}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Election</button>
      </form>
    </div>
  );
};

export default ElectionUpdate;