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
      file_upload_per_window: 0,
      file_upload_window_hours: 4,
      ai_agent_level: 0,
      agent_enabled: false,
      agent_requests_per_window: 0,
      agent_window_hours: 4,
      memory_enabled: false,
      priority_access: false,
      live_call_enabled: true,
      live_call_minutes_per_window: 5,
      live_call_window_hours: 24, // 5 mnt/hari
    },
    {
      name: 'CLASSIC',
      price: 50000,
      duration: 30,
      message_limit: 150,
      image_upload: true,
      file_upload: true,
      file_upload_per_window: 3,
      file_upload_window_hours: 4, // 3 file / 4 jam
      ai_agent_level: 1,
      agent_enabled: true,
      agent_requests_per_window: 10,
      agent_window_hours: 4, // 10 req / 4 jam
      memory_enabled: false,
      priority_access: false,
      live_call_enabled: true,
      live_call_minutes_per_window: 5,
      live_call_window_hours: 3, // 5 mnt / 3 jam
    },
    {
      name: 'PRO',
      price: 100000,
      duration: 30,
      message_limit: 500,
      image_upload: true,
      file_upload: true,
      file_upload_per_window: 10,
      file_upload_window_hours: 4, // 10 file / 4 jam
      ai_agent_level: 2,
      agent_enabled: true,
      agent_requests_per_window: 50,
      agent_window_hours: 4, // 50 req / 4 jam
      memory_enabled: true,
      priority_access: false,
      live_call_enabled: true,
      live_call_minutes_per_window: 30,
      live_call_window_hours: 24, // 30 mnt/hari
    },
    {
      name: 'ULTRA',
      price: 200000,
      duration: 30,
      message_limit: 2000,
      image_upload: true,
      file_upload: true,
      file_upload_per_window: -1, // unlimited
      file_upload_window_hours: 24,
      ai_agent_level: 3,
      agent_enabled: true,
      agent_requests_per_window: -1, // unlimited
      agent_window_hours: 24,
      memory_enabled: true,
      priority_access: true,
      live_call_enabled: true,
      live_call_minutes_per_window: 120,
      live_call_window_hours: 24, // 120 mnt/hari
    }
  ];

  try {
    await dbConnect();
    for (const plan of plans) {
      await Plan.findOneAndUpdate({ name: plan.name }, { $set: plan }, { upsert: true, new: true });
    }
    return { success: true, message: 'Plans seeded successfully' };
  } catch (error) {
    console.error('Seeding failed:', error);
    return { success: false, error: error.message };
  }
}
