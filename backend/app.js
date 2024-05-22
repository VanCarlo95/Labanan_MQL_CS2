const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Allow CORS for all routes
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/sensorDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Sensor Data Schema
const sensorSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  motionDetected: Boolean
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// POST API for adding sensor data
app.post('/api/sensor-data', async (req, res) => {
  const { motionDetected } = req.body;
  
  if (motionDetected === undefined) {
    return res.status(400).send({ error: 'motionDetected field is missing' });
  }

  const newSensorData = new SensorData({ motionDetected });
  try {
    await newSensorData.save();
    res.status(201).send(newSensorData);
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(400).send({ error: 'Failed to save data' });
  }
});

// GET API for fetching sensor data
app.get('/api/sensor-data', async (req, res) => {
  try {
    const sensorData = await SensorData.find().sort({ timestamp: -1 }).limit(100);
    res.status(200).send(sensorData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(400).send({ error: 'Failed to fetch data' });
  }
});

// Start server
app.listen(port, '192.168.1.6', () => {
  console.log(`Server running on http://192.168.1.6:${port}`);
});
