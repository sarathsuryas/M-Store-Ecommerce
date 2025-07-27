const mongoose = require('mongoose')

const walletBalanceSchema = new mongoose.Schema({
  userId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'users'
  },
 
  amount : {
    type : Number,
    default:0
}
},
{
  timestamps:true
}
)

const WalletBalance = mongoose.model('walletBalance',walletBalanceSchema)

module.exports = WalletBalance