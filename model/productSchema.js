const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'categories',
    required:true
  },
  stock:{
    type:Number,
    required:true
  },
  discount:{
    type:Number,
    default:0
  },
  coverImage:{
    type:String,
    required:true
  },
  productImages:{
    type:Array,
    required:true
  },
  isListed:{
    type:Boolean,
    default:true
  },
  
},{
  timestamps:true
})




const Product = mongoose.model('products',productSchema)

module.exports = Product;