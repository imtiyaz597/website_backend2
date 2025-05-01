// models/Registration.js
const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  remarks: String,
  eventTitle: String,
  eventDate: String,
}, { timestamps: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
