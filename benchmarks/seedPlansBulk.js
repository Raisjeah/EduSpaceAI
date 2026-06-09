const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  features: [String]
});
const Plan = mongoose.model('Plan', planSchema);

const PLAN_DEFINITIONS = [
  { name: 'Basic', price: 0, features: ['A', 'B'] },
  { name: 'Pro', price: 10, features: ['A', 'B', 'C'] },
  { name: 'Ultra', price: 20, features: ['A', 'B', 'C', 'D'] },
  { name: 'Enterprise', price: 50, features: ['A', 'B', 'C', 'D', 'E'] },
  { name: 'Custom', price: 100, features: ['A', 'B', 'C', 'D', 'E', 'F'] }
];

async function seedPlansOriginal(plans) {
  for (const plan of plans) {
    await Plan.findOneAndUpdate({ name: plan.name }, { $set: plan }, { upsert: true, new: true });
  }
}

async function seedPlansOptimizedPromiseAll(plans) {
  await Promise.all(plans.map(plan =>
    Plan.findOneAndUpdate({ name: plan.name }, { $set: plan }, { upsert: true, new: true })
  ));
}

async function seedPlansOptimizedBulkWrite(plans) {
  const operations = plans.map(plan => ({
    updateOne: {
      filter: { name: plan.name },
      update: { $set: plan },
      upsert: true
    }
  }));
  await Plan.bulkWrite(operations);
}


async function runBenchmark() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  const runs = 100;

  // Warm up
  await seedPlansOriginal(PLAN_DEFINITIONS);
  await seedPlansOptimizedPromiseAll(PLAN_DEFINITIONS);
  await seedPlansOptimizedBulkWrite(PLAN_DEFINITIONS);

  let originalTime = 0;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    await seedPlansOriginal(PLAN_DEFINITIONS);
    originalTime += performance.now() - start;
  }

  let promiseAllTime = 0;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    await seedPlansOptimizedPromiseAll(PLAN_DEFINITIONS);
    promiseAllTime += performance.now() - start;
  }

  let bulkWriteTime = 0;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    await seedPlansOptimizedBulkWrite(PLAN_DEFINITIONS);
    bulkWriteTime += performance.now() - start;
  }

  console.log(`Original time: ${originalTime / runs} ms per run`);
  console.log(`Promise.all time: ${promiseAllTime / runs} ms per run`);
  console.log(`BulkWrite time: ${bulkWriteTime / runs} ms per run`);
  console.log(`Promise.all Improvement: ${((originalTime - promiseAllTime) / originalTime * 100).toFixed(2)}%`);
  console.log(`BulkWrite Improvement: ${((originalTime - bulkWriteTime) / originalTime * 100).toFixed(2)}%`);

  await mongoose.disconnect();
  await mongod.stop();
}

runBenchmark().catch(console.error);
