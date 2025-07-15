const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code:{
      type: String,
      unique: true,
      required: true,
    },
    discountType:{
      type:String,
      enum:['percentage','fixedAmount'],
      required:true
    },
    discountAmtOrPercentage:{
      type:Number,
      required:true
    },
    minOrderAmount: {
      type:Number,
      default:0
    },
    maxRedeemableAmt:{
      type:Number,
      default:0
    },
    expirationDate: {
      type:Date,
      required:true
    },
    isActive: {
      type:String,
      enum:['Active','inActive'],
      default:"Active"
    },
    redeemedUsers:[{
      type: mongoose.Schema.Types.ObjectId,
      ref:"users"
    }],

},
{
  timestamps: true 
}
)

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = Coupon;