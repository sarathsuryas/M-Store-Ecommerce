const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
userId:{
type:mongoose.Schema.Types.ObjectId,
ref:'users',
required:true
},
cartTotal:Number,
totalShipment:Number,
products:[{
  productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'products',
    required:true
  },
  quantity:{
    type:Number,
    required:true,
    default:1
  },
  total:{
    type:Number,
    default:0
  },
  
}]

},{
  timestamps:true
})

const Cart = mongoose.model('cart',cartSchema)

module.exports = Cart

