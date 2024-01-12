const mongoose = require('mongoose');

const otpAuth = new mongoose.Schema({
  name:{
    type:String,
    required:true,
    unique:true
  },
  otp:{
    type:Number,
    required:true,
    unique:true
  }
})

const OTP= mongoose.model('otp',otpAuth)

module.exports = {OTP};