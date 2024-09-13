const Queue = require('bull');
// const RedisPort = parseInt(process.env.RedisPort);
// const RedisHost =process.env.RedisHost;
const RedisUrl = process.env.RedisUrl;
const queue = new Queue('signUpOTPQueue',RedisUrl);
// parallel jobs queue for sending email otps
// const queue = new Queue('signUpOTPQueue',{
//     redis: {
//         port: RedisPort, // Redis port
//         host: RedisHost // Redis host
//       }
// });

// Listen for completed jobs
queue.on('completed', (job) => {
    // console.log(`Job ${job.id} completed successfully`);
  });
  
  // Listen for failed jobs
  queue.on('failed', (job, error) => {
    console.error(`Job ${job.id} failed with error: ${error.message}`);
  });
  
  // Listen for job waiting
  queue.on('waiting', (jobId) => {
    // console.log(`Job ${jobId} is waiting`);
  });
  
  // Listen for job progress (if applicable)
  queue.on('progress', (job, progress) => {
    // console.log(`Job ${job.id} is ${progress}% complete`);
  });
  
  // Listen for job stalled (if applicable)
  queue.on('stalled', (job) => {
    console.warn(`Job ${job.id} has stalled`);
  });
  
  // Listen for job removed (if applicable)
  queue.on('removed', (job) => {
    console.log(`Job ${job.id} has been removed`);
  });

module.exports = queue;

