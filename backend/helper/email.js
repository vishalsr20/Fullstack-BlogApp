const nodemailer = require("nodemailer");
require("dotenv").config();  // To load environment variables

const sendEmail = async ({email, username, otp}) => {
  try {
    // Check if email is valid
    console.log("This is udername",username)

    console.log("Sending email to:", email);

    // Create the transporter object with SMTP configuration
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",      // For Gmail SMTP
                      // Use TLS (not SSL)
      auth: {
        user: process.env.MAIL_USER,    // Your email address
        pass: process.env.MAIL_PASS,    // Your app-specific password
      },
    });

    // Define the email options
    let info = await transporter.sendMail({
      from: "Tech Thinkers !!",      // Sender email address
      to: email,                        // Recipient email address
      subject: `Welcome, ${username}!`,   // Email subject
      html: `<p>Your OTP is: <b>${otp}</b></p>`, // Email content (HTML)
    });

    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error in sending email:", error.message);
    throw error; // Rethrow the error to be handled by the caller
  }
};

module.exports = sendEmail;
