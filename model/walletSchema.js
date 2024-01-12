const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema({
  userId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'users'
  },
  amount : {
    type : Number
}
})

const Wallet = mongoose.model('wallet',walletSchema)

module.exports = Wallet