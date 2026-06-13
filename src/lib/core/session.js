'use server';

import dbConnect from '@/lib/db/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import { cache } from 'react';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const getSessionUser = cache(async () => {
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

    return user;
  } catch (error) {
    return null;
  }
});
