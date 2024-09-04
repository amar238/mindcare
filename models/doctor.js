const mongoose = require('mongoose')

const doctorSchama = new mongoose.Schema(
    {
        firstName: {
            type: String,
            trim: true,
            require: true,
        },
        lastName: {
            type: String,
            trim: true,
            require: true,
        },
        email: {
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
            require: false,
            match: [/^\d{10}$/],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            require: true,
        },
        specialization: {
            type: String,
            trim: true,
            require: true,
        },
        officeAddress: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            zipCode: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
        },
        licenseNumber:{
            type: String,
            require: false,
            unique: true,
            trim: true,
        },
        verfied:{
            type: Boolean,
            default: false,
        },
        isAdmin:{
            type: Boolean,
            default: false
        }
},{
    timestamps:true
});

const Doctor = mongoose.model("Doctor",doctorSchama);
module.exports = Doctor;