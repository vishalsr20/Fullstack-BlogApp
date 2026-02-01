// const nodemailer = require("nodemailer");

// const sendEmail = async ({ email, username, otp }) => {
//   try {
    
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false, 
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS, 
//       },
//     });

    
//     await transporter.verify();

    
//     const mailOptions = {
//       from: `"Tech Thinkers" <${process.env.MAIL_USER}>`,
//       to: email,
//       subject: "Verify your email address",
//       html: `
//         <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
//           <h2 style="color: #0f766e;">Welcome to Tech Thinkers, ${username} 👋</h2>
//           <p>Thank you for signing up! Please use the OTP below to verify your email address:</p>

//           <div style="
//             margin: 20px 0;
//             padding: 15px;
//             background-color: #f3f4f6;
//             border-radius: 8px;
//             text-align: center;
//             font-size: 24px;
//             letter-spacing: 4px;
//             font-weight: bold;
//           ">
//             ${otp}
//           </div>

//           <p>This OTP is valid for <strong>10 minutes</strong>.</p>

//           <p>If you did not create an account, you can safely ignore this email.</p>

//           <hr style="margin: 24px 0;" />

//           <p style="font-size: 12px; color: #6b7280;">
//             © ${new Date().getFullYear()} Tech Thinkers. All rights reserved.
//           </p>
//         </div>
//       `,
//     };

    
//     const info = await transporter.sendMail(mailOptions);
//     return info;

//   } catch (error) {
//     console.error("Failed to send verification email:", error);
//     throw error;
//   }
// };

// module.exports = sendEmail;


const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ email, username, otp }) => {
  try {
    await resend.emails.send({
      // This works immediately without domain verification
      from: "Tech Thinkers <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email address",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Welcome to Tech Thinkers, ${username} 👋</h2>
          <p>Your OTP is:</p>

          <div style="
            margin: 20px 0;
            padding: 15px;
            background-color: #f3f4f6;
            border-radius: 8px;
            text-align: center;
            font-size: 24px;
            letter-spacing: 4px;
            font-weight: bold;
          ">
            ${otp}
          </div>

          <p>This OTP is valid for <strong>10 minutes</strong>.</p>

          <p style="font-size: 12px; color: #6b7280;">
            © ${new Date().getFullYear()} Tech Thinkers
          </p>
        </div>
      `,
    });

    console.log("OTP email sent via Resend");
  } catch (error) {
    console.error("Resend email failed:", error);
    throw error;
  }
};

module.exports = sendEmail;

