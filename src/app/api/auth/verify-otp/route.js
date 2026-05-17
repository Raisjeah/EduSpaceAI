import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getResend } from '@/lib/resend';
import { getWelcomeTemplate } from '@/lib/emailTemplates';

export async function POST(req) {
  const resend = getResend();
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email dan OTP diperlukan' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Validate OTP and expiration
    if (user.otpCode !== otp) {
      return NextResponse.json({ success: false, error: 'Kode OTP tidak valid' }, { status: 400 });
    }

    if (new Date() > user.otpExpires) {
      return NextResponse.json({ success: false, error: 'Kode OTP telah kadaluwarsa' }, { status: 400 });
    }

    // Update user verification status and clear OTP fields
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    // Trigger Welcome Email asynchronously
    // In Next.js Route Handlers, we can just not await the promise or use a background task if supported
    // For simplicity and matching requirements "run this asynchronously/in the background to prevent UI block"
    resend.emails.send({
      from: 'EduSpaceAI <onboarding@resend.dev>',
      to: [email],
      subject: 'Selamat Datang di EduSpaceAI!',
      html: getWelcomeTemplate(user.name),
    }).catch(err => console.error('Error sending welcome email:', err));

    return NextResponse.json({ success: true, message: 'Verifikasi berhasil' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
