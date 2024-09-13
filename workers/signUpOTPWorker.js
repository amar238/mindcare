const queue = require('../middlewares/bull');
const signUpOTPMailer = require('../mailers/sign_up_otp_mailer');

// processing job of sending email otp
queue.process(async (job, done) => {
    try {
      await signUpOTPMailer.emailSignUpOTP(job.data); // Process job data
      done(); // Mark job as done
    } catch (error) {
      console.error('Error processing job:', error); // Log any errors
      done(error); // Mark job as failed
    }
  });
