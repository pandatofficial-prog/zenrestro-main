const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use existing env vars or fallback to Ethereal for testing
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER || 'placeholder_user',
      pass: process.env.SMTP_PASS || 'placeholder_pass',
    },
  });

  const mailOptions = {
    from: `"ZenRestro Team" <${process.env.FROM_EMAIL || 'noreply@zenrestro.com'}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px; border-radius: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #22c55e; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -1px;">ZenRestro</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Smart POS for Modern Restaurants</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Welcome aboard, ${options.ownerName}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Great news! Your trial request for <b>${options.restaurantName}</b> has been approved. You can now log in and start managing your restaurant like a pro.</p>
          
          <div style="margin: 30px 0; background-color: #f1f5f9; padding: 25px; border-radius: 16px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; font-weight: 800; text-transform: uppercase;">Login Credentials</p>
            <p style="margin: 0; font-size: 16px; color: #1e293b;"><b>Email:</b> ${options.email}</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #1e293b;"><b>Temporary Password:</b> <span style="background-color: #fff; padding: 2px 8px; border-radius: 4px; border: 1px dashed #cbd5e1;">Restro@123</span></p>
          </div>
          
          <a href="http://localhost:5173/login" style="display: block; text-align: center; background-color: #22c55e; color: #ffffff; padding: 18px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.3);">Go to Dashboard →</a>
          
          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 30px;">Please change your password immediately after your first login for security.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 12px;">© 2026 ZenRestro. All software in one place.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
