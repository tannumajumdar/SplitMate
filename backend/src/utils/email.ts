import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (env.email.user && env.email.pass) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.secure,
      auth: { user: env.email.user, pass: env.email.pass },
    });
  } else {
    // Dev fallback — log email to console instead of sending
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(opts: MailOptions): Promise<void> {
  const t = getTransporter();

  if (!env.email.user) {
    // Dev mode: just log the email content
    logger.info(`[EMAIL - DEV] To: ${opts.to} | Subject: ${opts.subject}`);
    logger.info(`[EMAIL - DEV] ${opts.text ?? opts.html.replace(/<[^>]+>/g, ' ')}`);
    return;
  }

  await t.sendMail({ from: env.email.from, ...opts });
}

export function resetPasswordEmail(name: string, resetUrl: string): MailOptions {
  return {
    subject: 'Reset your SplitMate password',
    to: '',
    text: `Hi ${name},\n\nClick the link below to reset your password (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\n— The SplitMate Team`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#8b5cf6);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
            <span style="color:#fff;font-size:24px;font-weight:700;">₹</span>
          </div>
          <h1 style="margin:0;font-size:22px;color:#0f172a;">Reset your password</h1>
        </div>
        <p style="color:#475569;margin:0 0 8px;">Hi <strong>${name}</strong>,</p>
        <p style="color:#475569;margin:0 0 24px;">We received a request to reset your SplitMate password. Click the button below to set a new one. This link expires in <strong>1 hour</strong>.</p>
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${resetUrl}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;display:inline-block;font-size:15px;">
            Reset Password
          </a>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin:0;">If the button doesn't work, copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color:#6366f1;word-break:break-all;">${resetUrl}</a></p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
        <p style="color:#cbd5e1;font-size:12px;margin:0;text-align:center;">If you didn't request this, you can safely ignore this email. — The SplitMate Team</p>
      </div>
    `,
  };
}
