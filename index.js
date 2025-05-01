require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
app.use('/data', express.static(path.join(__dirname, 'data')));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Connect to MongoDB using environment variable
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ------------------ SCHEMAS ------------------

// Career Form Schema
const CareerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    experience: String,
    linkedin: String,
    careerAspiration: String,
    interviewAssistance: String,
    resumePath: String,
  },
  { timestamps: true }
);
const Career = mongoose.model("Career", CareerSchema);

// Contact Form Schema
const ContactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);
const Contact = mongoose.model("Contact", ContactSchema);

// ------------------ ROUTES ------------------

const eventRoutes = require("./routes/eventroutes");
app.use("/api/events", eventRoutes);

// Resume upload config using Multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Handle Career Form
app.post("/submit-career-form", upload.single("resume"), async (req, res) => {
  try {
    const {
      name,
      email,
      experience,
      linkedin,
      careerAspiration,
      interviewAssistance,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required." });
    }

    const resumePath = req.file.path;

    const newCareer = await Career.create({
      name,
      email,
      experience,
      linkedin,
      careerAspiration,
      interviewAssistance,
      resumePath,
    });

    res.status(200).json({ message: "Form submitted successfully!" });

    setImmediate(() => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: "New Career Development Form Submission",
        text: `Name: ${name}\nEmail: ${email}\nExperience: ${experience}\nLinkedIn: ${linkedin}\nCareer Aspiration: ${careerAspiration}\nInterview Assistance: ${interviewAssistance}`,
        attachments: resumePath
          ? [{ filename: path.basename(resumePath), path: resumePath }]
          : [],
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("❌ Error Sending Email:", error);
        } else {
          console.log("✅ Email Sent:", info.response);
        }
      });
    });
  } catch (error) {
    console.error("❌ Error Submitting Career Form:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Handle Contact Form
app.post("/api/contact", async (req, res) => {
  const { fullName, email, phoneNumber, message } = req.body;

  if (!fullName || !email || !phoneNumber || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    res.status(200).json({ message: "Form submitted successfully!" });

    const newContact = new Contact({ fullName, email, phoneNumber, message });
    await newContact.save().catch((err) => console.error("Error saving contact:", err));

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: `New Contact Form Submission from ${fullName}`,
      text: `Name: ${fullName}\nEmail: ${email}\nPhone: ${phoneNumber}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("❌ Error Sending Email:", error);
      else console.log("✅ Email Sent:", info.response);
    });
  } catch (error) {
    console.error("❌ Error Submitting Contact Form:", error);
  }
});

// Optional: Test DB connection
app.get("/check-db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ status: "Connected", collections });
  } catch (err) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

const registerRoute = require('./routes/registerRoute');
app.use('/api/register', registerRoute);

// 🔔 Reminder scheduler - placed right before server starts


// ------------------ START SERVER ------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
