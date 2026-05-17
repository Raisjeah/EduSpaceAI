import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { Resend } from 'resend';
import { welcomeEmailTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  try {
    const { email, otpCode } = await req.json();

    if (!email || !otpCode) {
      return NextResponse.json({ error: 'Email and OTP code are required' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if OTP matches and is not expired
    if (user.otpCode !== otpCode || new Date() > user.otpExpires) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send Welcome Email
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: 'Eduspace AI <noreply@eduspace.ai>',
          to: [email],
          subject: `Selamat Datang di Eduspace AI, ${user.name}!`,
          html: welcomeEmailTemplate(user.name),
        });
      }
    } catch (err) {
      console.error('Welcome email failed:', err);
    }

    return NextResponse.json({ success: true, message: 'Account verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
