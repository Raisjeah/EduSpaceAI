'use server';

import dbConnect from '@/lib/db/mongodb';
import Plan from '@/models/Plan';
import { getSessionUser } from '@/lib/core/session';
import { clearPlanCache } from '@/lib/core/subscription';
import { PLAN_DEFINITIONS, toPlanSeed } from '@/lib/plans';

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

  const plans = PLAN_DEFINITIONS.map(toPlanSeed);

  try {
    await dbConnect();
    const operations = plans.map(plan => ({
      updateOne: {
        filter: { name: plan.name },
        update: { $set: plan },
        upsert: true
      }
    }));
    await Plan.bulkWrite(operations);
    clearPlanCache();
    return { success: true, message: 'Plans seeded successfully' };
  } catch (error) {
    console.error('Seeding failed:', error);
    return { success: false, error: error.message };
  }
}
