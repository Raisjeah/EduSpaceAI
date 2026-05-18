'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/session';
import LoginAttempt from '@/models/LoginAttempt';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const isProd = process.env.NODE_ENV === 'production';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return 'Password tidak valid';
  }
  if (password.length < 8) {
    return 'Password minimal 8 karakter';
  }
  if (password.length > 128) {
    return 'Password terlalu panjang';
  }
  return null;
}

// Database-backed login rate limit.
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const LOGIN_MAX_ATTEMPTS = 5;

async function checkLoginRateLimit(email) {
  const key = email.toLowerCase();
  const now = new Date();

  await dbConnect();

  let attempt = await LoginAttempt.findOne({ email: key });

  if (!attempt || (now.getTime() - attempt.firstAttempt.getTime() > LOGIN_WINDOW_MS)) {
    // Reset window
    if (attempt) {
      attempt.count = 1;
      attempt.firstAttempt = now;
      attempt.lastAttempt = now;
      await attempt.save();
    } else {
      await LoginAttempt.create({
        email: key,
        count: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    }
    return { allowed: true };
  }

  attempt.count += 1;
  attempt.lastAttempt = now;
  await attempt.save();

  if (attempt.count > LOGIN_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterMs: LOGIN_WINDOW_MS - (now.getTime() - attempt.firstAttempt.getTime()),
    };
  }

  return { allowed: true };
}

async function clearLoginRateLimit(email) {
  await dbConnect();
  await LoginAttempt.deleteOne({ email: email.toLowerCase() });
}

export async function register(formData) {
  const name = (formData.get('name') || '').toString().trim();
  const email = normalizeEmail(formData.get('email'));
  const password = formData.get('password');

  if (!name || !email || !password) {
    return { success: false, error: 'Semua field harus diisi' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Format email tidak valid' };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { success: false, error: passwordError };
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

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'eduspace-ai',
      audience: 'eduspace-app'
    });

    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, COOKIE_OPTIONS);

    return { success: true };
  } catch (error) {
    if (error?.code === 11000) {
      return { success: false, error: 'Email sudah terdaftar' };
    }
    console.error('Registration error:', error);
    return { success: false, error: 'Gagal melakukan registrasi' };
  }
}

export async function login(formData) {
  const email = normalizeEmail(formData.get('email'));
  const password = formData.get('password');

  if (!email || !password) {
    return { success: false, error: 'Email dan password harus diisi' };
  }

  const rate = await checkLoginRateLimit(email);
  if (!rate.allowed) {
    const minutes = Math.ceil((rate.retryAfterMs || LOGIN_WINDOW_MS) / 60000);
    return {
      success: false,
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`,
    };
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

    await clearLoginRateLimit(email);

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'eduspace-ai',
      audience: 'eduspace-app'
    });

    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, COOKIE_OPTIONS);

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
    if (!payload || !payload.email) {
      return { success: false, error: 'Token Google tidak valid' };
    }
    if (payload.email_verified === false) {
      return { success: false, error: 'Email Google belum terverifikasi' };
    }

    const email = normalizeEmail(payload.email);
    const name = payload.name || 'Anon';
    const picture = payload.picture;

    await dbConnect();

    let user = await User.findOne({ email });

    if (!user) {
      // Use a random password since the user authenticates via Google.
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      user = new User({
        name,
        email,
        password: randomPassword,
        image: picture,
      });
      await user.save();
    } else if (picture && user.image !== picture) {
      user.image = picture;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '7d',
      issuer: 'eduspace-ai',
      audience: 'eduspace-app'
    });

    const cookieStore = await cookies();
    cookieStore.set('eduspace_session', token, COOKIE_OPTIONS);

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

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'eduspace-ai',
      audience: 'eduspace-app'
    });
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) return null;

    return {
      uid: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      current_plan: user.current_plan,
    };
  } catch (error) {
    return null;
  }
}

export async function updateProfile(formData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { success: false, error: 'Sesi berakhir. Silakan login kembali.' };
  }

  const name = (formData.get('name') || '').toString().trim();
  if (!name) {
    return { success: false, error: 'Nama harus diisi' };
  }
  if (name.length > 100) {
    return { success: false, error: 'Nama terlalu panjang' };
  }

  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      sessionUser._id,
      { name },
      { new: true, runValidators: true }
    );

    if (!user) {
      return { success: false, error: 'User tidak ditemukan' };
    }

    return {
      success: true,
      user: {
        uid: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      },
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Gagal memperbarui profil' };
  }
}
