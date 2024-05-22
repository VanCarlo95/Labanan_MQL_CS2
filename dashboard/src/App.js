import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const App = () => {
  const [sensorData, setSensorData] = useState([]);
  const [anomalyData, setAnomalyData] = useState([]);
  const [editedData, setEditedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.1.6:3000/api/sensor-data');
        setSensorData(response.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);

  const handleAnomalyDataSubmit = (data) => {
    setAnomalyData([...anomalyData, data]);
  };

  const handleEdit = (index) => {
    setEditedData(anomalyData[index]);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const updatedAnomalyData = [...anomalyData];
    updatedAnomalyData[editedData.index] = editedData;
    setAnomalyData(updatedAnomalyData);
    setIsEditing(false);
    setEditedData({});
  };

  const handleDelete = (index) => {
    const updatedAnomalyData = [...anomalyData];
    updatedAnomalyData.splice(index, 1);
    setAnomalyData(updatedAnomalyData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditedData({ ...editedData, [name]: value });
  };

  // Prepare data for bar chart - count number of motions per day
  const motionPerDay = sensorData.reduce((acc, dataPoint) => {
    const date = new Date(dataPoint.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + dataPoint.motionDetected;
    return acc;
  }, {});

  // Convert data into array format required by Recharts
  const barChartData = Object.keys(motionPerDay).map(date => ({
    date,
    motionDetected: motionPerDay[date]
  }));

  // Sort bar chart data by motionDetected in descending order
  barChartData.sort((a, b) => b.motionDetected - a.motionDetected);

  const containerStyle = {
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
  };

  const headerStyle = {
    backgroundColor: '#282c34',
    color: 'white',
    padding: '20px',
    fontSize: '2rem',
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        Sensor Data Dashboard
      </header>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
        <div>
          <h2>Motion Detection Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={sensorData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value}`}
                labelFormatter={(value) => `Time: ${new Date(value).toLocaleString()}`}
              />
              <Legend />
              <Line type="monotone" dataKey="motionDetected" stroke="#8884d8" dot={{ strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h2>Motion Detected Per Day</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="motionDetected" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>All Motion Detected Data</h2>
        <table style={{ width: '80%', margin: 'auto', borderCollapse: 'collapse', border: '1px solid black' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Motion Detected</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {anomalyData.map((data, index) => (
              <tr key={index}>
                <td>{new Date(data.timestamp).toLocaleString()}</td>
                <td>{isEditing && index === editedData.index ? (
                  <input
                    type="text"
                    name="motionDetected"
                    value={editedData.motionDetected}
                    onChange={handleInputChange}
                  />
                ) : (
                  data.motionDetected
                )}</td>
                <td>
                  {isEditing && index === editedData.index ? (
                    <button onClick ={handleSaveEdit}>Save</button>
                  ) : (
                    <button onClick={() => handleEdit(index)}>Edit</button>
                  )}
                  <button onClick={() => handleDelete(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isEditing && (
          <div>
            <h2>Add New Anomaly Motion Detected Data</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAnomalyDataSubmit(editedData);
              setEditedData({});
            }}>
              <label>Date: </label>
              <input type="text" name="timestamp" value={editedData.timestamp || ''} onChange={handleInputChange} />
              <label>Motion Detected: </label>
              <input type="text" name="motionDetected" value={editedData.motionDetected || ''} onChange={handleInputChange} />
              <button type="submit">Add</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
