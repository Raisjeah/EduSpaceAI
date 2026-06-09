import { seedPlans } from './src/app/actions/planActions.js';

// mock getSessionUser to pass authorization in seedPlans
jest.mock('./src/lib/core/session', () => ({
  getSessionUser: async () => ({ role: 'admin' })
}));

async function run() {
  console.log("Seeding plans...");
  const res = await seedPlans();
  console.log(res);
  process.exit(0);
}

run();
