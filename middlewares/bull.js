const Queue = require('bull');
// const RedisPort = parseInt(process.env.RedisPort);
// const RedisHost =process.env.RedisHost;
const RedisUrl = process.env.RedisUrl;
const queue = new Queue('signUpOTPQueue', RedisUrl);

module.exports = queue;

