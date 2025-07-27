const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
  userId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'users'
  },
  orderId:{
    type : mongoose.Schema.Types.ObjectId,
     ref : 'orders'
  },
  productId:{
     type : mongoose.Schema.Types.ObjectId,
     ref : 'products'
  },
  coupounId:{
     type : mongoose.Schema.Types.ObjectId,
     ref : 'coupons'
  },
  status:{
      type:Boolean,
      default:false
  },
  amount : {
    type : Number
}
},
{
  timestamps:true
}
)

const Wallet = mongoose.model('wallet',walletSchema)

module.exports = Wallet