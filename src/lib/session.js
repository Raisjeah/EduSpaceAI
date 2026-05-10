'use server';

import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('eduspace_session')?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');

    return user;
  } catch (error) {
    return null;
  }
}
