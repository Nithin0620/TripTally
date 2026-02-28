// ============================================
// Nodemailer Configuration
// ============================================

import nodemailer from 'nodemailer';

if (!process.env.SMTP_HOST) {
  throw new Error('Missing SMTP_HOST');
}

if (!process.env.SMTP_USER) {
  throw new Error('Missing SMTP_USER');
}

if (!process.env.SMTP_PASS) {
  throw new Error('Missing SMTP_PASS');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send trip invitation email
 */
export async function sendTripInviteEmail(
  recipientEmail: string,
  tripTitle: string,
  inviterName: string,
  tripUrl: string,
  role: string
) {
  const htmlContent = `
    <h2>You've been invited to a trip!</h2>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${tripTitle}</strong> as a <strong>${role}</strong>.</p>
    <p>Click the link below to join:</p>
    <a href="${tripUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
      Join Trip
    </a>
    <p style="margin-top: 20px; color: #666; font-size: 12px;">
      If you did not expect this invitation, you can ignore this email.
    </p>
  `;

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: recipientEmail,
    subject: `${inviterName} invited you to ${tripTitle}`,
    html: htmlContent,
  });
}

/**
 * Send email
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from?: string
) {
  return transporter.sendMail({
    from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

export default transporter;
