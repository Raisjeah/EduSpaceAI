import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { Resend } from 'resend';
import { getOtpTemplate } from '@/lib/emailTemplates';
import crypto from 'crypto';

export async function POST(req) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email diperlukan' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Generate 6-digit random numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    user.otpCode = otp;
    user.otpExpires = expires;
    await user.save();

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'EduSpaceAI <onboarding@resend.dev>', // Should use verified domain in production
      to: [email],
      subject: 'Kode Verifikasi OTP EduSpaceAI',
      html: getOtpTemplate(otp),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ success: false, error: 'Gagal mengirim email verifikasi' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP telah dikirim' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem' }, { status: 500 });
  }
}
