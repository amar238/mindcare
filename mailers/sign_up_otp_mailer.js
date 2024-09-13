const nodemailer = require('../middlewares/nodemailer');

//sending email otp
module.exports.emailSignUpOTP =async(OTP)=>{
    const server_email = process.env.server_email;
    let htmlString = nodemailer.renderTemplate({otp:OTP.otp},'/email_templates/signup_otp.ejs');

    const mailOptions = {
        from: server_email,
        to: OTP.to,
        subject: 'Verification OTP',
        html: htmlString
    };
    
    await nodemailer.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).send('Failed to send OTP');
        } else {
          res.status(200).send('OTP sent successfully');
        }
    });
}
