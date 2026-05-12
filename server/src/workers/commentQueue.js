const Bull = require('bull');
const axios = require('axios');
const Comment = require('../models/Comment');
const Bill = require('../models/Bill');

// create the queue
const commentQueue = new Bull('comment-processing', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
});

// this function is called from comment routes to add jobs
const addToQueue = async (data) => {
  await commentQueue.add(data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
  console.log(`Job added to queue: ${data.commentIds.length} comments for bill ${data.billId}`);
};

// this is the worker — processes each job
commentQueue.process(async (job) => {
  const { commentIds, billId } = job.data;
  console.log(`Processing ${commentIds.length} comments for bill ${billId}`);

  try {
    // fetch comments from DB
    const comments = await Comment.find({ _id: { $in: commentIds } });

    // mark as processing
    await Comment.updateMany(
      { _id: { $in: commentIds } },
      { status: 'processing' }
    );

    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

    const commentPayload = comments.map((c) => ({
      id: c._id.toString(),
      text: c.text,
    }));

    // call all AI endpoints in parallel
    const [sentimentRes, keywordsRes, summaryRes] = await Promise.allSettled([
      axios.post(`${AI_URL}/sentiment`, { comments: commentPayload }),
      axios.post(`${AI_URL}/keywords`, { comments: commentPayload }),
      axios.post(`${AI_URL}/summarize`, { comments: commentPayload, billId }),
    ]);

    // save sentiment results
    if (sentimentRes.status === 'fulfilled') {
      const sentimentData = sentimentRes.value.data.results;
      for (const item of sentimentData) {
        await Comment.findByIdAndUpdate(item.id, {
          sentimentLabel: item.label,
          sentimentScore: item.score,
          status: 'completed',
        });
      }

      // update bill sentiment stats
      const allComments = await Comment.find({ billId, status: 'completed' });
      const stats = { positive: 0, neutral: 0, negative: 0 };
      allComments.forEach((c) => {
        if (c.sentimentLabel) stats[c.sentimentLabel]++;
      });
      await Bill.findByIdAndUpdate(billId, { sentimentStats: stats });
    }

    // save keyword results
    if (keywordsRes.status === 'fulfilled') {
      const keywordData = keywordsRes.value.data.results;
      for (const item of keywordData) {
        await Comment.findByIdAndUpdate(item.id, {
          keywords: item.keywords,
        });
      }
    }

    // save summary to bill
    if (summaryRes.status === 'fulfilled') {
      const { summary } = summaryRes.value.data;
      await Bill.findByIdAndUpdate(billId, { summary });
    }

    console.log(`Done processing bill ${billId}`);
  } catch (err) {
    // mark as failed
    await Comment.updateMany(
      { _id: { $in: commentIds } },
      { status: 'failed' }
    );
    throw err;
  }
});

commentQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

commentQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message);
});

module.exports = { commentQueue, addToQueue };