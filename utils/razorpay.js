const Razorpay = require('razorpay')

var razorpay = new Razorpay({
  key_id: process.env.razorpay_key_id ,
  key_secret: process.env.razorpay_key_secret,
});

module.exports = razorpay