const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Registration = require('./models/Registration'); // Adjust path if needed
require('dotenv').config();

// ✅ No need to connect again — connection is handled in server.js

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = (user, type) => {
  const when = type === '2-day' ? 'in 2 days' : 'in 1 hour';
  const subject = `⏰ Reminder: ${user.eventTitle} is happening ${when}!`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: subject,
    text: `Hi ${user.name},\n\nJust a quick reminder that the event "${user.eventTitle}" is scheduled on ${user.eventDate}.\n\nSee you ${when}!\n\n— Team Edzest`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Reminder Email Error:", error);
    } else {
      console.log(`✅ Reminder (${when}) sent to ${user.email}`);
    }
  });
};

const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const registrations = await Registration.find();

    registrations.forEach(reg => {
      const eventDate = new Date(reg.eventDate);
      const diffMs = eventDate - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours >= 47.5 && diffHours <= 48.5) {
        sendReminderEmail(reg, '2-day');
      } else if (diffHours >= 0.5 && diffHours <= 1.5) {
        sendReminderEmail(reg, '1-hour');
      }
    });
  } catch (error) {
    console.error("❌ Error checking reminders:", error);
  }
};

cron.schedule('*/30 * * * *', () => {
  console.log('🔁 Checking for reminder emails...');
  checkAndSendReminders();
});
