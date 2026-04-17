const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text, html = null, attachments = []) {
  try {
    const info = await transporter.sendMail({
      from: `"SDO - Trip Ticket" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email");
  }
}

module.exports = sendEmail;
