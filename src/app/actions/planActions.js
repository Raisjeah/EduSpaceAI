'use server';

import dbConnect from '@/lib/db/mongodb';
import Plan from '@/models/Plan';
import { getSessionUser } from '@/lib/core/session';

export async function seedPlans() {
  const adminUser = await getSessionUser();
  // Only authenticated admin users can seed plans (otherwise an attacker
  // could overwrite pricing/features and bypass payment).
  if (!adminUser) {
    throw new Error('Unauthorized');
  }
  if (adminUser.role !== 'admin') {
    throw new Error('Forbidden: hanya admin yang dapat melakukan seeding paket.');
  }

  const plans = [
    {
      name: 'FREE',
      price: 0,
      duration: 36500,
      message_limit: 20,
      image_upload: false,
      file_upload: false,
      ai_agent_level: 0,
      memory_enabled: false,
      priority_access: false,
    },
    {
      name: 'CLASSIC',
      price: 50000,
      duration: 30,
      message_limit: 150,
      image_upload: true,
      file_upload: true,
      ai_agent_level: 1,
      memory_enabled: false,
      priority_access: false,
    },
    {
      name: 'PRO',
      price: 100000,
      duration: 30,
      message_limit: 500,
      image_upload: true,
      file_upload: true,
      ai_agent_level: 2,
      memory_enabled: true,
      priority_access: false,
    },
    {
      name: 'ULTRA',
      price: 200000,
      duration: 30,
      message_limit: 2000,
      image_upload: true,
      file_upload: true,
      ai_agent_level: 3,
      memory_enabled: true,
      priority_access: true,
    }
  ];

  try {
    await dbConnect();
    for (const plan of plans) {
      await Plan.findOneAndUpdate({ name: plan.name }, plan, { upsert: true, new: true });
    }
    return { success: true, message: 'Plans seeded successfully' };
  } catch (error) {
    console.error('Seeding failed:', error);
    return { success: false, error: error.message };
  }
}
