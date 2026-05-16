require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Comment = require('../models/Comment');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/civicsense';

const demoComments = [
  "This renewable energy bill is absolutely fantastic for our future generations",
  "I strongly support clean energy policies for a better environment",
  "This bill will hurt the economy and cost thousands of jobs in traditional sectors",
  "The coal industry will be severely damaged by these new regulations",
  "We need more investment in solar and wind energy immediately",
  "I am not sure about the long term economic impact of this legislation",
  "Green energy is the future and we must embrace it now without hesitation",
  "This policy is too expensive and will increase electricity bills for families",
  "Renewable energy will create thousands of new jobs and boost the economy",
  "I oppose this bill as it will damage our industrial sector significantly",
  "Climate change is real and we need bold action like this bill proposes",
  "The transition to clean energy must be gradual to avoid economic disruption",
  "This bill does not go far enough in addressing our carbon emissions",
  "Small businesses will suffer greatly under these new energy regulations",
  "Finally a government that takes climate change seriously with real action",
  "The subsidies in this bill are unfair to taxpayers and should be removed",
  "Clean energy technology has advanced enough to make this bill viable",
  "I worry about energy security if we move away from fossil fuels too quickly",
  "This legislation will position our country as a global leader in clean energy",
  "The implementation timeline in this bill is too aggressive and unrealistic",
  "Solar panels and wind turbines cannot replace the reliability of coal power",
  "Investing in renewable energy now will save us money in the long run",
  "This bill has strong support from environmental scientists and experts",
  "Local communities near coal mines will be devastated by this policy",
  "Electric vehicles combined with clean energy will transform transportation",
  "The government should focus on nuclear energy instead of solar and wind",
  "This bill represents hope for a cleaner healthier future for our children",
  "Energy prices will skyrocket under these new regulations hurting poor families",
  "Carbon emissions must be reduced and this bill is a step in the right direction",
  "Private sector innovation should drive energy transition not government mandates",
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // find or create demo user
    let demoUser = await User.findOne({ email: 'demo@civicsense.ai' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo Admin',
        email: 'demo@civicsense.ai',
        password: 'demo123456',
        role: 'admin',
      });
      console.log('Demo user created');
    }

    // find or create demo bill
    let demoBill = await Bill.findOne({ billNumber: 'DEMO-2025-001' });
    if (!demoBill) {
      demoBill = await Bill.create({
        title: 'Clean Energy Transition Act 2025',
        description: 'A comprehensive bill to accelerate the transition to renewable energy sources, reduce carbon emissions, and create sustainable jobs in the green energy sector.',
        billNumber: 'DEMO-2025-001',
        category: 'Environment',
        status: 'open',
        createdBy: demoUser._id,
        totalComments: 0,
      });
      console.log('Demo bill created');
    }

    // delete old demo comments
    await Comment.deleteMany({ billId: demoBill._id });

    // insert demo comments
    let inserted = 0;
    for (const text of demoComments) {
      try {
        await Comment.create({
          text,
          billId: demoBill._id,
          source: 'api',
          submittedBy: 'Demo Seeder',
          status: 'pending',
        });
        inserted++;
      } catch (e) {
        // skip duplicates
      }
    }

    await Bill.findByIdAndUpdate(demoBill._id, { totalComments: inserted });
    console.log(`Inserted ${inserted} demo comments`);
    console.log('Demo Bill ID:', demoBill._id.toString());
    console.log('Seed complete!');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();