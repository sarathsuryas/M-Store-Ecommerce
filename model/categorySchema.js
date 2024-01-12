const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName:{
    type:String,
   required:true,
  },
  description:{
    type:String,
    required:true
  },
  isListed:{
    type:Boolean,
    default:true
  }
})

const Category = mongoose.model('categories',categorySchema)

module.exports = Category

