import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { Resend } from 'resend';
import { otpEmailTemplate } from '@/lib/emailTemplates';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate 6-digit OTP using cryptographically secure random numbers
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // Initialize Resend inside the handler
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey && process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'OTP generated (Email simulation in Dev - No API Key)',
        otp: otpCode
      });
    }

    if (!resendApiKey) {
      return NextResponse.json({ error: 'Email service configuration missing' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: 'Eduspace AI <noreply@eduspace.ai>',
      to: [email],
      subject: 'Verifikasi Akun Eduspace AI',
      html: otpEmailTemplate(otpCode),
    });

    if (error) {
      console.error('Resend error:', error);
      // Even if email fails, we don't want to break the flow in dev if key is missing
      if (process.env.NODE_ENV !== 'production') {
          return NextResponse.json({
              success: true,
              message: 'OTP generated (Email simulation in Dev)',
              otp: otpCode // Expose OTP only in dev for testing
          });
      }
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
