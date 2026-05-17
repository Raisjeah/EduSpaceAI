import { Resend } from 'resend';

let resendInstance = null;

export function getResend() {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is missing');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}
