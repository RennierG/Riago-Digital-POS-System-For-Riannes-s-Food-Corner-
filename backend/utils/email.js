import nodemailer from 'nodemailer';

function createTransporter() {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Email is not configured. Add ${missing.join(', ')} to backend/.env.`);
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, '');

export async function sendRegistrationOtp(email, name, otp) {
  try {
    const transporter = createTransporter();
    const minutes = process.env.OTP_EXPIRES_MINUTES || 5;
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Verify your Rianne's Food Corner account",
      text: `Hi ${name}, your RiaGo verification code is ${otp}. It expires in ${minutes} minutes.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#3b0f26"><h2 style="color:#c2185b">RiaGo Email Verification</h2><p>Hi ${escapeHtml(name)},</p><p>Use this code to verify your account:</p><div style="font-size:30px;font-weight:bold;letter-spacing:8px;background:#fff0f6;padding:18px;text-align:center;border-radius:12px;color:#c2185b">${otp}</div><p>This code expires in ${minutes} minutes.</p></div>`
    });
  } catch (e) {
    // SMTP blocked — show OTP in terminal for demo/dev purposes
    console.log('==========================================================');
    console.log(`  EMAIL COULD NOT BE SENT (${e.code || e.message})`);
    console.log(`  OTP for ${email}: ${otp}`);
    console.log('  Enter this code in the browser to complete registration.');
    console.log('==========================================================');
  }
}
