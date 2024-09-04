const mongoose = require("mongoose");
const path = require("path");

const patientSchama = new mongoose.Schema(
    {
        firstName: {
            type: String,
            require: true,
            trim: true,
        },
        lastName: {
            type: String,
            require: true,
            trim: true,
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
        emergencyContact: {
            name: { type: String, required: true, trim: true },
            relation: { type: String, required: true, trim: true },
            contactNumber: { type: String, required: true, trim: true }
        },
        password: {
            type: String,
            require: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true,
        },
        address: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            zipCode: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
        },
    },
    {
        timestamps: true,
    }
);

const Patient = mongoose.model("Patient", patientSchama);
module.exports = Patient;
