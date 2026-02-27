import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!emailUser || !emailPassword) {
  throw new Error('Missing email configuration environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword, // Use App Password for Gmail
  },
});

export default transporter;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via Nodemailer
 */
export const sendEmail = async (options: EmailOptions) => {
  try {
    const mailOptions = {
      from: options.from || emailUser,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send trip invitation email
 */
export const sendTripInvitation = async (
  recipientEmail: string,
  tripTitle: string,
  inviterName: string,
  inviteLink: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You're invited to a trip!</h2>
      <p>Hi there,</p>
      <p><strong>${inviterName}</strong> has invited you to join a trip: <strong>${tripTitle}</strong></p>
      <p>
        <a href="${inviteLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Trip
        </a>
      </p>
      <p>If you don't have an account yet, you'll be able to create one after clicking the link.</p>
      <p>Happy travels!</p>
      <hr>
      <p style="font-size: 12px; color: #999;">
        This is an automated message from TripTally. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `${inviterName} invited you to join "${tripTitle}"`,
    html,
  });
};

/**
 * Send expense split notification
 */
export const sendExpenseNotification = async (
  recipientEmail: string,
  username: string,
  tripTitle: string,
  expenseTitle: string,
  amount: number
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Expense Added</h2>
      <p>Hi ${username},</p>
      <p>A new expense has been added to the trip <strong>${tripTitle}</strong>:</p>
      <p>
        <strong>${expenseTitle}</strong><br>
        Amount: $${amount.toFixed(2)}
      </p>
      <p>Please login to TripTally to see the expense split details.</p>
      <hr>
      <p style="font-size: 12px; color: #999;">
        This is an automated message from TripTally. Please do not reply to this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `New expense in "${tripTitle}"`,
    html,
  });
};
