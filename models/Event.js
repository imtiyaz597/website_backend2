// backend/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, required: true },
  speaker: { type: String, required: true },
  link: { type: String, required: true },
  image: { type: String } // Optional: base64 or image URL
});

module.exports = mongoose.model('Event', eventSchema);
