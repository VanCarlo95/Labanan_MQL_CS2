const express = require('express');
const SensorModel = require('./sensor');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/motion-detected', (req, res) => {
  console.log('Motion detected!');
  // Handle the motion detection here
  res.send('Motion detected!');
});

app.post('/addsensordata', (req, res) => {
  const { motion, detected }= req.query;
  const sensorData = {motion, detected };

  SensorModel.create(sensorData)
    .then(sensor => res.json(sensor))
    .catch(err => res.json(err));

})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
