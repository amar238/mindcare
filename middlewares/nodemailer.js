const nodemailer = require('nodemailer')
const path = require('path')
const ejs = require('ejs');

// Credientials //
const service = process.env.transporter_service;
const host=process.env.transporter_host; 
const port=parseInt(process.env.transporter_port);
const secure=process.env.transporter_secure;
const user=process.env.transporter_user;
const password=process.env.transporter_password;

// transporter for sending email otp
let transporter = nodemailer.createTransport({
    service: service,
    host: host,
    port: port,
    secure: secure,
    auth: {
        user: user,
        pass: password
    }
});

// render email body in string
let renderTemplate = (data,relativePath)=>{
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname,'../views',relativePath),
        data,
        (err,template)=>{
            if(err){
                console.log("Error in rendering template",err);
                return;
            }
            mailHTML = template;
        }
    );
    // string will be returned
    return mailHTML;
}

module.exports = {
    transporter:transporter,
    renderTemplate:renderTemplate 
};