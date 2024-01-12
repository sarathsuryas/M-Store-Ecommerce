const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'users',
    required:true,
  },
  address:[{
    name:{
      type:String,
      required:true,
    },
    mobile:{
      type:Number,
    },
    homeAddress:{
      type:String,
    },
    pinCode:{
      type:Number,
    },
   locality:{
    type:String
    },
    city:{
      type:String
    },
    state:{
      type:String,
    },
    altPhone:{
      type:Number
    },
    isDefault:{
      type:Boolean,
      default:false
    }
  }]
},{
  timestamps:true
})

const Address = mongoose.model('address',addressSchema)

module.exports = Address;