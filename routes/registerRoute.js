
// const express = require('express');
// const router = express.Router();
// const xlsx = require('xlsx');
// const fs = require('fs');
// const path = require('path');
// const mongoose = require('mongoose');

// const filePath = path.join(__dirname, '../data/event-registrations.xlsx');
// const userFilePath = path.join(__dirname, '../data/user-registrations.xlsx');

// // Event model (already used for download)
// const Event = require('../models/Event');

// // ✅ New: Registration model
// const RegistrationSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
//   remarks: String,
//   eventTitle: String,
//   eventDate: String,
// }, { timestamps: true });

// const Registration = mongoose.model('Registration', RegistrationSchema);

// // POST: Register for an event
// router.post('/', async (req, res) => {
//   try {
//     const {
//       name = '',
//       email = '',
//       phone = '',
//       remarks = '',
//       eventTitle = '',
//       eventDate = ''
//     } = req.body;

//     if (!name || !email || !phone || !eventTitle) {
//       return res.status(400).json({ message: 'Required fields missing.' });
//     }

//     // ✅ Save to MongoDB
//     await Registration.create({ name, email, phone, remarks, eventTitle, eventDate });
//     console.log("✅ Registration saved in MongoDB.");

//     // ✅ Also append to Excel (preserving existing logic)
//     let data = [];
//     if (fs.existsSync(filePath)) {
//       const workbook = xlsx.readFile(filePath);
//       const sheet = workbook.Sheets['Registrations'];
//       if (sheet) {
//         data = xlsx.utils.sheet_to_json(sheet);
//       }
//     }

//     const newEntry = {
//       'Event Title': eventTitle,
//       'Participant Name': name,
//       'Email': email,
//       'Phone': phone,
//       'Remarks': remarks,
//       'Event Date': eventDate,
//       'Registered At': new Date().toLocaleString()
//     };

//     data.push(newEntry);

//     const headers = ['Event Title', 'Participant Name', 'Email', 'Phone', 'Remarks', 'Event Date', 'Registered At'];
//     const worksheet = xlsx.utils.json_to_sheet(data, { header: headers });
//     const workbook = xlsx.utils.book_new();
//     xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');
//     xlsx.writeFile(workbook, filePath);

//     res.status(200).json({ message: 'Registered & saved in Excel + MongoDB.' });
//   } catch (err) {
//     console.error('❌ Registration Error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // GET: Download the event Excel
// router.get('/download', async (req, res) => {
//   try {
//     const events = await Event.find({}).lean();
//     if (!events || events.length === 0) {
//       return res.status(404).json({ message: 'No events found in database.' });
//     }

//     const excelData = events.map(event => ({
//       'Title': event.title,
//       'Description': event.description,
//       'Date': event.date,
//       'Time': event.time,
//       'Type': event.type,
//       'Speaker': event.speaker,
//       'Link': event.link,
//       'Created At': event.createdAt?.toLocaleString() || '',
//       'Updated At': event.updatedAt?.toLocaleString() || ''
//     }));

//     const worksheet = xlsx.utils.json_to_sheet(excelData);
//     const workbook = xlsx.utils.book_new();
//     xlsx.utils.book_append_sheet(workbook, worksheet, 'Events');
//     xlsx.writeFile(workbook, filePath);

//     res.download(filePath, 'event-registrations.xlsx');
//   } catch (err) {
//     console.error("❌ Error generating Excel from MongoDB:", err);
//     res.status(500).json({ message: 'Server error during Excel export.' });
//   }
// });

// // ✅ GET: Download user registration data as Excel
// router.get('/users/download', async (req, res) => {
//   try {
//     const registrations = await Registration.find({}).lean();
//     if (!registrations || registrations.length === 0) {
//       return res.status(404).json({ message: 'No registrations found.' });
//     }

//     const excelData = registrations.map(user => ({
//       'Name': user.name,
//       'Email': user.email,
//       'Phone': user.phone,
//       'Remarks': user.remarks,
//       'Event Title': user.eventTitle,
//       'Event Date': user.eventDate,
//       'Registered At': user.createdAt?.toLocaleString() || ''
//     }));

//     const worksheet = xlsx.utils.json_to_sheet(excelData);
//     const workbook = xlsx.utils.book_new();
//     xlsx.utils.book_append_sheet(workbook, worksheet, 'User Registrations');
//     xlsx.writeFile(workbook, userFilePath);

//     res.download(userFilePath, 'user-registrations.xlsx');
//   } catch (err) {
//     console.error("❌ Error exporting user registrations:", err);
//     res.status(500).json({ message: 'Server error during user registration export.' });
//   }
// });

// module.exports = router;

// backend/routes/registerRoute.js
// backend/routes/registerRoute.js
const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const filePath = path.join(__dirname, '../data/event-registrations.xlsx');
const userFilePath = path.join(__dirname, '../data/user-registrations.xlsx');

// Event model (already used for download)
const Event = require('../models/Event');

// ✅ New: Registration model
const RegistrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  remarks: String,
  eventTitle: String,
  eventDate: String,
}, { timestamps: true });

const Registration = mongoose.model('Registration', RegistrationSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST: Register for an event
router.post('/', async (req, res) => {
  try {
    const {
      name = '',
      email = '',
      phone = '',
      remarks = '',
      eventTitle = '',
      eventDate = ''
    } = req.body;

    if (!name || !email || !phone || !eventTitle) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }

    // ✅ Save to MongoDB
    await Registration.create({ name, email, phone, remarks, eventTitle, eventDate });
    console.log("✅ Registration saved in MongoDB.");

    // ✅ Also append to Excel (preserving existing logic)
    let data = [];
    if (fs.existsSync(filePath)) {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets['Registrations'];
      if (sheet) {
        data = xlsx.utils.sheet_to_json(sheet);
      }
    }

    const newEntry = {
      'Event Title': eventTitle,
      'Participant Name': name,
      'Email': email,
      'Phone': phone,
      'Remarks': remarks,
      'Event Date': eventDate,
      'Registered At': new Date().toLocaleString()
    };

    data.push(newEntry);

    const headers = ['Event Title', 'Participant Name', 'Email', 'Phone', 'Remarks', 'Event Date', 'Registered At'];
    const worksheet = xlsx.utils.json_to_sheet(data, { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Registrations');
    xlsx.writeFile(workbook, filePath);

    // ✅ Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      cc: email,
      subject: `✅ Registered for ${eventTitle}`,
      text: `Hi ${name},\n\nThank you for registering for "${eventTitle}" scheduled on ${eventDate}.\n\n📞 Phone: ${phone}\n📩 Email: ${email}\n📝 Remarks: ${remarks || 'None'}\n\n— Team Edzest`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Error Sending Email:", error);
      } else {
        console.log("✅ Email Sent:", info.response);
      }
    });

    res.status(200).json({ message: 'Registered & saved in Excel + MongoDB.' });
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET: Download the event Excel
router.get('/download', async (req, res) => {
  try {
    const events = await Event.find({}).lean();
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No events found in database.' });
    }

    const excelData = events.map(event => ({
      'Title': event.title,
      'Description': event.description,
      'Date': event.date,
      'Time': event.time,
      'Type': event.type,
      'Speaker': event.speaker,
      'Link': event.link,
      'Created At': event.createdAt?.toLocaleString() || '',
      'Updated At': event.updatedAt?.toLocaleString() || ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Events');
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, 'event-registrations.xlsx');
  } catch (err) {
    console.error("❌ Error generating Excel from MongoDB:", err);
    res.status(500).json({ message: 'Server error during Excel export.' });
  }
});

// ✅ GET: Download user registration data as Excel
router.get('/users/download', async (req, res) => {
  try {
    const registrations = await Registration.find({}).lean();
    if (!registrations || registrations.length === 0) {
      return res.status(404).json({ message: 'No registrations found.' });
    }

    const excelData = registrations.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Phone': user.phone,
      'Remarks': user.remarks,
      'Event Title': user.eventTitle,
      'Event Date': user.eventDate,
      'Registered At': user.createdAt?.toLocaleString() || ''
    }));

    const worksheet = xlsx.utils.json_to_sheet(excelData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'User Registrations');
    xlsx.writeFile(workbook, userFilePath);

    res.download(userFilePath, 'user-registrations.xlsx');
  } catch (err) {
    console.error("❌ Error exporting user registrations:", err);
    res.status(500).json({ message: 'Server error during user registration export.' });
  }
});

module.exports = router;
