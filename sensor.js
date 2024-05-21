const mongoose = require('mongoose')

const SensorSchema = new mongoose.Schema({
    motion: String,
    detected: String
})

const SensorModel = mongoose.model("sensors",SensorSchema)

module.exports = SensorModel