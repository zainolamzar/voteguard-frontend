import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Notification from '@/components/ui/notification';

const apiUrl = import.meta.env.VITE_BE_URL;

const ElectionUpdate = () => {
  const { userId, electionId } = useParams();
  const [notification, setNotification] = useState(null);
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
      setNotification({ 
        message: "Election updated successfully!", 
        type: "success" 
      });

      setTimeout(() => {
        navigate(`/election/${userId}/detail/${electionId}`);
      }, 2000);
    } catch (err) {
      setError('Failed to update election');
    }
  };

  if (loading) return <div className="text-center text-xl font-semibold">Loading...</div>;
  if (error) return <div className="text-center text-xl text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      {notification && (
          <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <h2 className="text-3xl font-bold text-center text-[#003366] mb-6">Update Election</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-[#003366] font-semibold">Title</label>
          <input
            type="text"
            name="title"
            value={electionData.title}
            onChange={handleChange}
            required
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00897B]"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-[#003366] font-semibold">Description</label>
          <textarea
            name="description"
            value={electionData.description}
            onChange={handleChange}
            className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00897B]"
            rows="4"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="start_datetime" className="block text-[#003366] font-semibold">Start Date and Time</label>
            <input
              type="datetime-local"
              name="start_datetime"
              value={electionData.start_datetime}
              onChange={handleChange}
              required
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00897B]"
            />
          </div>
          <div>
            <label htmlFor="end_datetime" className="block text-[#003366] font-semibold">End Date and Time</label>
            <input
              type="datetime-local"
              name="end_datetime"
              value={electionData.end_datetime}
              onChange={handleChange}
              required
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00897B]"
            />
          </div>
        </div>
        <div className="flex justify-center space-x-4">
          <button
            type="submit"
            className="px-6 py-3 bg-[#00897B] text-white font-semibold rounded-md hover:bg-[#006f62] transition duration-300"
          >
            Update Election
          </button>
          <button
            type="button"
            onClick={() => navigate(`/election/${userId}/detail/${electionId}`)}
            className="px-6 py-3 bg-[#003366] text-white font-semibold rounded-md hover:bg-[#001f3b] transition duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ElectionUpdate;