// ============================================
// Transactional auth emails (SMTP / Nodemailer)
// The transporter is created lazily so imports never fail when SMTP is unset.
// ============================================

import type { NextRequest } from 'next/server';
import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[char] || char;
  });
}

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('Auth emails skipped: SMTP_HOST, SMTP_USER and SMTP_PASS are required');
    return null;
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || '587');
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
}

export function getAppOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return new URL(request.url).origin;
}

async function sendAuthEmail(subject: string, to: string, html: string): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) return false;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Auth email send failed:', error);
    return false;
  }
}

function emailShell(title: string, body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <h2 style="color: #1d4ed8;">${title}</h2>
      ${body}
      <p style="margin-top: 32px; color: #64748b; font-size: 12px;">
        If you did not request this email, you can safely ignore it.
      </p>
    </div>
  `;
}

function actionButton(url: string, label: string): string {
  return `
    <p>
      <a href="${url}" style="display: inline-block; padding: 12px 22px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold;">
        ${label}
      </a>
    </p>
    <p style="color: #64748b; font-size: 12px;">Or copy this link into your browser:<br />${url}</p>
  `;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
  origin: string
): Promise<boolean> {
  const url = `${origin}/verify-email?token=${encodeURIComponent(token)}`;
  const html = emailShell(
    'Verify your TripTally email',
    `<p>Hi ${escapeHtml(name || 'there')},</p>
     <p>Confirm your email address to finish setting up your TripTally account.</p>
     ${actionButton(url, 'Verify email')}
     <p style="color: #64748b; font-size: 12px;">This link expires in 24 hours and can only be used once.</p>`
  );

  return sendAuthEmail('Verify your TripTally email', to, html);
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
  origin: string
): Promise<boolean> {
  const url = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
  const html = emailShell(
    'Reset your TripTally password',
    `<p>Hi ${escapeHtml(name || 'there')},</p>
     <p>We received a request to reset your password. Choose a new password using the link below.</p>
     ${actionButton(url, 'Reset password')}
     <p style="color: #64748b; font-size: 12px;">This link expires in 1 hour and can only be used once.</p>`
  );

  return sendAuthEmail('Reset your TripTally password', to, html);
}
