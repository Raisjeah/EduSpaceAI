'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function register(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!name || !email || !password) {
    return { success: false, error: 'Semua field harus diisi' };
  }

  // Strict email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: 'Format email tidak valid' };
  }

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: 'Email sudah terdaftar' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Gagal melakukan registrasi' };
  }
}

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { success: false, error: 'Email dan password harus diisi' };
  }

  try {
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, error: 'Email atau password salah' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: 'Email atau password salah' };
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Gagal melakukan login' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('eduspace_session');
  return { success: true };
}

export async function loginWithGoogle(idToken) {
  if (!idToken) {
    return { success: false, error: 'Token Google tidak ditemukan' };
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    await dbConnect();

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      // Use a random password since they login with Google
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      user = new User({
        name,
        email,
        password: randomPassword,
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: 'Gagal login dengan Google' };
  }
}

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('eduspace_session')?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return null;

    return {
      uid: user._id.toString(),
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    return null;
  }
}

export async function updateProfile(formData) {
  const name = formData.get('name');
  const userId = formData.get('userId');

  if (!name || !userId) {
    return { success: false, error: 'Nama harus diisi' };
  }

  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(userId, { name }, { new: true });

    if (!user) {
      return { success: false, error: 'User tidak ditemukan' };
    }

    return {
      success: true,
      user: {
        uid: user._id.toString(),
        name: user.name,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Gagal memperbarui profil' };
  }
}
