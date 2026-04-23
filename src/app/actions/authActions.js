'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-eduspace';

export async function login(formData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) return { success: false, error: "Email dan Password wajib diisi." };

  try {
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return { success: false, error: "Email atau Password salah." };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, error: "Email atau Password salah." };
    }

    // Create JWT Token
    const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: '7d' });

    // Set Session Cookie
    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function register(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!name || !email || !password) return { success: false, error: "Semua field wajib diisi." };

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) return { success: false, error: "Email sudah terdaftar." };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const uid = 'user_' + Math.random().toString(36).substr(2, 9);
    const newUser = new User({ uid, name, email, password: hashedPassword });
    await newUser.save();

    // Create JWT Token
    const token = jwt.sign({ uid: uid }, JWT_SECRET, { expiresIn: '7d' });

    // Auto login after register
    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return { success: true, userId: uid };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Gagal membuat akun." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('eduspace_session');
  return { success: true };
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('eduspace_session');
    if (!session) return null;

    // Verify JWT
    const decoded = jwt.verify(session.value, JWT_SECRET);
    if (!decoded || !decoded.uid) return null;

    await dbConnect();
    const user = await User.findOne({ uid: decoded.uid }).lean();
    if (!user) return null;

    return {
      uid: user.uid,
      name: user.name,
      email: user.email,
      image: user.image
    };
  } catch (error) {
    return null;
  }
}
